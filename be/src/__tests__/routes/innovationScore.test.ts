// TC-46 → TC-53 — see docs/test-plans/TP-03-BE-ai-routes.md
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { innovationScoreRouter } from '../../routes/innovationScore.js';

// ── Mock Anthropic SDK ────────────────────────────────────────────────────────

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/', innovationScoreRouter);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeClaudeResponse(text: string) {
  return { content: [{ type: 'text', text }] };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/innovation-score', () => {
  it('TC-46: returns 400 when title is missing', async () => {
    const res = await request(app).post('/').send({ content: 'some content' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('TC-47: returns 400 when content is missing', async () => {
    const res = await request(app).post('/').send({ title: 'some title' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('TC-48: parses score and reasoning from Claude response', async () => {
    mockCreate.mockResolvedValue(
      makeClaudeResponse('SCORE: 7\nREASONING: This is a great idea with novel approach.'),
    );

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ score: 7, reasoning: 'This is a great idea with novel approach.' });
  });

  it('TC-49: clamps score to minimum of 1', async () => {
    mockCreate.mockResolvedValue(
      makeClaudeResponse('SCORE: 0\nREASONING: Completely unoriginal.'),
    );

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(1);
  });

  it('TC-50: clamps score to maximum of 10', async () => {
    mockCreate.mockResolvedValue(
      makeClaudeResponse('SCORE: 15\nREASONING: Beyond breakthrough.'),
    );

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(10);
  });

  it('TC-51: returns empty reasoning when REASONING line is missing', async () => {
    mockCreate.mockResolvedValue(makeClaudeResponse('SCORE: 5'));

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(200);
    expect(res.body.reasoning).toBe('');
  });

  it('TC-52: returns 500 when SCORE line is missing', async () => {
    mockCreate.mockResolvedValue(makeClaudeResponse('REASONING: No score here'));

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('TC-53: returns 500 when Claude SDK throws', async () => {
    mockCreate.mockRejectedValue(new Error('API quota exceeded'));

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'API quota exceeded');
  });
});
