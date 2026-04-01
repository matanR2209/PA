// TC-39 → TC-45 — see docs/test-plans/TP-03-BE-ai-routes.md
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { analyseIdeaRouter } from '../../routes/analyseIdea.js';

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
app.use('/', analyseIdeaRouter);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeClaudeResponse(text: string) {
  return { content: [{ type: 'text', text }] };
}

const validAnalysis = {
  audienceDescription: 'Target audience',
  keyRisks: ['risk1', 'risk2'],
  additionalConcerns: 'Some concerns',
  verdict: 'Looks good',
  actionItems: ['do this', 'do that'],
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/analyse-idea', () => {
  it('TC-39: returns 400 when title is missing', async () => {
    const res = await request(app).post('/').send({ content: 'some content' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('TC-40: returns 400 when content is missing', async () => {
    const res = await request(app).post('/').send({ title: 'some title' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('TC-41: parses and returns valid JSON response from Claude', async () => {
    mockCreate.mockResolvedValue(makeClaudeResponse(JSON.stringify(validAnalysis)));

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(validAnalysis);
  });

  it('TC-42: strips markdown code fences before parsing', async () => {
    const fenced = '```json\n' + JSON.stringify(validAnalysis) + '\n```';
    mockCreate.mockResolvedValue(makeClaudeResponse(fenced));

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(validAnalysis);
  });

  it('TC-43: defaults missing fields to safe values', async () => {
    const partial = { audienceDescription: 'Audience', verdict: 'Good' };
    mockCreate.mockResolvedValue(makeClaudeResponse(JSON.stringify(partial)));

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(200);
    expect(res.body.keyRisks).toEqual([]);
    expect(res.body.actionItems).toEqual([]);
    expect(res.body.additionalConcerns).toBe('');
  });

  it('TC-44: returns 500 when Claude SDK throws', async () => {
    mockCreate.mockRejectedValue(new Error('Network error'));

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Network error');
  });

  it('TC-45: returns 500 when Claude returns non-JSON text', async () => {
    mockCreate.mockResolvedValue(makeClaudeResponse('This is not JSON at all'));

    const res = await request(app)
      .post('/')
      .send({ title: 'My Idea', content: 'Description here' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
