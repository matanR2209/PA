import { Router, Request, Response } from 'express';
import { prisma } from '../db/client.js';

const router = Router({ mergeParams: true }); // gives access to :captureId

// ── POST /api/captures/:captureId/notes ──────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  const { captureId } = req.params;
  const { text } = req.body as { text?: string };

  if (!text || !text.trim()) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  try {
    // Ensure parent capture exists
    const capture = await prisma.capture.findUnique({ where: { id: captureId } });
    if (!capture) { res.status(404).json({ error: 'Capture not found' }); return; }

    const note = await prisma.note.create({
      data: { text: text.trim(), captureId },
    });

    res.status(201).json({
      id:        note.id,
      text:      note.text,
      createdAt: note.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// ── DELETE /api/captures/:captureId/notes/:noteId ────────────────────────────

router.delete('/:noteId', async (req: Request, res: Response) => {
  const { captureId, noteId } = req.params;

  try {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.captureId !== captureId) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    await prisma.note.delete({ where: { id: noteId } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export { router as notesRouter };
