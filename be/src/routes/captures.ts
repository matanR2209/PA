import { Router, Request, Response } from 'express';
import { prisma } from '../db/client.js';
import type { Prisma } from '@prisma/client';

const router = Router();

// ── Types ────────────────────────────────────────────────────────────────────

type CaptureWithRelations = Prisma.CaptureGetPayload<{
  include: { notes: true; recordings: true; labels: true; actionItems: true };
}>;

interface ClientCapture {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  meta: Record<string, unknown>;
  notes: Array<{ id: string; text: string; createdAt: string }>;
  recordings: Array<{ url: string; size: number; mimeType: string }>;
}

interface RawActionItem {
  id?: string;
  text: string;
  status?: string;
  createdAt?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Pull out fields that are now proper DB columns so they aren't double-stored
 * in the meta JSON blob.
 */
export function extractFromMeta(meta: Record<string, unknown> = {}): {
  priority:    string | null;
  dueDate:     Date | null;
  labelIds:    string[];
  actionItems: RawActionItem[];
  cleanMeta:   Record<string, unknown>;
} {
  const { priority, dueDate, labels, actionItems, ...rest } =
    meta as {
      priority?:    string;
      dueDate?:     string;
      labels?:      string[];
      actionItems?: RawActionItem[];
    } & Record<string, unknown>;

  return {
    priority:    priority ?? null,
    dueDate:     dueDate ? new Date(dueDate) : null,
    labelIds:    Array.isArray(labels) ? labels : [],
    actionItems: Array.isArray(actionItems) ? actionItems : [],
    cleanMeta:   rest,
  };
}

/** Serialize a DB capture back to the shape the frontend expects. */
function serialize(c: CaptureWithRelations): ClientCapture {
  const base = (c.meta as Record<string, unknown>) ?? {};
  const labelIds = c.labels.map(cl => cl.labelId);

  // Merge real columns back into meta so the frontend needs zero changes
  const meta: Record<string, unknown> = { ...base };
  if (c.priority)              meta.priority    = c.priority;
  if (c.dueDate)               meta.dueDate     = c.dueDate.toISOString().split('T')[0];
  if (labelIds.length > 0)     meta.labels      = labelIds;
  if (c.actionItems.length > 0) {
    meta.actionItems = c.actionItems
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(ai => ({
        id:        ai.id,
        text:      ai.text,
        status:    ai.status,
        createdAt: ai.createdAt.toISOString(),
      }));
  }

  return {
    id:         c.id,
    title:      c.title,
    content:    c.content,
    type:       c.type,
    category:   c.category,
    createdAt:  c.createdAt.toISOString(),
    updatedAt:  c.updatedAt.toISOString(),
    recordings: c.recordings.map(r => ({ url: r.url, size: r.size, mimeType: r.mimeType })),
    notes:      c.notes
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(n => ({ id: n.id, text: n.text, createdAt: n.createdAt.toISOString() })),
    meta,
  };
}

const INCLUDE = {
  notes: true, recordings: true, labels: true, actionItems: true,
} as const;

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? null;

// ── GET /api/captures ────────────────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response) => {
  try {
    const captures = await prisma.capture.findMany({
      where:   DEFAULT_USER_ID ? { userId: DEFAULT_USER_ID } : {},
      include:  INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    res.json(captures.map(serialize));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch captures' });
  }
});

// ── GET /api/captures/:id ────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const capture = await prisma.capture.findUnique({
      where:   { id: req.params.id },
      include: INCLUDE,
    });
    if (!capture) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(serialize(capture));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch capture' });
  }
});

// ── POST /api/captures ───────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content = '', type = 'idea', category = null, meta = {}, notes = [], recordings = [] } =
      req.body as Partial<ClientCapture>;

    const { priority, dueDate, labelIds, actionItems, cleanMeta } = extractFromMeta(meta);

    const capture = await prisma.capture.create({
      data: {
        title:      title ?? 'Untitled',
        content,
        type,
        category,
        priority,
        dueDate,
        meta:       cleanMeta,
        userId:     DEFAULT_USER_ID,
        notes:      { create: (notes as Array<{ id?: string; text: string; createdAt?: string }>).map(n => ({
          id:        n.id,
          text:      n.text,
          createdAt: n.createdAt ? new Date(n.createdAt) : undefined,
        }))},
        recordings: { create: (recordings as Array<{ url: string; size: number; mimeType: string }>).map(r => ({
          url: r.url, size: r.size, mimeType: r.mimeType,
        }))},
        labels:      { create: labelIds.map(id => ({ labelId: id })) },
        actionItems: { create: actionItems.map(ai => ({
          id:        ai.id,
          text:      ai.text,
          status:    ai.status ?? 'todo',
          createdAt: ai.createdAt ? new Date(ai.createdAt) : undefined,
        }))},
      },
      include: INCLUDE,
    });

    res.status(201).json(serialize(capture));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create capture' });
  }
});

// ── PUT /api/captures/:id ────────────────────────────────────────────────────

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { title, content, type, category, meta = {}, recordings = [] } =
      req.body as Partial<ClientCapture>;

    // Only replace notes when the caller explicitly sends the array.
    // If omitted (e.g. mobile sends a title-only PUT), existing notes are preserved.
    const rawNotes = (req.body as Record<string, unknown>).notes;
    const notes = Array.isArray(rawNotes) ? rawNotes as Array<{ id?: string; text: string; createdAt?: string }> : undefined;

    const { priority, dueDate, labelIds, actionItems, cleanMeta } = extractFromMeta(meta);

    const capture = await prisma.$transaction(async (tx) => {
      await tx.capture.update({
        where: { id },
        data: {
          ...(title    !== undefined && { title }),
          ...(content  !== undefined && { content }),
          ...(type     !== undefined && { type }),
          ...(category !== undefined && { category }),
          priority,
          dueDate,
          meta: cleanMeta,
        },
      });

      // Replace notes only when explicitly provided — omitting notes preserves existing ones
      if (notes !== undefined) {
        await tx.note.deleteMany({ where: { captureId: id } });
        if (notes.length > 0) {
          await tx.note.createMany({
            data: notes.map(n => ({
              id:        n.id ?? undefined,
              text:      n.text,
              captureId: id,
              createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            })),
          });
        }
      }

      // Replace recordings
      await tx.recording.deleteMany({ where: { captureId: id } });
      if ((recordings as unknown[]).length > 0) {
        await tx.recording.createMany({
          data: (recordings as Array<{ url: string; size: number; mimeType: string }>).map(r => ({
            url: r.url, size: r.size, mimeType: r.mimeType, captureId: id,
          })),
        });
      }

      // Sync labels
      await tx.captureLabel.deleteMany({ where: { captureId: id } });
      if (labelIds.length > 0) {
        await tx.captureLabel.createMany({
          data: labelIds.map(labelId => ({ captureId: id, labelId })),
          skipDuplicates: true,
        });
      }

      // Sync action items
      await tx.actionItem.deleteMany({ where: { captureId: id } });
      if (actionItems.length > 0) {
        await tx.actionItem.createMany({
          data: actionItems.map(ai => ({
            id:        ai.id ?? undefined,
            text:      ai.text,
            status:    ai.status ?? 'todo',
            captureId: id,
            createdAt: ai.createdAt ? new Date(ai.createdAt) : new Date(),
          })),
        });
      }

      return tx.capture.findUniqueOrThrow({ where: { id }, include: INCLUDE });
    });

    res.json(serialize(capture));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update capture' });
  }
});

// ── DELETE /api/captures/:id ─────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.capture.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete capture' });
  }
});

export { router as capturesRouter };
