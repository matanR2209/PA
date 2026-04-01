# TP-10 — Action Items API

> **Type:** Integration
> **Layer:** Backend
> **Test files:**
> - `be/src/__tests__/routes/actionItems.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- `PATCH /api/captures/:captureId/action-items/:itemId` — update status of a single action item

---

## Out of Scope
- Creating / deleting action items individually (handled via PUT /api/captures/:id in TP-01)
- Bulk replacement of all action items (covered in TP-01 TC-22/TC-23)

---

## Test Cases

### PATCH /api/captures/:captureId/action-items/:itemId

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-117 | Updates status to 'done' | `{ status: 'done' }` + existing item | 200 + updated item with `status: 'done'` | ✅ Passing |
| TC-118 | Updates status to 'in-progress' | `{ status: 'in-progress' }` | 200 + `status: 'in-progress'` | ✅ Passing |
| TC-119 | Updates status to 'todo' | `{ status: 'todo' }` | 200 + `status: 'todo'` | ✅ Passing |
| TC-120 | Returns 400 when status is missing | `{}` | 400 + `{ error }` | ✅ Passing |
| TC-121 | Returns 400 when status is invalid | `{ status: 'invalid' }` | 400 + `{ error }` listing valid values | ✅ Passing |
| TC-122 | Returns 404 when action item does not exist | unknown itemId | 404 + `{ error: 'Action item not found' }` | ✅ Passing |
| TC-123 | Returns 404 when item belongs to different capture | itemId from another capture | 404 + `{ error: 'Action item not found' }` | ✅ Passing |
| TC-124 | Response includes id, text, status, createdAt, updatedAt | valid PATCH | all fields present | ✅ Passing |
| TC-125 | Returns 500 on DB error | `actionItem.update` throws | 500 + `{ error }` | ✅ Passing |

---

## Coverage Summary

| File | Functions | Lines | Branches |
|------|-----------|-------|----------|
| `src/routes/actionItems.ts` | ~95% | ~90% | ~90% |

---

## Notes / Known Gaps
- Only `status` is patchable via this endpoint — text updates go through `PUT /api/captures/:id`
