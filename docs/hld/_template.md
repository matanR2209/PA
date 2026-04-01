# HLD — [Feature Name]

> **Status:** Draft | In Review | Approved | Implemented
> **Last updated:** YYYY-MM-DD
> **Author:** Matan

---

## 1. Overview
_One paragraph. What is this feature and why does it exist?_

---

## 2. Problem Statement
_What problem does this solve? Who is affected?_

---

## 3. Goals & Non-Goals

**Goals:**
-

**Non-Goals:**
-

---

## 4. Solution Overview
_High-level description of the approach._

---

## 5. Architecture

### Frontend
_Components involved, state management, hooks._

```
ComponentA
  └── ComponentB
        └── useHookX
```

### Backend
_Routes, services, external calls._

```
POST /api/...
  └── handler
        └── prisma.model.create()
```

### Data Flow
_How data moves from user action → API → DB → UI._

---

## 6. Data Model

_Relevant DB tables / fields. Copy from schema.prisma as needed._

```prisma
model Example {
  id    String @id
  field String
}
```

---

## 7. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/api/...` | ✅ | |
| POST   | `/api/...` | ✅ | |

---

## 8. Key Decisions & Trade-offs

| Decision | Chosen approach | Alternative considered | Reason |
|----------|----------------|----------------------|--------|
| | | | |

---

## 9. Open Questions
- [ ]

---

## 10. Future Improvements
-
