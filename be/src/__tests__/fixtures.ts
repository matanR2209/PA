// ── Shared test fixtures for BE tests ────────────────────────────────────────
// Import from here in all route/utils tests instead of re-defining locally.

// ── Stable IDs ────────────────────────────────────────────────────────────────

export const CAPTURE_ID = 'cap1';
export const NOTE_ID    = 'note1';
export const LABEL_ID   = 'label1';
export const ITEM_ID    = 'item1';
export const USER_ID    = 'usr_dev';

// ── Dates ─────────────────────────────────────────────────────────────────────

export const CREATED_AT = new Date('2026-01-01T10:00:00Z');
export const UPDATED_AT = new Date('2026-01-01T10:00:00Z');

// ── Factory functions ─────────────────────────────────────────────────────────

export function makeCapture(overrides: Record<string, unknown> = {}) {
  return {
    id:          CAPTURE_ID,
    title:       'Test capture',
    content:     'Some content',
    type:        'idea',
    category:    'idea',
    priority:    null,
    dueDate:     null,
    meta:        {},
    userId:      USER_ID,
    createdAt:   CREATED_AT,
    updatedAt:   UPDATED_AT,
    notes:       [] as unknown[],
    recordings:  [] as unknown[],
    labels:      [] as unknown[],
    actionItems: [] as unknown[],
    ...overrides,
  };
}

export function makeNote(overrides: Record<string, unknown> = {}) {
  return {
    id:        NOTE_ID,
    text:      'My note',
    captureId: CAPTURE_ID,
    createdAt: CREATED_AT,
    ...overrides,
  };
}

export function makeLabel(overrides: Record<string, unknown> = {}) {
  return {
    id:     LABEL_ID,
    name:   'bug',
    color:  '#f00',
    userId: USER_ID,
    ...overrides,
  };
}

export function makeActionItem(overrides: Record<string, unknown> = {}) {
  return {
    id:        ITEM_ID,
    text:      'Do something',
    status:    'todo',
    captureId: CAPTURE_ID,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    ...overrides,
  };
}
