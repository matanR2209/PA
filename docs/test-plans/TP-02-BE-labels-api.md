# TP-02 — Labels API

> **Type:** Integration
> **Layer:** Backend
> **Test files:**
> - `be/src/__tests__/routes/labels.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- `GET /api/labels` — list all labels
- `POST /api/labels` — create or update label (upsert by name)
- `DELETE /api/labels/:id` — delete label

---

## Out of Scope
- Per-user label filtering (covered when auth is built)
- `CaptureLabel` join table management (covered in TP-01 via captures PUT)

---

## Test Cases

### GET /api/labels (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-28 | Returns labels sorted by name | DB returns 2 labels | 200, array of 2 in name order | ✅ Passing |
| TC-29 | Returns empty array when no labels | DB returns `[]` | 200, `[]` | ✅ Passing |
| TC-30 | DB error returns 500 | `findMany` throws | 500 + `{ error }` | ✅ Passing |

### POST /api/labels (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-31 | Creates label with name + color | `{ name: 'bug', color: '#f00' }` | 201 + created label | ✅ Passing |
| TC-32 | Returns 400 when name is missing | `{ color: '#f00' }` | 400 + `{ error }` | ✅ Passing |
| TC-33 | Returns 400 when color is missing | `{ name: 'bug' }` | 400 + `{ error }` | ✅ Passing |
| TC-34 | Upserts — updates color if name exists | `{ name: 'existing', color: '#new' }` | 201 + label with updated color | ✅ Passing |
| TC-35 | Trims whitespace from name | `{ name: '  bug  ', color: '#f00' }` | upsert called with `name: 'bug'` | ✅ Passing |
| TC-36 | DB error returns 500 | `upsert` throws | 500 + `{ error }` | ✅ Passing |

### DELETE /api/labels/:id (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-37 | Returns 204 on success | `DELETE /label1` | 204, no body | ✅ Passing |
| TC-38 | DB error returns 500 | `label.delete` throws | 500 + `{ error }` | ✅ Passing |

---

## Coverage Summary

| File | Functions | Lines | Branches |
|------|-----------|-------|----------|
| `src/routes/labels.ts` | ~95% | ~90% | ~85% |

---

## Notes / Known Gaps
- `@@unique([userId, name])` constraint is enforced at DB level; upsert currently uses `name` alone — will need updating once auth is added
