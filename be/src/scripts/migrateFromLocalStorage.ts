/**
 * One-time migration: localStorage → Neon DB
 *
 * How to use:
 * 1. Open your browser (with the app loaded) and run this in the console:
 *
 *    copy(localStorage.getItem('ideapa_captures'))
 *    copy(localStorage.getItem('ideapa_labels'))
 *
 * 2. Paste each into the files below:
 *    be/src/scripts/data/captures.json
 *    be/src/scripts/data/labels.json
 *
 * 3. Make sure DATABASE_URL and DIRECT_URL are set in be/.env
 *
 * 4. Run:
 *    cd be && npx tsx src/scripts/migrateFromLocalStorage.ts
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Types (mirrors frontend) ──────────────────────────────────────────────────

interface RawNote     { id: string; text: string; createdAt: string }
interface RawRecording{ url: string; size: number; mimeType: string }
interface RawCapture  {
  id: string; title: string; content: string;
  type?: string; category?: string | null;
  createdAt: string; updatedAt?: string;
  notes?: RawNote[]; recordings?: RawRecording[];
  meta?: Record<string, unknown>;
}
interface RawLabel    { id: string; name: string; color: string }

// ── Load data files ───────────────────────────────────────────────────────────

function loadJson<T>(filename: string, fallback: T): T {
  try {
    const p = resolve(dirname(fileURLToPath(import.meta.url)), 'data', filename);
    return JSON.parse(readFileSync(p, 'utf8')) as T;
  } catch {
    console.warn(`⚠️  data/${filename} not found — skipping`);
    return fallback;
  }
}

const rawCaptures = loadJson<RawCapture[]>('captures.json', []);
const rawLabels   = loadJson<RawLabel[]>('labels.json', []);

// ── Migrate labels ────────────────────────────────────────────────────────────

async function migrateLabels(): Promise<Map<string, string>> {
  const oldIdToNewId = new Map<string, string>();
  console.log(`\n📌 Migrating ${rawLabels.length} label(s)…`);

  for (const l of rawLabels) {
    const saved = await prisma.label.upsert({
      where:  { name: l.name },
      update: { color: l.color },
      create: { name: l.name, color: l.color },
    });
    oldIdToNewId.set(l.id, saved.id);
    console.log(`  ✓ label "${l.name}" → ${saved.id}`);
  }
  return oldIdToNewId;
}

// ── Migrate captures ──────────────────────────────────────────────────────────

async function migrateCaptures(labelMap: Map<string, string>): Promise<void> {
  console.log(`\n📦 Migrating ${rawCaptures.length} capture(s)…`);

  for (const c of rawCaptures) {
    // Pull label IDs out of meta and remap to new IDs
    const meta = { ...(c.meta ?? {}) };
    const oldLabelIds: string[] = Array.isArray(meta['labels']) ? (meta['labels'] as string[]) : [];
    delete meta['labels'];

    const newLabelIds = oldLabelIds
      .map(id => labelMap.get(id))
      .filter((id): id is string => id !== undefined);

    // Check if already exists (idempotent)
    const exists = await prisma.capture.findUnique({ where: { id: c.id } });
    if (exists) {
      console.log(`  ⏭  capture "${c.title}" already exists — skipping`);
      continue;
    }

    await prisma.capture.create({
      data: {
        id:        c.id,
        title:     c.title,
        content:   c.content ?? '',
        type:      c.type ?? 'idea',
        category:  c.category ?? null,
        meta,
        createdAt: new Date(c.createdAt),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(c.createdAt),
        notes: {
          create: (c.notes ?? []).map(n => ({
            id:        n.id,
            text:      n.text,
            createdAt: new Date(n.createdAt),
          })),
        },
        recordings: {
          create: (c.recordings ?? []).map(r => ({
            url:      r.url,
            size:     r.size,
            mimeType: r.mimeType,
          })),
        },
        labels: {
          create: newLabelIds.map(labelId => ({ labelId })),
        },
      },
    });
    console.log(`  ✓ "${c.title}" (${c.id})`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🚀 Starting localStorage → Neon migration…');
  const labelMap = await migrateLabels();
  await migrateCaptures(labelMap);
  console.log('\n✅ Migration complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
