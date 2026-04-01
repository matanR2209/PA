# HLD — Capture System

> **Status:** Implemented
> **Last updated:** 2026-03-31
> **Author:** Matan

---

## 1. Overview
The Capture System is the core of IdeaPA. A "capture" is any piece of information the user wants to save — an idea, a task, a shopping list, a travel plan, etc. Captures are created on mobile (voice or text) and reviewed/managed on the desktop.

---

## 2. Problem Statement
Users have fleeting thoughts, tasks, and ideas throughout the day. They need a quick way to capture them on mobile and a structured way to review and act on them on desktop.

---

## 3. Goals & Non-Goals

**Goals:**
- Support multiple capture categories (Idea, Work Task, Home Task, Shopping, Read/Watch, Finance, Travel)
- Each category has its own metadata shape
- Fast creation on mobile
- Structured review + editing on desktop

**Non-Goals:**
- Real-time collaboration (future)
- Offline-first sync (future)

---

## 4. Solution Overview
A `Capture` is the base entity. Category-specific fields are stored in a flexible `meta` JSON column. Frequently queried fields (`priority`, `dueDate`) are promoted to real DB columns for performance. Related entities (`Note`, `ActionItem`, `Recording`) are normalized into their own tables.

---

## 5. Architecture

### Frontend
```
Desktop.tsx
  └── PanelRouter → IdeaPanel | WorkTaskPanel | HomeTaskPanel | ...
        └── LeftColumn (notes, action items, labels)
              └── useCaptures (API hook)
```

### Backend
```
GET/POST/PUT/DELETE /api/captures
  └── captures.ts router
        └── prisma.capture + notes + recordings + labels + actionItems
```

### Data Flow
```
User edits capture → onUpdate(capture) → useCaptures.updateCapture()
  → PUT /api/captures/:id → extractFromMeta() → prisma.$transaction()
  → serialize() → updated capture returned → React state updated
```

---

## 6. Data Model

```prisma
model Capture {
  id          String    @id @default(cuid())
  title       String
  content     String
  type        String              // "idea" | "task"
  category    String?             // "idea" | "work-task" | "home-task" | ...
  priority    String?             // "low" | "medium" | "high"
  dueDate     DateTime?
  meta        Json                // category-specific fields
  userId      String?
  createdAt   DateTime
  updatedAt   DateTime

  notes       Note[]
  recordings  Recording[]
  labels      CaptureLabel[]
  actionItems ActionItem[]
}
```

**What lives in `meta` per category:**

| Category | Key meta fields |
|----------|----------------|
| idea | `status`, `audience`, `innovationScore`, `aiInsights`, `nextSteps`, `tags` |
| work-task | `status`, `project`, `owner`, `estimatedMinutes`, `aiSummary` |
| home-task | `status`, `location` |
| shopping | `items[]`, `store`, `budget`, `status` |
| read-watch | `url`, `mediaType`, `estimatedMinutes`, `status`, `aiSummary` |
| finance | `amount`, `currency`, `financeType`, `date`, `status` |
| travel | `destination`, `startDate`, `endDate`, `budget`, `status`, `aiSummary` |

---

## 7. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/captures` | 🔜 | List all captures for user |
| GET | `/api/captures/:id` | 🔜 | Get single capture |
| POST | `/api/captures` | 🔜 | Create capture |
| PUT | `/api/captures/:id` | 🔜 | Full replace (used by desktop editor) |
| DELETE | `/api/captures/:id` | 🔜 | Delete capture |

---

## 8. Key Decisions & Trade-offs

| Decision | Chosen approach | Alternative considered | Reason |
|----------|----------------|----------------------|--------|
| Category metadata | Single `meta` JSON column | Separate table per category | Flexibility; categories evolve quickly |
| `priority` / `dueDate` | Promoted to real columns | Stay in meta | Dashboard queries need to filter/sort by these |
| `actionItems` | Separate table | Array in meta | Cross-capture querying for dashboard |
| Optimistic updates | Update local state first, API fire-and-forget | Wait for API | Snappy UX on desktop |

---

## 9. Open Questions
- [ ] Should `status` (todo/in-progress/done) also be promoted to a real column?
- [ ] How to handle conflicts when two devices update the same capture simultaneously?

---

## 10. Future Improvements
- Real-time sync via Neon's live queries or websockets
- Full-text search across `title` + `content`
- Bulk operations (bulk complete, bulk delete)
