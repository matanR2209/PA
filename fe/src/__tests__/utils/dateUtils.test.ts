// TC-54 → TC-61 — see docs/test-plans/TP-08-FE-date-priority-utils.md
import { describe, it, expect } from 'vitest';
import { addDays, toDateStr, greeting } from '../../utils/dateUtils';

describe('addDays', () => {
  it('TC-54: adds positive days', () => {
    const result = addDays(new Date('2026-01-01'), 3);
    expect(toDateStr(result)).toBe('2026-01-04');
  });

  it('TC-55: handles month boundary', () => {
    const result = addDays(new Date('2026-01-30'), 3);
    expect(toDateStr(result)).toBe('2026-02-02');
  });

  it('TC-56: adding 0 returns same date and does not mutate original', () => {
    const original = new Date('2026-03-15');
    const result = addDays(original, 0);
    expect(toDateStr(result)).toBe('2026-03-15');
    expect(result).not.toBe(original); // different reference
  });
});

describe('toDateStr', () => {
  it('TC-57: pads single-digit month and day', () => {
    // Jan 5 2026 — month 0 in JS
    expect(toDateStr(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('TC-58: formats double-digit month and day correctly', () => {
    expect(toDateStr(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('greeting', () => {
  it('TC-59: returns Good morning before noon', () => {
    const d = new Date('2026-03-31T08:00:00');
    expect(greeting(d)).toBe('Good morning');
  });

  it('TC-60: returns Good afternoon between 12 and 17', () => {
    const d = new Date('2026-03-31T14:00:00');
    expect(greeting(d)).toBe('Good afternoon');
  });

  it('TC-61: returns Good evening from 18 onwards', () => {
    const d = new Date('2026-03-31T20:00:00');
    expect(greeting(d)).toBe('Good evening');
  });
});
