# TP-01 — Captures API

> **Type:** Unit + Integration
> **Layer:** Backend
> **Test files:**
> - `be/src/__tests__/utils/extractFromMeta.test.ts`
> - `be/src/__tests__/routes/captures.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- `extractFromMeta()` helper — field extraction logic
- `GET /api/captures` — list all
- `GET /api/captures/:id` — get one
- `POST /api/captures` — create
- `PUT /api/captures/:id` — full update (transactional)
- `DELETE /api/captures/:id` — delete

---

## Out of Scope
- Auth / userId filtering (covered in TP-03 when auth is built)
- Prisma migration correctness (DB-level, not unit tested)
- `serialize()` is tested indirectly via route response shape

---

## Test Cases

### extractFromMeta (unit)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-01 | Empty / undefined input returns safe defaults | `undefined` | `{ priority: null, dueDate: null, labelIds: [], actionItems: [], cleanMeta: {} }` | ✅ Passing |
| TC-02 | Extracts priority and removes it from cleanMeta | `{ priority: 'high', status: 'todo' }` | `priority = 'high'`, cleanMeta has `status` but not `priority` | ✅ Passing |
| TC-03 | Extracts and parses dueDate as Date | `{ dueDate: '2026-04-01' }` | `dueDate` is `Date`, formats back to `'2026-04-01'` | ✅ Passing |
| TC-04 | Extracts label IDs array | `{ labels: ['id1', 'id2'] }` | `labelIds = ['id1', 'id2']`, `cleanMeta` has no `labels` | ✅ Passing |
| TC-05 | Extracts actionItems array | `{ actionItems: [{id, text, status}] }` | `actionItems` returned, not in cleanMeta | ✅ Passing |
| TC-06 | Non-array labels/actionItems return empty arrays | `{ labels: 'bad', actionItems: null }` | `labelIds = []`, `actionItems = []` | ✅ Passing |
| TC-07 | Unrelated meta fields preserved in cleanMeta | `{ aiInsights: {}, status: 'done' }` | cleanMeta contains `aiInsights` and `status` | ✅ Passing |

### GET /api/captures (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-08 | Returns list of serialized captures | DB returns 2 captures | 200, array of 2 | ✅ Passing |
| TC-09 | Returns empty array when no captures | DB returns `[]` | 200, `[]` | ✅ Passing |
| TC-10 | Priority column merged back into meta | Capture with `priority: 'high'` | `meta.priority === 'high'` in response | ✅ Passing |
| TC-11 | DueDate merged back as YYYY-MM-DD string | Capture with `dueDate: Date` | `meta.dueDate === '2026-04-01'` | ✅ Passing |
| TC-12 | DB error returns 500 | `findMany` throws | 500 + `{ error }` | ✅ Passing |

### GET /api/captures/:id (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-13 | Returns capture when found | `GET /cap1` | 200 + capture | ✅ Passing |
| TC-14 | Returns 404 when not found | `GET /unknown`, DB returns `null` | 404 + `{ error: 'Not found' }` | ✅ Passing |
| TC-15 | DB error returns 500 | `findUnique` throws | 500 | ✅ Passing |

### POST /api/captures (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-16 | Creates capture with required fields | `{ title, content }` | 201 + created capture | ✅ Passing |
| TC-17 | Extracts priority from meta into DB column | `{ meta: { priority: 'medium' } }` | `prisma.capture.create` called with `priority: 'medium'` | ✅ Passing |
| TC-18 | Extracts dueDate from meta into DB column | `{ meta: { dueDate: '2026-04-15' } }` | `prisma.capture.create` called with `dueDate: Date` | ✅ Passing |
| TC-19 | Defaults title to 'Untitled' when missing | `{ content: 'hello' }` | title = `'Untitled'` | ✅ Passing |
| TC-20 | Creates action items in separate table | `{ meta: { actionItems: [{text, status}] } }` | `actionItems.create` called, not in stored meta | ✅ Passing |

### PUT /api/captures/:id (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-21 | Updates scalar fields | `{ title: 'New title' }` | `capture.update` called with new title | ✅ Passing |
| TC-22 | Replaces all action items in transaction | PUT with 2 new action items | `actionItem.deleteMany` then `createMany` called | ✅ Passing |
| TC-23 | Clears action items when array is empty | PUT with `meta.actionItems: []` | `actionItem.deleteMany` called, no createMany | ✅ Passing |
| TC-24 | Syncs labels via join table | PUT with `meta.labels: ['l1']` | `captureLabel.deleteMany` then `createMany` | ✅ Passing |
| TC-25 | Returns updated capture | Any valid PUT | 200 + capture object | ✅ Passing |
| TC-28-notes | Notes NOT wiped when notes field absent from body | `{ title: 'x' }` — no notes key | `note.deleteMany` never called | ✅ Passing |
| TC-29-notes | Notes replaced when notes array explicitly provided | `{ notes: [{text}] }` | `note.deleteMany` then `createMany` called | ✅ Passing |
| TC-30-notes | Notes wiped when empty notes array explicitly provided | `{ notes: [] }` | `note.deleteMany` called, no `createMany` | ✅ Passing |

### DELETE /api/captures/:id (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-26 | Returns 204 on success | `DELETE /cap1` | 204, no body | ✅ Passing |
| TC-27 | DB error returns 500 | `capture.delete` throws | 500 | ✅ Passing |

---

## Coverage Summary

| File | Functions | Lines | Branches |
|------|-----------|-------|----------|
| `src/routes/captures.ts` | ~90% | ~85% | ~80% |

---

## Notes / Known Gaps
- `serialize()` is not tested in isolation — covered implicitly via TC-10, TC-11, TC-13
- Label + recording sync in PUT follows same pattern as actionItems — not duplicated here
- Auth filtering (by `userId`) is out of scope until TP-03
