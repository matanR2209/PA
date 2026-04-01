# HLD — Database Schema

> **Status:** Implemented
> **Last updated:** 2026-03-31
> **Author:** Matan

---

## 1. Overview
IdeaPA uses a PostgreSQL database hosted on Neon (serverless, branch-based). Prisma is used as the ORM. The schema is designed to support multi-user, multi-app expansion in the future.

---

## 2. Entity Relationship Diagram

```
User
 ├── 1 ──── N  Capture
 │               ├── 1 ──── N  Note
 │               ├── 1 ──── N  Recording
 │               ├── 1 ──── N  ActionItem
 │               └── N ──── M  Label  (via CaptureLabel)
 └── 1 ──── N  Label
```

---

## 3. Table Definitions

### User
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| email | String | Unique |
| password | String | bcrypt hash |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Capture
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| title | String | |
| content | String | Raw voice/text input |
| type | String | "idea" \| "task" |
| category | String? | "idea" \| "work-task" \| etc. |
| priority | String? | "low" \| "medium" \| "high" |
| dueDate | DateTime? | Indexed for dashboard queries |
| meta | Json | Category-specific fields |
| userId | String? | FK → User (nullable until auth) |
| createdAt | DateTime | Indexed desc |
| updatedAt | DateTime | |

### Note
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| text | String | |
| createdAt | DateTime | |
| captureId | String | FK → Capture (cascade delete) |

### ActionItem
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| text | String | |
| status | String | "todo" \| "in-progress" \| "done" |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| captureId | String | FK → Capture (cascade delete) |

### Recording
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| url | String | Audio file URL |
| size | Int | Bytes |
| mimeType | String | |
| captureId | String | FK → Capture (cascade delete) |

### Label
| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| name | String | Unique per user |
| color | String | Hex color |
| userId | String | FK → User (cascade delete) |

### CaptureLabel (junction)
| Column | Type | Notes |
|--------|------|-------|
| captureId | String | FK → Capture |
| labelId | String | FK → Label |
| | | Composite PK |

---

## 4. Infrastructure

| Environment | Neon Branch | Used by |
|-------------|-------------|---------|
| Dev | `dev` | Local development |
| Prod | `production` | Live app |

**Connection types:**
- `DATABASE_URL` — pooled via PgBouncer (runtime)
- `DIRECT_URL` — direct connection (Prisma Migrate only)

---

## 5. Key Decisions

| Decision | Chosen | Alternative | Reason |
|----------|--------|-------------|--------|
| Host | Neon (serverless PG) | Supabase, AWS RDS | Branch-based dev/prod, scales to zero |
| ORM | Prisma 5 | Drizzle, raw SQL | Type safety, migration tooling |
| Meta as JSON | Flexible Json column | Table-per-category | Categories evolve; only shared fields promoted |
| Promoted columns | priority, dueDate | All in meta | Dashboard queries need SQL-level filtering |

---

## 6. Future Improvements
- Add `dev` branch to Neon for local development isolation
- Add more apps as separate Neon projects under the same org
- Consider promoting `status` to a real column if cross-capture status filtering is needed
