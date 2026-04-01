// TC-01 → TC-07 — see docs/test-plans/TP-01-BE-captures-api.md
import { describe, it, expect } from 'vitest';
import { extractFromMeta } from '../../routes/captures.js';

describe('extractFromMeta', () => {
  // TC-01
  it('returns safe defaults for undefined input', () => {
    const result = extractFromMeta(undefined);
    expect(result.priority).toBeNull();
    expect(result.dueDate).toBeNull();
    expect(result.labelIds).toEqual([]);
    expect(result.actionItems).toEqual([]);
    expect(result.cleanMeta).toEqual({});
  });

  // TC-01 (empty object variant)
  it('returns safe defaults for empty object input', () => {
    const result = extractFromMeta({});
    expect(result.priority).toBeNull();
    expect(result.dueDate).toBeNull();
    expect(result.labelIds).toEqual([]);
    expect(result.actionItems).toEqual([]);
    expect(result.cleanMeta).toEqual({});
  });

  // TC-02
  it('extracts priority and removes it from cleanMeta', () => {
    const result = extractFromMeta({ priority: 'high', status: 'todo' });
    expect(result.priority).toBe('high');
    expect(result.cleanMeta).not.toHaveProperty('priority');
    expect(result.cleanMeta).toHaveProperty('status', 'todo');
  });

  it('handles all priority values', () => {
    expect(extractFromMeta({ priority: 'low' }).priority).toBe('low');
    expect(extractFromMeta({ priority: 'medium' }).priority).toBe('medium');
    expect(extractFromMeta({ priority: 'high' }).priority).toBe('high');
  });

  // TC-03
  it('extracts and parses dueDate as a Date instance', () => {
    const result = extractFromMeta({ dueDate: '2026-04-01' });
    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.cleanMeta).not.toHaveProperty('dueDate');
  });

  it('formats extracted dueDate back to YYYY-MM-DD', () => {
    const result = extractFromMeta({ dueDate: '2026-04-01' });
    const formatted = result.dueDate!.toISOString().split('T')[0];
    expect(formatted).toBe('2026-04-01');
  });

  it('returns null dueDate when not present', () => {
    expect(extractFromMeta({ title: 'x' }).dueDate).toBeNull();
  });

  // TC-04
  it('extracts label IDs array', () => {
    const result = extractFromMeta({ labels: ['id1', 'id2'] });
    expect(result.labelIds).toEqual(['id1', 'id2']);
    expect(result.cleanMeta).not.toHaveProperty('labels');
  });

  // TC-05
  it('extracts actionItems array', () => {
    const items = [{ id: 'ai1', text: 'Do thing', status: 'todo' }];
    const result = extractFromMeta({ actionItems: items });
    expect(result.actionItems).toEqual(items);
    expect(result.cleanMeta).not.toHaveProperty('actionItems');
  });

  // TC-06
  it('returns empty arrays for non-array labels and actionItems', () => {
    const result = extractFromMeta({ labels: 'bad-string', actionItems: null });
    expect(result.labelIds).toEqual([]);
    expect(result.actionItems).toEqual([]);
  });

  // TC-07
  it('preserves unrelated meta fields in cleanMeta', () => {
    const aiInsights = { verdict: 'promising', keyRisks: [] };
    const result = extractFromMeta({
      priority: 'low',
      aiInsights,
      status: 'in-progress',
      estimatedMinutes: 30,
    });
    expect(result.cleanMeta).toHaveProperty('aiInsights', aiInsights);
    expect(result.cleanMeta).toHaveProperty('status', 'in-progress');
    expect(result.cleanMeta).toHaveProperty('estimatedMinutes', 30);
    expect(result.cleanMeta).not.toHaveProperty('priority');
  });

  it('handles all extractable fields simultaneously', () => {
    const result = extractFromMeta({
      priority: 'medium',
      dueDate: '2026-06-15',
      labels: ['l1'],
      actionItems: [{ id: 'a1', text: 'Task', status: 'todo' }],
      status: 'todo',
    });
    expect(result.priority).toBe('medium');
    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.labelIds).toEqual(['l1']);
    expect(result.actionItems).toHaveLength(1);
    expect(Object.keys(result.cleanMeta)).toEqual(['status']);
  });
});
