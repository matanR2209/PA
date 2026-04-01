// TC-92 → TC-99 — see docs/test-plans/TP-05-FE-use-labels.md
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useLabels } from '../../hooks/useLabels';
import { makeLabel, LABEL_ID } from '../fixtures';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE = '*/api/labels';

// ── MSW server ────────────────────────────────────────────────────────────────

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useLabels', () => {
  it('TC-92: fetches labels on mount', async () => {
    const labels = [makeLabel(), makeLabel({ id: 'l2', name: 'feature' })];
    server.use(http.get(BASE, () => HttpResponse.json(labels)));

    const { result } = renderHook(() => useLabels());

    await waitFor(() => expect(result.current.labels).toHaveLength(2));
  });

  it('TC-93: starts with empty array before fetch resolves', () => {
    server.use(http.get(BASE, async () => {
      await new Promise(r => setTimeout(r, 100));
      return HttpResponse.json([]);
    }));

    const { result } = renderHook(() => useLabels());
    expect(result.current.labels).toEqual([]);
  });

  it('TC-94: createLabel adds optimistic label with temp id immediately', async () => {
    server.use(
      http.get(BASE, () => HttpResponse.json([])),
      http.post(BASE, async () => {
        await new Promise(r => setTimeout(r, 50));
        return HttpResponse.json(makeLabel({ id: 'real1' }), { status: 201 });
      }),
    );

    const { result } = renderHook(() => useLabels());
    await waitFor(() => expect(result.current.labels).toEqual([]));

    act(() => { result.current.createLabel('bug'); });

    expect(result.current.labels).toHaveLength(1);
    expect(result.current.labels[0].id).toMatch(/^temp_/);
  });

  it('TC-95: createLabel swaps temp id for real id after POST resolves', async () => {
    const real = makeLabel({ id: 'real1' });
    server.use(
      http.get(BASE, () => HttpResponse.json([])),
      http.post(BASE, () => HttpResponse.json(real, { status: 201 })),
    );

    const { result } = renderHook(() => useLabels());
    await waitFor(() => expect(result.current.labels).toEqual([]));

    act(() => { result.current.createLabel('bug'); });
    await waitFor(() => expect(result.current.labels[0].id).toBe('real1'));
  });

  it('TC-96: createLabel assigns a color from the palette', async () => {
    server.use(
      http.get(BASE, () => HttpResponse.json([])),
      http.post(BASE, async ({ request }) => {
        const body = await request.json() as { name: string; color: string };
        return HttpResponse.json(makeLabel({ color: body.color }), { status: 201 });
      }),
    );

    const { result } = renderHook(() => useLabels());
    await waitFor(() => expect(result.current.labels).toEqual([]));

    act(() => { result.current.createLabel('bug'); });

    const color = result.current.labels[0].color;
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('TC-97: createLabel trims name before sending to API', async () => {
    let sentBody: Record<string, unknown> = {};
    server.use(
      http.get(BASE, () => HttpResponse.json([])),
      http.post(BASE, async ({ request }) => {
        sentBody = await request.json() as Record<string, unknown>;
        return HttpResponse.json(makeLabel({ name: sentBody.name as string }), { status: 201 });
      }),
    );

    const { result } = renderHook(() => useLabels());
    await waitFor(() => expect(result.current.labels).toEqual([]));

    act(() => { result.current.createLabel('  bug  '); });
    await waitFor(() => expect(result.current.labels[0].id).toBe('label1'));

    expect(sentBody.name).toBe('bug');
  });

  it('TC-98: deleteLabel removes label from state immediately', async () => {
    const label = makeLabel();
    server.use(
      http.get(BASE, () => HttpResponse.json([label])),
      http.delete(`*/api/labels/${LABEL_ID}`, () => new HttpResponse(null, { status: 204 })),
    );

    const { result } = renderHook(() => useLabels());
    await waitFor(() => expect(result.current.labels).toHaveLength(1));

    act(() => { result.current.deleteLabel(LABEL_ID); });
    expect(result.current.labels).toHaveLength(0);
  });

  it('TC-99: deleteLabel calls DELETE on the API', async () => {
    let deleteWasCalled = false;
    server.use(
      http.get(BASE, () => HttpResponse.json([makeLabel()])),
      http.delete(`*/api/labels/${LABEL_ID}`, () => {
        deleteWasCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useLabels());
    await waitFor(() => expect(result.current.labels).toHaveLength(1));

    act(() => { result.current.deleteLabel(LABEL_ID); });
    await waitFor(() => expect(deleteWasCalled).toBe(true));
  });
});
