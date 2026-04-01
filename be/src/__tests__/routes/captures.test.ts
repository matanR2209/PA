// TC-08 → TC-27 — see docs/test-plans/TP-01-BE-captures-api.md
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { capturesRouter } from '../../routes/captures.js';
import { makeCapture } from '../fixtures.js';

// ── Mock Prisma ───────────────────────────────────────────────────────────────
// vi.hoisted ensures mockPrisma is available when vi.mock factory runs

const mockPrisma = vi.hoisted(() => ({
  capture: {
    findMany:          vi.fn(),
    findUnique:        vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create:            vi.fn(),
    update:            vi.fn(),
    delete:            vi.fn(),
  },
  note:         { deleteMany: vi.fn(), createMany: vi.fn() },
  recording:    { deleteMany: vi.fn(), createMany: vi.fn() },
  captureLabel: { deleteMany: vi.fn(), createMany: vi.fn() },
  actionItem:   { deleteMany: vi.fn(), createMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('../../db/client.js', () => ({ prisma: mockPrisma }));

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/', capturesRouter);

// ── Reset mocks between tests ─────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Default $transaction: run callback with mockPrisma as the tx argument
  mockPrisma.$transaction.mockImplementation(
    async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)
  );
});

// ── GET / ─────────────────────────────────────────────────────────────────────

describe('GET /api/captures', () => {
  // TC-08
  it('returns list of serialized captures', async () => {
    mockPrisma.capture.findMany.mockResolvedValue([makeCapture(), makeCapture({ id: 'cap2' })]);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  // TC-09
  it('returns empty array when no captures', async () => {
    mockPrisma.capture.findMany.mockResolvedValue([]);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // TC-10
  it('merges priority column back into meta', async () => {
    mockPrisma.capture.findMany.mockResolvedValue([makeCapture({ priority: 'high' })]);
    const res = await request(app).get('/');
    expect(res.body[0].meta.priority).toBe('high');
  });

  // TC-11
  it('merges dueDate back as YYYY-MM-DD string in meta', async () => {
    mockPrisma.capture.findMany.mockResolvedValue([
      makeCapture({ dueDate: new Date('2026-04-01T00:00:00Z') }),
    ]);
    const res = await request(app).get('/');
    expect(res.body[0].meta.dueDate).toBe('2026-04-01');
  });

  // TC-12
  it('returns 500 on DB error', async () => {
    mockPrisma.capture.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────────

describe('GET /api/captures/:id', () => {
  // TC-13
  it('returns capture when found', async () => {
    mockPrisma.capture.findUnique.mockResolvedValue(makeCapture());
    const res = await request(app).get('/cap1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('cap1');
  });

  // TC-14
  it('returns 404 when capture not found', async () => {
    mockPrisma.capture.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not found');
  });

  // TC-15
  it('returns 500 on DB error', async () => {
    mockPrisma.capture.findUnique.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/cap1');
    expect(res.status).toBe(500);
  });
});

// ── POST / ────────────────────────────────────────────────────────────────────

describe('POST /api/captures', () => {
  // TC-16
  it('creates capture and returns 201', async () => {
    const created = makeCapture({ title: 'New idea' });
    mockPrisma.capture.create.mockResolvedValue(created);
    const res = await request(app).post('/').send({ title: 'New idea', content: 'details' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New idea');
  });

  // TC-17
  it('extracts priority from meta into DB column', async () => {
    mockPrisma.capture.create.mockResolvedValue(makeCapture({ priority: 'medium' }));
    await request(app).post('/').send({ title: 'Task', meta: { priority: 'medium' } });
    const callArg = mockPrisma.capture.create.mock.calls[0][0];
    expect(callArg.data.priority).toBe('medium');
    expect(callArg.data.meta?.priority).toBeUndefined();
  });

  // TC-18
  it('extracts dueDate from meta into DB column as Date', async () => {
    mockPrisma.capture.create.mockResolvedValue(makeCapture());
    await request(app).post('/').send({ title: 'Task', meta: { dueDate: '2026-04-15' } });
    const callArg = mockPrisma.capture.create.mock.calls[0][0];
    expect(callArg.data.dueDate).toBeInstanceOf(Date);
    expect(callArg.data.meta?.dueDate).toBeUndefined();
  });

  // TC-19
  it('defaults title to Untitled when missing', async () => {
    mockPrisma.capture.create.mockResolvedValue(makeCapture({ title: 'Untitled' }));
    await request(app).post('/').send({ content: 'hello' });
    const callArg = mockPrisma.capture.create.mock.calls[0][0];
    expect(callArg.data.title).toBe('Untitled');
  });

  // TC-20
  it('creates action items in separate table, not in meta', async () => {
    const items = [{ id: 'ai1', text: 'Do thing', status: 'todo' }];
    mockPrisma.capture.create.mockResolvedValue(
      makeCapture({ actionItems: [{ id: 'ai1', text: 'Do thing', status: 'todo', captureId: 'cap1', createdAt: new Date(), updatedAt: new Date() }] })
    );
    await request(app).post('/').send({ title: 'Idea', meta: { actionItems: items } });
    const callArg = mockPrisma.capture.create.mock.calls[0][0];
    expect(callArg.data.actionItems.create).toHaveLength(1);
    expect(callArg.data.meta?.actionItems).toBeUndefined();
  });
});

// ── PUT /:id ──────────────────────────────────────────────────────────────────

describe('PUT /api/captures/:id', () => {
  beforeEach(() => {
    mockPrisma.capture.update.mockResolvedValue(undefined);
    mockPrisma.note.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.note.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.recording.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.recording.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.captureLabel.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.captureLabel.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.actionItem.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.actionItem.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.capture.findUniqueOrThrow.mockResolvedValue(makeCapture({ title: 'Updated' }));
  });

  // TC-21
  it('updates scalar fields', async () => {
    const res = await request(app).put('/cap1').send({ title: 'Updated title' });
    expect(res.status).toBe(200);
    expect(mockPrisma.capture.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cap1' }, data: expect.objectContaining({ title: 'Updated title' }) })
    );
  });

  // TC-22
  it('deletes then recreates action items in transaction', async () => {
    const items = [{ id: 'ai1', text: 'Step 1', status: 'todo' }];
    await request(app).put('/cap1').send({ meta: { actionItems: items } });
    expect(mockPrisma.actionItem.deleteMany).toHaveBeenCalledWith({ where: { captureId: 'cap1' } });
    expect(mockPrisma.actionItem.createMany).toHaveBeenCalled();
  });

  // TC-23
  it('deletes action items and skips createMany when array is empty', async () => {
    await request(app).put('/cap1').send({ meta: { actionItems: [] } });
    expect(mockPrisma.actionItem.deleteMany).toHaveBeenCalled();
    expect(mockPrisma.actionItem.createMany).not.toHaveBeenCalled();
  });

  // TC-24
  it('syncs labels via join table', async () => {
    await request(app).put('/cap1').send({ meta: { labels: ['l1', 'l2'] } });
    expect(mockPrisma.captureLabel.deleteMany).toHaveBeenCalledWith({ where: { captureId: 'cap1' } });
    expect(mockPrisma.captureLabel.createMany).toHaveBeenCalled();
  });

  // TC-25
  it('returns 200 with updated capture', async () => {
    const res = await request(app).put('/cap1').send({ title: 'New' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'cap1');
  });

  // TC-28-notes (bug fix: notes must NOT be wiped when omitted from PUT body)
  it('does NOT delete existing notes when notes field is absent from body', async () => {
    await request(app).put('/cap1').send({ title: 'Title only — no notes field' });
    expect(mockPrisma.note.deleteMany).not.toHaveBeenCalled();
    expect(mockPrisma.note.createMany).not.toHaveBeenCalled();
  });

  // TC-29-notes (existing notes field sent explicitly → should still replace)
  it('replaces notes when notes array is explicitly provided', async () => {
    const notes = [{ text: 'Explicit note' }];
    await request(app).put('/cap1').send({ notes });
    expect(mockPrisma.note.deleteMany).toHaveBeenCalledWith({ where: { captureId: 'cap1' } });
    expect(mockPrisma.note.createMany).toHaveBeenCalled();
  });

  // TC-30-notes (empty notes array sent explicitly → wipes notes, no createMany)
  it('wipes notes when an empty notes array is explicitly provided', async () => {
    await request(app).put('/cap1').send({ notes: [] });
    expect(mockPrisma.note.deleteMany).toHaveBeenCalledWith({ where: { captureId: 'cap1' } });
    expect(mockPrisma.note.createMany).not.toHaveBeenCalled();
  });
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────

describe('DELETE /api/captures/:id', () => {
  // TC-26
  it('returns 204 on success', async () => {
    mockPrisma.capture.delete.mockResolvedValue({});
    const res = await request(app).delete('/cap1');
    expect(res.status).toBe(204);
    expect(mockPrisma.capture.delete).toHaveBeenCalledWith({ where: { id: 'cap1' } });
  });

  // TC-27
  it('returns 500 on DB error', async () => {
    mockPrisma.capture.delete.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/cap1');
    expect(res.status).toBe(500);
  });
});
