# TP-04 — useCaptures Hook

> **Type:** Unit (hook)
> **Layer:** Frontend
> **Test files:**
> - `fe/src/__tests__/hooks/useCaptures.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- Initial load via `GET /api/captures`
- `addCapture` — optimistic add + POST
- `updateCapture` — optimistic update + PUT
- `removeCapture` — optimistic remove + DELETE
- `refresh` — re-fetches list

---

## Test Cases

### Load

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-82 | Fetches captures on mount | `captures` populated from GET response | ✅ Passing |
| TC-83 | Starts with empty array before fetch resolves | initial state = `[]` | ✅ Passing |

### addCapture

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-84 | Adds optimistic capture immediately | capture with `temp_` id appears before POST resolves | ✅ Passing |
| TC-85 | Swaps temp id for real id after POST | after POST resolves, real id replaces `temp_` id | ✅ Passing |
| TC-86 | Auto-generates title from content | title = first 5 words of content | ✅ Passing |

### updateCapture

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-87 | Updates capture optimistically | state updated before PUT resolves | ✅ Passing |
| TC-88 | Syncs with server response | state updated again with server response | ✅ Passing |

### removeCapture

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-89 | Removes capture from state immediately | capture gone before DELETE resolves | ✅ Passing |
| TC-90 | Calls DELETE on the API | `fetch` called with `DELETE /api/captures/:id` | ✅ Passing |

### refresh

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-91 | Re-fetches captures from API | GET called again, state updated | ✅ Passing |

---

## Notes / Known Gaps
- Error handling (network failure) is not tested — fetch errors are currently swallowed with `console.error`
