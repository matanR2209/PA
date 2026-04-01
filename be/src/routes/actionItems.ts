import { Router, Request, Response } from 'express';
import { prisma } from '../db/client.js';

const router = Router({ mergeParams: true }); // gives access to :captureId

const VALID_STATUSES = ['todo', 'in-progress', 'done'] as const;
type Status = typeof VALID_STATUSES[number];

// ── PATCH /api/captures/:captureId/action-items/:itemId ──────────────────────

router.patch('/:itemId', async (req: Request, res: Response) => {
  const { captureId, itemId } = req.params;
  const { status } = req.body as { status?: string };

  if (!status) {
    res.status(400).json({ error: 'status is required' });
    return;
  }

  if (!VALID_STATUSES.includes(status as Status)) {
    res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  try {
    const item = await prisma.actionItem.findUnique({ where: { id: itemId } });
    if (!item || item.captureId !== captureId) {
      res.status(404).json({ error: 'Action item not found' });
      return;
    }

    const updated = await prisma.actionItem.update({
      where: { id: itemId },
      data:  { status },
    });

    res.json({
      id:        updated.id,
      text:      updated.text,
      status:    updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update action item' });
  }
});

export { router as actionItemsRouter };
