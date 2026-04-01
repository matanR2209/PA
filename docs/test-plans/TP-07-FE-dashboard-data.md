# TP-07 — Dashboard Data Processing

> **Type:** Unit
> **Layer:** Frontend
> **Test files:**
> - `fe/src/__tests__/utils/dashboardUtils.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- `computeBarDays(captures, now)` — builds 7-day bar chart data from captures
- `computeThreeDays(captures, now)` — builds 3-day task list sorted by priority

---

## Test Cases

### computeBarDays

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-69 | Returns 7 entries | any captures | array of length 7 | ✅ Passing |
| TC-70 | First entry is today | `now = 2026-03-31` | `barDays[0].dateStr === '2026-03-31'` | ✅ Passing |
| TC-71 | Counts work-task captures on correct day | 2 work-task captures due today | `barDays[0].work === 2` | ✅ Passing |
| TC-72 | Counts home-task captures separately | 1 home-task due tomorrow | `barDays[1].home === 1` | ✅ Passing |
| TC-73 | Counts other category in other bucket | 1 idea capture due today | `barDays[0].other === 1` | ✅ Passing |
| TC-74 | Total is sum of all categories | 1 work + 1 home + 1 other today | `barDays[0].total === 3` | ✅ Passing |
| TC-75 | Empty captures returns all zeros | `[]` | all totals = 0 | ✅ Passing |

### computeThreeDays

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-76 | Returns 3 entries | any captures | array of length 3 | ✅ Passing |
| TC-77 | First entry label is 'Today' | `i = 0` | `threeDays[0].label === 'Today'` | ✅ Passing |
| TC-78 | Second entry label is 'Tomorrow' | `i = 1` | `threeDays[1].label === 'Tomorrow'` | ✅ Passing |
| TC-79 | Tasks sorted by priority (high first) | high + low task on same day | high task appears first | ✅ Passing |
| TC-80 | Only includes tasks due on matching date | 1 today + 1 in 5 days | only today's task in [0].tasks | ✅ Passing |
| TC-81 | Empty tasks when nothing is due | no captures | `threeDays[0].tasks === []` | ✅ Passing |

---

## Notes / Known Gaps
- `dueDate` in `meta` is compared as a string (`YYYY-MM-DD`) — this is the current contract from `serialize()`
