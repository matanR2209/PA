# TP-09 — Notes API

> **Type:** Integration
> **Layer:** Backend
> **Test files:**
> - `be/src/__tests__/routes/notes.test.ts`
> **Last updated:** 2026-03-31

---

## Scope
- `POST /api/captures/:captureId/notes` — add a note to a capture
- `DELETE /api/captures/:captureId/notes/:noteId` — remove a note

---

## Out of Scope
- Note ordering (handled by `serialize()` in captures route)
- Full capture re-serialization after note add/delete (returned individually, not as full capture)

---

## Test Cases

### POST /api/captures/:captureId/notes

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-107 | Creates note and returns it | `{ text: 'My note' }` + existing capture | 201 + `{ id, text, createdAt }` | ✅ Passing |
| TC-108 | Returns 400 when text is missing | `{}` | 400 + `{ error }` | ✅ Passing |
| TC-109 | Returns 400 when text is empty string | `{ text: '   ' }` | 400 + `{ error }` | ✅ Passing |
| TC-110 | Returns 404 when capture does not exist | unknown captureId | 404 + `{ error: 'Capture not found' }` | ✅ Passing |
| TC-111 | Trims whitespace from text before saving | `{ text: '  hello  ' }` | saved text = `'hello'` | ✅ Passing |
| TC-112 | Returns 500 on DB error | `note.create` throws | 500 + `{ error }` | ✅ Passing |

### DELETE /api/captures/:captureId/notes/:noteId

| ID | Description | Input | Expected output | Status |
|----|-------------|-------|-----------------|--------|
| TC-113 | Returns 204 on success | existing note + matching captureId | 204, no body | ✅ Passing |
| TC-114 | Returns 404 when note does not exist | unknown noteId | 404 + `{ error: 'Note not found' }` | ✅ Passing |
| TC-115 | Returns 404 when note belongs to different capture | noteId from another capture | 404 + `{ error: 'Note not found' }` | ✅ Passing |
| TC-116 | Returns 500 on DB error | `note.delete` throws | 500 + `{ error }` | ✅ Passing |

---

## Coverage Summary

| File | Functions | Lines | Branches |
|------|-----------|-------|----------|
| `src/routes/notes.ts` | ~95% | ~90% | ~85% |

---

## Notes / Known Gaps
- `captureId` ownership is verified by checking `note.captureId === captureId` (TC-115)
