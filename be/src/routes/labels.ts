import { Router, Request, Response } from 'express';
import { prisma } from '../db/client.js';

const router = Router();

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? null;

// ── GET /api/labels ──────────────────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response) => {
  try {
    const labels = await prisma.label.findMany({
      where:   DEFAULT_USER_ID ? { userId: DEFAULT_USER_ID } : {},
      orderBy: { name: 'asc' },
    });
    res.json(labels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

// ── POST /api/labels ─────────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body as { name: string; color: string };
    if (!name || !color) { res.status(400).json({ error: 'name and color are required' }); return; }
    if (!DEFAULT_USER_ID) { res.status(500).json({ error: 'No user context' }); return; }

    const label = await prisma.label.upsert({
      where:  { userId_name: { userId: DEFAULT_USER_ID, name: name.trim() } },
      update: { color },
      create: { name: name.trim(), color, userId: DEFAULT_USER_ID },
    });
    res.status(201).json(label);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create label' });
  }
});

// ── DELETE /api/labels/:id ───────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.label.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete label' });
  }
});

export { router as labelsRouter };
