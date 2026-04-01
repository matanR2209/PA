// TC-82 → TC-91 — see docs/test-plans/TP-04-FE-use-captures.md
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useCaptures } from '../../hooks/useCaptures';
import { makeCapture, CAPTURE_ID } from '../fixtures';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE = '*/api/captures';

// ── MSW server ────────────────────────────────────────────────────────────────

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useCaptures', () => {
  it('TC-82: fetches captures on mount', async () => {
    const captures = [makeCapture(), makeCapture({ id: 'cap2', title: 'Second' })];
    server.use(http.get(BASE, () => HttpResponse.json(captures)));

    const { result } = renderHook(() => useCaptures());

    await waitFor(() => expect(result.current.captures).toHaveLength(2));
    expect(result.current.captures[0].id).toBe(CAPTURE_ID);
  });

  it('TC-83: starts with empty array before fetch resolves', () => {
    server.use(http.get(BASE, async () => {
      await new Promise(r => setTimeout(r, 100));
      return HttpResponse.json([]);
    }));

    const { result } = renderHook(() => useCaptures());
    expect(result.current.captures).toEqual([]);
  });

  it('TC-84: addCapture adds optimistic capture with temp id immediately', async () => {
    server.use(
      http.get(BASE, () => HttpResponse.json([])),
      http.post(BASE, async () => {
        await new Promise(r => setTimeout(r, 50));
        return HttpResponse.json(makeCapture({ id: 'real1' }), { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCaptures());
    await waitFor(() => expect(result.current.captures).toEqual([]));

    act(() => { result.current.addCapture('Hello world'); });

    expect(result.current.captures).toHaveLength(1);
    expect(result.current.captures[0].id).toMatch(/^temp_/);
  });

  it('TC-85: swaps temp id for real id after POST resolves', async () => {
    const real = makeCapture({ id: 'real1' });
    server.use(
      http.get(BASE, () => HttpResponse.json([])),
      http.post(BASE, () => HttpResponse.json(real, { status: 201 })),
    );

    const { result } = renderHook(() => useCaptures());
    await waitFor(() => expect(result.current.captures).toEqual([]));

    act(() => { result.current.addCapture('Hello world'); });
    await waitFor(() => expect(result.current.captures[0].id).toBe('real1'));
  });

  it('TC-86: auto-generates title from first 5 words of content', async () => {
    let capturedBody: Record<string, unknown> = {};
    server.use(
      http.get(BASE, () => HttpResponse.json([])),
      http.post(BASE, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json(makeCapture({ id: 'r1', title: capturedBody.title as string }), { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCaptures());
    await waitFor(() => expect(result.current.captures).toEqual([]));

    act(() => { result.current.addCapture('one two three four five six seven'); });
    await waitFor(() => expect(result.current.captures[0].id).toBe('r1'));

    expect(capturedBody.title).toBe('one two three four five');
  });

  it('TC-87: updateCapture updates state optimistically before PUT resolves', async () => {
    const original = makeCapture({ id: CAPTURE_ID, title: 'Original' });
    server.use(
      http.get(BASE, () => HttpResponse.json([original])),
      http.put(`*/api/captures/${CAPTURE_ID}`, async () => {
        await new Promise(r => setTimeout(r, 50));
        return HttpResponse.json({ ...original, title: 'Updated' });
      }),
    );

    const { result } = renderHook(() => useCaptures());
    await waitFor(() => expect(result.current.captures).toHaveLength(1));

    act(() => { result.current.updateCapture({ ...original, title: 'Updated' }); });
    expect(result.current.captures[0].title).toBe('Updated');
  });

  it('TC-88: updateCapture syncs with server response', async () => {
    const original = makeCapture({ id: CAPTURE_ID, title: 'Original' });
    const serverVersion = { ...original, title: 'Server Title' };
    server.use(
      http.get(BASE, () => HttpResponse.json([original])),
      http.put(`*/api/captures/${CAPTURE_ID}`, () => HttpResponse.json(serverVersion)),
    );

    const { result } = renderHook(() => useCaptures());
    await waitFor(() => expect(result.current.captures).toHaveLength(1));

    act(() => { result.current.updateCapture({ ...original, title: 'Client Title' }); });
    await waitFor(() => expect(result.current.captures[0].title).toBe('Server Title'));
  });

  it('TC-89: removeCapture removes capture from state immediately', async () => {
    const capture = makeCapture();
    server.use(
      http.get(BASE, () => HttpResponse.json([capture])),
      http.delete(`*/api/captures/${CAPTURE_ID}`, () => new HttpResponse(null, { status: 204 })),
    );

    const { result } = renderHook(() => useCaptures());
    await waitFor(() => expect(result.current.captures).toHaveLength(1));

    act(() => { result.current.removeCapture(CAPTURE_ID); });
    expect(result.current.captures).toHaveLength(0);
  });

  it('TC-90: removeCapture calls DELETE on the API', async () => {
    let deleteWasCalled = false;
    server.use(
      http.get(BASE, () => HttpResponse.json([makeCapture()])),
      http.delete(`*/api/captures/${CAPTURE_ID}`, () => {
        deleteWasCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useCaptures());
    await waitFor(() => expect(result.current.captures).toHaveLength(1));

    act(() => { result.current.removeCapture(CAPTURE_ID); });
    await waitFor(() => expect(deleteWasCalled).toBe(true));
  });

  it('TC-91: refresh re-fetches captures from API', async () => {
    let callCount = 0;
    const second = [makeCapture({ id: 'cap2', title: 'Refreshed' })];
    server.use(
      http.get(BASE, () => {
        callCount++;
        return HttpResponse.json(callCount === 1 ? [] : second);
      }),
    );

    const { result } = renderHook(() => useCaptures());
    await waitFor(() => expect(callCount).toBe(1));

    act(() => { result.current.refresh(); });
    await waitFor(() => expect(result.current.captures[0]?.title).toBe('Refreshed'));
    expect(callCount).toBe(2);
  });
});
