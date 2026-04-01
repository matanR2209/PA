// TC-107 → TC-116 — see docs/test-plans/TP-09-BE-notes-api.md
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { notesRouter } from '../../routes/notes.js';
import { makeNote, CAPTURE_ID, NOTE_ID } from '../fixtures.js';

// ── Mock Prisma ───────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  capture: { findUnique: vi.fn() },
  note:    { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../db/client.js', () => ({ prisma: mockPrisma }));

// ── Test app ──────────────────────────────────────────────────────────────────

// mergeParams requires mounting under a parent router that provides :captureId
const app = express();
app.use(express.json());
app.use('/:captureId/notes', notesRouter);

beforeEach(() => vi.clearAllMocks());

// ── POST /:captureId/notes ────────────────────────────────────────────────────

describe('POST /:captureId/notes', () => {
  it('TC-107: creates note and returns it', async () => {
    mockPrisma.capture.findUnique.mockResolvedValue({ id: CAPTURE_ID });
    mockPrisma.note.create.mockResolvedValue(makeNote());

    const res = await request(app)
      .post(`/${CAPTURE_ID}/notes`)
      .send({ text: 'My note' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: NOTE_ID, text: 'My note' });
    expect(res.body.createdAt).toBeDefined();
  });

  it('TC-108: returns 400 when text is missing', async () => {
    const res = await request(app)
      .post(`/${CAPTURE_ID}/notes`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockPrisma.note.create).not.toHaveBeenCalled();
  });

  it('TC-109: returns 400 when text is blank whitespace', async () => {
    const res = await request(app)
      .post(`/${CAPTURE_ID}/notes`)
      .send({ text: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockPrisma.note.create).not.toHaveBeenCalled();
  });

  it('TC-110: returns 404 when capture does not exist', async () => {
    mockPrisma.capture.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post(`/${CAPTURE_ID}/notes`)
      .send({ text: 'Hello' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Capture not found');
    expect(mockPrisma.note.create).not.toHaveBeenCalled();
  });

  it('TC-111: trims whitespace from text before saving', async () => {
    mockPrisma.capture.findUnique.mockResolvedValue({ id: CAPTURE_ID });
    mockPrisma.note.create.mockResolvedValue(makeNote({ text: 'hello' }));

    await request(app)
      .post(`/${CAPTURE_ID}/notes`)
      .send({ text: '  hello  ' });

    expect(mockPrisma.note.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ text: 'hello' }) }),
    );
  });

  it('TC-112: returns 500 on DB error', async () => {
    mockPrisma.capture.findUnique.mockResolvedValue({ id: CAPTURE_ID });
    mockPrisma.note.create.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .post(`/${CAPTURE_ID}/notes`)
      .send({ text: 'Hello' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ── DELETE /:captureId/notes/:noteId ─────────────────────────────────────────

describe('DELETE /:captureId/notes/:noteId', () => {
  it('TC-113: returns 204 on success', async () => {
    mockPrisma.note.findUnique.mockResolvedValue(makeNote());
    mockPrisma.note.delete.mockResolvedValue({});

    const res = await request(app).delete(`/${CAPTURE_ID}/notes/${NOTE_ID}`);

    expect(res.status).toBe(204);
    expect(mockPrisma.note.delete).toHaveBeenCalledWith({ where: { id: NOTE_ID } });
  });

  it('TC-114: returns 404 when note does not exist', async () => {
    mockPrisma.note.findUnique.mockResolvedValue(null);

    const res = await request(app).delete(`/${CAPTURE_ID}/notes/${NOTE_ID}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Note not found');
    expect(mockPrisma.note.delete).not.toHaveBeenCalled();
  });

  it('TC-115: returns 404 when note belongs to a different capture', async () => {
    mockPrisma.note.findUnique.mockResolvedValue(makeNote({ captureId: 'other-capture' }));

    const res = await request(app).delete(`/${CAPTURE_ID}/notes/${NOTE_ID}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Note not found');
    expect(mockPrisma.note.delete).not.toHaveBeenCalled();
  });

  it('TC-116: returns 500 on DB error', async () => {
    mockPrisma.note.findUnique.mockResolvedValue(makeNote());
    mockPrisma.note.delete.mockRejectedValue(new Error('DB down'));

    const res = await request(app).delete(`/${CAPTURE_ID}/notes/${NOTE_ID}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
