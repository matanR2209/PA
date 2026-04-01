// TC-69 → TC-81 — see docs/test-plans/TP-07-FE-dashboard-data.md
import { describe, it, expect } from 'vitest';
import { computeBarDays, computeThreeDays } from '../../utils/dashboardUtils';
import { makeCapture } from '../fixtures';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = new Date('2026-03-31T10:00:00');

// ── computeBarDays ────────────────────────────────────────────────────────────

describe('computeBarDays', () => {
  it('TC-69: returns 7 entries', () => {
    const result = computeBarDays([], NOW);
    expect(result).toHaveLength(7);
  });

  it('TC-70: first entry is today', () => {
    const result = computeBarDays([], NOW);
    expect(result[0].dateStr).toBe('2026-03-31');
  });

  it('TC-71: counts work-task captures on the correct day', () => {
    const captures = [
      makeCapture({ category: 'work-task', meta: { dueDate: '2026-03-31' } }),
      makeCapture({ id: 'c2', category: 'work-task', meta: { dueDate: '2026-03-31' } }),
    ];
    const result = computeBarDays(captures, NOW);
    expect(result[0].work).toBe(2);
  });

  it('TC-72: counts home-task captures in home bucket on correct day', () => {
    const captures = [
      makeCapture({ category: 'home-task', meta: { dueDate: '2026-04-01' } }),
    ];
    const result = computeBarDays(captures, NOW);
    expect(result[1].home).toBe(1);
    expect(result[1].work).toBe(0);
  });

  it('TC-73: counts non-work/home category in other bucket', () => {
    const captures = [
      makeCapture({ category: 'idea', meta: { dueDate: '2026-03-31' } }),
    ];
    const result = computeBarDays(captures, NOW);
    expect(result[0].other).toBe(1);
    expect(result[0].work).toBe(0);
  });

  it('TC-74: total is sum of all categories', () => {
    const captures = [
      makeCapture({ id: 'a', category: 'work-task', meta: { dueDate: '2026-03-31' } }),
      makeCapture({ id: 'b', category: 'home-task', meta: { dueDate: '2026-03-31' } }),
      makeCapture({ id: 'c', category: 'idea',      meta: { dueDate: '2026-03-31' } }),
    ];
    const result = computeBarDays(captures, NOW);
    expect(result[0].total).toBe(3);
  });

  it('TC-75: empty captures returns all-zero totals', () => {
    const result = computeBarDays([], NOW);
    expect(result.every(d => d.total === 0)).toBe(true);
  });
});

// ── computeThreeDays ──────────────────────────────────────────────────────────

describe('computeThreeDays', () => {
  it('TC-76: returns 3 entries', () => {
    const result = computeThreeDays([], NOW);
    expect(result).toHaveLength(3);
  });

  it("TC-77: first entry label is 'Today'", () => {
    const result = computeThreeDays([], NOW);
    expect(result[0].label).toBe('Today');
  });

  it("TC-78: second entry label is 'Tomorrow'", () => {
    const result = computeThreeDays([], NOW);
    expect(result[1].label).toBe('Tomorrow');
  });

  it('TC-79: tasks sorted by priority — high appears before low', () => {
    const captures = [
      makeCapture({ id: 'low',  meta: { dueDate: '2026-03-31', priority: 'low' } }),
      makeCapture({ id: 'high', meta: { dueDate: '2026-03-31', priority: 'high' } }),
    ];
    const result = computeThreeDays(captures, NOW);
    expect(result[0].tasks[0].id).toBe('high');
    expect(result[0].tasks[1].id).toBe('low');
  });

  it('TC-80: only includes tasks due on matching date', () => {
    const captures = [
      makeCapture({ id: 'today', meta: { dueDate: '2026-03-31' } }),
      makeCapture({ id: 'far',   meta: { dueDate: '2026-04-10' } }),
    ];
    const result = computeThreeDays(captures, NOW);
    expect(result[0].tasks).toHaveLength(1);
    expect(result[0].tasks[0].id).toBe('today');
  });

  it('TC-81: empty tasks when nothing is due', () => {
    const result = computeThreeDays([], NOW);
    expect(result[0].tasks).toEqual([]);
  });
});
