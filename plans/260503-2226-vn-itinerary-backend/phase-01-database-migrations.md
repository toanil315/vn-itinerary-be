## Context

- [DB_SCHEMA.md](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/docs/DB_SCHEMA.md)
- [auth.repository.impl.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/modules/auth/infrastructure/auth.repository.impl.ts)
- [user-identity.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/modules/auth/domain/user-identity.ts)

## Overview

- **Priority:** P1
- **Status:** Completed
- **Description:** Create all migration files. **Must reconcile DB_SCHEMA.md `users` table with auth boilerplate.**

## Critical: `users` Table Schema Update

The `DB_SCHEMA.md` `users` table is missing two columns the auth module requires:

| Column | Why | Default |
|---|---|---|
| `role_key` | Auth repo reads it, JWT embeds it, permission guard checks it | `'user'` |
| `status` | `isActiveUser()` checks `status === 'active'` | `'active'` |

**Plan:** Add `role_key VARCHAR(30) NOT NULL DEFAULT 'user'` and `status VARCHAR(20) NOT NULL DEFAULT 'active'` to migration `002-create-users`. Update `DB_SCHEMA.md` to match.

Also note: the `is_verified` column in schema is still useful for display but doesn't affect auth flow.

## Implementation Steps

1. Migration `001-enable-extensions-and-enums.ts`
   - `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
   - `CREATE TYPE itinerary_status AS ENUM ('draft', 'published', 'archived')`
   - `CREATE TYPE session_type AS ENUM ('morning', 'lunch', 'afternoon', 'evening')`

2. Migration `002-create-users.ts`
   - Per DB_SCHEMA.md PLUS `role_key` and `status` columns
   - Columns: id, username, email, password_hash, display_name, avatar_url, bio, is_verified, **role_key**, **status**, created_at, updated_at

3. Migrations `003` through `009` — unchanged from original plan
   - 003: itineraries
   - 004: itinerary_days
   - 005: activities
   - 006: activity_images
   - 007: tags + itinerary_tags
   - 008: itinerary_views
   - 009: bookmarks

4. Migration `010-seed-tags.ts` — seed default tags

5. Update `DB_SCHEMA.md` — add `role_key` and `status` to users table

6. Run `npm run migrate` then `npm run codegen:database`

## Todo List

- [ ] Migration 001 — extensions + enums
- [ ] Migration 002 — users (with role_key + status)
- [ ] Migration 003 — itineraries
- [ ] Migration 004 — itinerary_days
- [ ] Migration 005 — activities
- [ ] Migration 006 — activity_images
- [ ] Migration 007 — tags + itinerary_tags
- [ ] Migration 008 — itinerary_views
- [ ] Migration 009 — bookmarks
- [ ] Migration 010 — seed tags
- [ ] Update DB_SCHEMA.md
- [ ] Run migrations + codegen

## Success Criteria

- All migrations apply
- `generated.d.ts` has correct types including `role_key`, `status` on users
- Auth repo impl compiles against new generated types
