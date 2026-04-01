// TC-100 → TC-106 — see docs/test-plans/TP-06-FE-use-innovation-score.md
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useInnovationScore } from '../../hooks/useInnovationScore';

// ── MSW server ────────────────────────────────────────────────────────────────

const API = '*/api/innovation-score';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useInnovationScore', () => {
  it('TC-100: starts in idle state with null values', () => {
    const { result } = renderHook(() => useInnovationScore());

    expect(result.current.state).toBe('idle');
    expect(result.current.score).toBeNull();
    expect(result.current.reasoning).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('TC-101: transitions to loading immediately after run()', async () => {
    server.use(http.post(API, async () => {
      await new Promise(r => setTimeout(r, 50));
      return HttpResponse.json({ score: 7, reasoning: 'Great' });
    }));

    const { result } = renderHook(() => useInnovationScore());

    act(() => { result.current.run('Title', 'Content'); });
    expect(result.current.state).toBe('loading');
  });

  it('TC-102: sets score + reasoning and transitions to done on success', async () => {
    server.use(http.post(API, () =>
      HttpResponse.json({ score: 8, reasoning: 'Very innovative idea.' }),
    ));

    const { result } = renderHook(() => useInnovationScore());

    act(() => { result.current.run('Title', 'Content'); });
    await waitFor(() => expect(result.current.state).toBe('done'));

    expect(result.current.score).toBe(8);
    expect(result.current.reasoning).toBe('Very innovative idea.');
    expect(result.current.error).toBeNull();
  });

  it('TC-103: transitions to error on non-ok server response', async () => {
    server.use(http.post(API, () =>
      HttpResponse.json({ error: 'Bad input' }, { status: 500 }),
    ));

    const { result } = renderHook(() => useInnovationScore());

    act(() => { result.current.run('Title', 'Content'); });
    await waitFor(() => expect(result.current.state).toBe('error'));

    expect(result.current.error).toMatch(/500/);
    expect(result.current.score).toBeNull();
  });

  it('TC-104: transitions to error on network failure', async () => {
    server.use(http.post(API, () => HttpResponse.error()));

    const { result } = renderHook(() => useInnovationScore());

    act(() => { result.current.run('Title', 'Content'); });
    await waitFor(() => expect(result.current.state).toBe('error'));

    expect(result.current.error).not.toBeNull();
  });

  it('TC-105: clears score and reasoning when re-running', async () => {
    // First successful run
    server.use(http.post(API, () =>
      HttpResponse.json({ score: 5, reasoning: 'Average' }),
    ));

    const { result } = renderHook(() => useInnovationScore());
    act(() => { result.current.run('Title', 'Content'); });
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(result.current.score).toBe(5);

    // Second run — slow response so we can check loading state
    server.use(http.post(API, async () => {
      await new Promise(r => setTimeout(r, 50));
      return HttpResponse.json({ score: 9, reasoning: 'Excellent' });
    }));

    act(() => { result.current.run('Title 2', 'Content 2'); });
    expect(result.current.score).toBeNull();
    expect(result.current.state).toBe('loading');
  });

  it('TC-106: reset() clears all state back to idle', async () => {
    server.use(http.post(API, () =>
      HttpResponse.json({ score: 7, reasoning: 'Good' }),
    ));

    const { result } = renderHook(() => useInnovationScore());
    act(() => { result.current.run('Title', 'Content'); });
    await waitFor(() => expect(result.current.state).toBe('done'));

    act(() => { result.current.reset(); });

    expect(result.current.state).toBe('idle');
    expect(result.current.score).toBeNull();
    expect(result.current.reasoning).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
