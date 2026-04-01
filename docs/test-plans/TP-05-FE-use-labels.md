# TP-05 — useLabels Hook

> **Type:** Unit (hook)
> **Layer:** Frontend
> **Test files:**
> - `fe/src/__tests__/hooks/useLabels.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- Initial load via `GET /api/labels`
- `createLabel` — optimistic add + POST
- `deleteLabel` — optimistic remove + DELETE

---

## Test Cases

### Load

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-92 | Fetches labels on mount | `labels` populated from GET response | ✅ Passing |
| TC-93 | Starts with empty array before fetch resolves | initial state = `[]` | ✅ Passing |

### createLabel

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-94 | Adds optimistic label immediately | label with `temp_` id appears before POST resolves | ✅ Passing |
| TC-95 | Swaps temp id for real id after POST | real id replaces `temp_` id | ✅ Passing |
| TC-96 | Assigns color from palette | color is one of LABEL_COLORS | ✅ Passing |
| TC-97 | Trims name before sending | `name` in POST body is trimmed | ✅ Passing |

### deleteLabel

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-98 | Removes label from state immediately | label gone before DELETE resolves | ✅ Passing |
| TC-99 | Calls DELETE on the API | `fetch` called with `DELETE /api/labels/:id` | ✅ Passing |

---

## Notes / Known Gaps
- Color selection cycle (based on `labels.length % palette.length`) is tested implicitly via TC-96
