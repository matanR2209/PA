// TC-117 → TC-125 — see docs/test-plans/TP-10-BE-action-items-api.md
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { actionItemsRouter } from '../../routes/actionItems.js';
import { makeActionItem, CAPTURE_ID, ITEM_ID } from '../fixtures.js';

// ── Mock Prisma ───────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  actionItem: {
    findUnique: vi.fn(),
    update:     vi.fn(),
  },
}));

vi.mock('../../db/client.js', () => ({ prisma: mockPrisma }));

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/:captureId/action-items', actionItemsRouter);

beforeEach(() => vi.clearAllMocks());

// ── PATCH /:captureId/action-items/:itemId ────────────────────────────────────

describe('PATCH /:captureId/action-items/:itemId', () => {
  it('TC-117: updates status to done', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue(makeActionItem());
    mockPrisma.actionItem.update.mockResolvedValue(makeActionItem({ status: 'done' }));

    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
  });

  it('TC-118: updates status to in-progress', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue(makeActionItem());
    mockPrisma.actionItem.update.mockResolvedValue(makeActionItem({ status: 'in-progress' }));

    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({ status: 'in-progress' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in-progress');
  });

  it('TC-119: updates status to todo', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue(makeActionItem({ status: 'done' }));
    mockPrisma.actionItem.update.mockResolvedValue(makeActionItem({ status: 'todo' }));

    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({ status: 'todo' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('todo');
  });

  it('TC-120: returns 400 when status is missing', async () => {
    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockPrisma.actionItem.update).not.toHaveBeenCalled();
  });

  it('TC-121: returns 400 when status is not a valid value', async () => {
    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({ status: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/todo.*in-progress.*done/);
    expect(mockPrisma.actionItem.update).not.toHaveBeenCalled();
  });

  it('TC-122: returns 404 when action item does not exist', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({ status: 'done' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Action item not found');
    expect(mockPrisma.actionItem.update).not.toHaveBeenCalled();
  });

  it('TC-123: returns 404 when item belongs to a different capture', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue(makeActionItem({ captureId: 'other-cap' }));

    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({ status: 'done' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Action item not found');
    expect(mockPrisma.actionItem.update).not.toHaveBeenCalled();
  });

  it('TC-124: response includes all expected fields', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue(makeActionItem());
    mockPrisma.actionItem.update.mockResolvedValue(makeActionItem({ status: 'done' }));

    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('text');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('TC-125: returns 500 on DB error', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue(makeActionItem());
    mockPrisma.actionItem.update.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .patch(`/${CAPTURE_ID}/action-items/${ITEM_ID}`)
      .send({ status: 'done' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
