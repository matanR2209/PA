# TP-06 — useInnovationScore Hook

> **Type:** Unit (hook)
> **Layer:** Frontend
> **Test files:**
> - `fe/src/__tests__/hooks/useInnovationScore.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- State machine transitions: `idle → loading → done | error`
- `run(title, content)` — fires POST and transitions state
- `reset()` — clears all state back to idle

---

## Test Cases

### Initial state

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-100 | Starts in idle state | `state = 'idle'`, score/reasoning/error all null | ✅ Passing |

### run()

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-101 | Transitions to loading immediately | `state = 'loading'` after calling run before fetch resolves | ✅ Passing |
| TC-102 | Sets score + reasoning on success | `state = 'done'`, score + reasoning populated | ✅ Passing |
| TC-103 | Transitions to error on non-ok response | `state = 'error'`, error message set | ✅ Passing |
| TC-104 | Transitions to error on network failure | fetch throws, `state = 'error'` | ✅ Passing |
| TC-105 | Clears previous score when re-run | score = null during loading | ✅ Passing |

### reset()

| ID | Description | Expected output | Status |
|----|-------------|-----------------|--------|
| TC-106 | Resets all state to initial values | `state = 'idle'`, score/reasoning/error = null | ✅ Passing |

---

## Notes / Known Gaps
- Concurrent run() calls are not tested (not guarded in implementation)
