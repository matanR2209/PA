// TC-62 → TC-68 — see docs/test-plans/TP-08-FE-date-priority-utils.md
import { describe, it, expect } from 'vitest';
import { priorityOrder, priorityBorderStyle } from '../../utils/priorityUtils';

describe('priorityOrder', () => {
  it('TC-62: high maps to 0', () => {
    expect(priorityOrder('high')).toBe(0);
  });

  it('TC-63: medium maps to 1', () => {
    expect(priorityOrder('medium')).toBe(1);
  });

  it('TC-64: low maps to 2', () => {
    expect(priorityOrder('low')).toBe(2);
  });

  it('TC-65: undefined maps to 2', () => {
    expect(priorityOrder(undefined)).toBe(2);
  });
});

describe('priorityBorderStyle', () => {
  it('TC-66: high returns red border', () => {
    const style = priorityBorderStyle('high');
    expect(style.borderLeftColor).toBe('#E24B4A');
    expect(style.borderLeftWidth).toBe(3);
  });

  it('TC-67: medium returns orange border', () => {
    const style = priorityBorderStyle('medium');
    expect(style.borderLeftColor).toBe('#fb923c');
    expect(style.borderLeftWidth).toBe(2);
  });

  it('TC-68: undefined returns transparent border', () => {
    const style = priorityBorderStyle(undefined);
    expect(style.borderLeftColor).toBe('transparent');
  });
});
