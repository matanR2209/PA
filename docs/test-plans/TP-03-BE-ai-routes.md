# TP-03 — AI Routes

> **Type:** Integration
> **Layer:** Backend
> **Test files:**
> - `be/src/__tests__/routes/analyseIdea.test.ts`
> - `be/src/__tests__/routes/innovationScore.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- `POST /api/analyse-idea` — sends idea to Claude, parses JSON response
- `POST /api/innovation-score` — sends idea to Claude, parses SCORE/REASONING text

---

## Out of Scope
- Real Claude API calls (Anthropic SDK is fully mocked)
- Rate limiting / quota handling

---

## Test Cases

### POST /api/analyse-idea (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-39 | Returns 400 when title missing | `{ content: 'x' }` | 400 + `{ error }` | ✅ Passing |
| TC-40 | Returns 400 when content missing | `{ title: 'x' }` | 400 + `{ error }` | ✅ Passing |
| TC-41 | Parses and returns valid JSON response | Claude returns valid JSON | 200 + `{ audienceDescription, keyRisks, additionalConcerns, verdict, actionItems }` | ✅ Passing |
| TC-42 | Strips markdown code fences from response | Claude wraps JSON in ```json...``` | 200 + correctly parsed object | ✅ Passing |
| TC-43 | Defaults missing fields to safe values | Claude omits some fields | `keyRisks: []`, `actionItems: []`, empty strings | ✅ Passing |
| TC-44 | Returns 500 when Claude SDK throws | SDK throws network error | 500 + `{ error: message }` | ✅ Passing |
| TC-45 | Returns 500 when response is not valid JSON | Claude returns plain text | 500 + `{ error }` | ✅ Passing |

### POST /api/innovation-score (integration)

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-46 | Returns 400 when title missing | `{ content: 'x' }` | 400 + `{ error }` | ✅ Passing |
| TC-47 | Returns 400 when content missing | `{ title: 'x' }` | 400 + `{ error }` | ✅ Passing |
| TC-48 | Parses score and reasoning | Claude returns `SCORE: 7\nREASONING: Great idea` | 200 + `{ score: 7, reasoning: 'Great idea' }` | ✅ Passing |
| TC-49 | Clamps score to minimum of 1 | Claude returns `SCORE: 0` | `score: 1` | ✅ Passing |
| TC-50 | Clamps score to maximum of 10 | Claude returns `SCORE: 15` | `score: 10` | ✅ Passing |
| TC-51 | Returns empty reasoning when not present | Claude omits REASONING line | `reasoning: ''` | ✅ Passing |
| TC-52 | Returns 500 when SCORE line missing | Claude returns malformed text | 500 + `{ error }` | ✅ Passing |
| TC-53 | Returns 500 when Claude SDK throws | SDK throws | 500 + `{ error: message }` | ✅ Passing |

---

## Coverage Summary

| File | Functions | Lines | Branches |
|------|-----------|-------|----------|
| `src/routes/analyseIdea.ts` | ~90% | ~85% | ~80% |
| `src/routes/innovationScore.ts` | ~95% | ~90% | ~85% |

---

## Notes / Known Gaps
- Anthropic SDK is mocked entirely — real API behaviour (model changes, token limits) not covered here
- Markdown fence stripping is tested for the `json` variant; bare ``` fences also handled by the same regex
