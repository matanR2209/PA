// ── Shared test fixtures for FE tests ────────────────────────────────────────
// Import from here in all hook/utils tests instead of re-defining locally.

import type { Capture } from '../types';
import type { Label } from '../types/label.types';

// ── Stable IDs ────────────────────────────────────────────────────────────────

export const CAPTURE_ID = 'cap1';
export const LABEL_ID   = 'label1';

// ── Factory functions ─────────────────────────────────────────────────────────

export function makeCapture(overrides: Partial<Capture> & { meta?: Record<string, unknown> } = {}): Capture {
  const { meta, ...rest } = overrides;
  return {
    id:         CAPTURE_ID,
    title:      'Test Capture',
    content:    'Some content',
    type:       'idea',
    category:   'idea',
    createdAt:  '2026-01-01T10:00:00Z',
    recordings: [],
    meta:       meta ?? {},
    ...rest,
  };
}

export function makeLabel(overrides: Partial<Label> = {}): Label {
  return {
    id:    LABEL_ID,
    name:  'bug',
    color: '#6366f1',
    ...overrides,
  };
}
