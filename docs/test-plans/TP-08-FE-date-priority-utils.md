# TP-08 — Date + Priority Utilities

> **Type:** Unit
> **Layer:** Frontend
> **Test files:**
> - `fe/src/__tests__/utils/dateUtils.test.ts`
> - `fe/src/__tests__/utils/priorityUtils.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- `addDays(d, n)` — shifts a date by n days
- `toDateStr(d)` — formats Date as `YYYY-MM-DD`
- `greeting(d)` — returns time-of-day greeting
- `priorityOrder(p)` — maps priority to sort weight
- `priorityBorderStyle(p)` — returns CSS object for border style

---

## Test Cases

### dateUtils

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-54 | addDays adds positive days | `addDays(2026-01-01, 3)` | `2026-01-04` | ✅ Passing |
| TC-55 | addDays handles month boundary | `addDays(2026-01-30, 3)` | `2026-02-02` | ✅ Passing |
| TC-56 | addDays with 0 returns same date | `addDays(2026-03-15, 0)` | `2026-03-15` | ✅ Passing |
| TC-57 | toDateStr pads month and day | `new Date(2026, 0, 5)` | `'2026-01-05'` | ✅ Passing |
| TC-58 | toDateStr formats correctly | `new Date(2026, 11, 31)` | `'2026-12-31'` | ✅ Passing |
| TC-59 | greeting returns 'Good morning' before noon | hour = 8 | `'Good morning'` | ✅ Passing |
| TC-60 | greeting returns 'Good afternoon' 12–17 | hour = 14 | `'Good afternoon'` | ✅ Passing |
| TC-61 | greeting returns 'Good evening' 18+ | hour = 20 | `'Good evening'` | ✅ Passing |

### priorityUtils

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-62 | priorityOrder: high = 0 | `'high'` | `0` | ✅ Passing |
| TC-63 | priorityOrder: medium = 1 | `'medium'` | `1` | ✅ Passing |
| TC-64 | priorityOrder: low = 2 | `'low'` | `2` | ✅ Passing |
| TC-65 | priorityOrder: undefined = 2 | `undefined` | `2` | ✅ Passing |
| TC-66 | priorityBorderStyle: high = red border | `'high'` | `borderLeftColor: '#E24B4A'` | ✅ Passing |
| TC-67 | priorityBorderStyle: medium = orange border | `'medium'` | `borderLeftColor: '#fb923c'` | ✅ Passing |
| TC-68 | priorityBorderStyle: low/undefined = transparent | `undefined` | `borderLeftColor: 'transparent'` | ✅ Passing |

---

## Notes / Known Gaps
- `addDays` does not mutate the original date — verified by TC-56
