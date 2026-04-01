// TC-28 → TC-38 — see docs/test-plans/TP-02-BE-labels-api.md
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { labelsRouter } from '../../routes/labels.js';
import { makeLabel, LABEL_ID } from '../fixtures.js';

// ── Mock Prisma ───────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  label: {
    findMany: vi.fn(),
    upsert:   vi.fn(),
    delete:   vi.fn(),
  },
}));

// Set env before module imports so the route picks it up at load time
vi.hoisted(() => { process.env.DEFAULT_USER_ID = 'usr_dev'; });

vi.mock('../../db/client.js', () => ({ prisma: mockPrisma }));

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/', labelsRouter);

// ── Reset mocks between tests ─────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── GET /api/labels ───────────────────────────────────────────────────────────

describe('GET /', () => {
  it('TC-28: returns labels sorted by name', async () => {
    const labels = [
      makeLabel({ id: 'l1', name: 'alpha' }),
      makeLabel({ id: 'l2', name: 'beta' }),
    ];
    mockPrisma.label.findMany.mockResolvedValue(labels);

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(labels);
    expect(mockPrisma.label.findMany).toHaveBeenCalledWith({
      where:   { userId: 'usr_dev' },
      orderBy: { name: 'asc' },
    });
  });

  it('TC-29: returns empty array when no labels', async () => {
    mockPrisma.label.findMany.mockResolvedValue([]);

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('TC-30: returns 500 on DB error', async () => {
    mockPrisma.label.findMany.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ── POST /api/labels ──────────────────────────────────────────────────────────

describe('POST /', () => {
  it('TC-31: creates label with name + color', async () => {
    const label = makeLabel();
    mockPrisma.label.upsert.mockResolvedValue(label);

    const res = await request(app)
      .post('/')
      .send({ name: 'bug', color: '#f00' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(label);
  });

  it('TC-32: returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/')
      .send({ color: '#f00' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockPrisma.label.upsert).not.toHaveBeenCalled();
  });

  it('TC-33: returns 400 when color is missing', async () => {
    const res = await request(app)
      .post('/')
      .send({ name: 'bug' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockPrisma.label.upsert).not.toHaveBeenCalled();
  });

  it('TC-34: upserts — updates color when name already exists', async () => {
    const updated = makeLabel({ color: '#new' });
    mockPrisma.label.upsert.mockResolvedValue(updated);

    const res = await request(app)
      .post('/')
      .send({ name: 'existing', color: '#new' });

    expect(res.status).toBe(201);
    expect(res.body.color).toBe('#new');
    expect(mockPrisma.label.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { color: '#new' },
        create: expect.objectContaining({ color: '#new' }),
      }),
    );
  });

  it('TC-35: trims whitespace from name before upsert', async () => {
    mockPrisma.label.upsert.mockResolvedValue(makeLabel());

    await request(app).post('/').send({ name: '  bug  ', color: '#f00' });

    expect(mockPrisma.label.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where:  { userId_name: { userId: 'usr_dev', name: 'bug' } },
        create: expect.objectContaining({ name: 'bug', userId: 'usr_dev' }),
      }),
    );
  });

  it('TC-36: returns 500 on DB error', async () => {
    mockPrisma.label.upsert.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .post('/')
      .send({ name: 'bug', color: '#f00' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ── DELETE /api/labels/:id ────────────────────────────────────────────────────

describe('DELETE /:id', () => {
  it('TC-37: returns 204 on success', async () => {
    mockPrisma.label.delete.mockResolvedValue({});

    const res = await request(app).delete(`/${LABEL_ID}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(mockPrisma.label.delete).toHaveBeenCalledWith({ where: { id: LABEL_ID } });
  });

  it('TC-38: returns 500 on DB error', async () => {
    mockPrisma.label.delete.mockRejectedValue(new Error('DB down'));

    const res = await request(app).delete(`/${LABEL_ID}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
