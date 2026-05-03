---
title: 'VN Itinerary Backend Implementation'
description: 'Build NestJS backend (Kysely + PostgreSQL) for Vietnam itinerary sharing platform'
status: pending
priority: P1
effort: 16h
branch: ''
tags: [backend, api, nestjs, database, feature]
created: 2026-05-03
---

# VN Itinerary Backend Implementation

## Overview

Build a NestJS backend serving the SvelteKit frontend at `localhost:5173`. Tech: NestJS 11, Kysely 0.28, PostgreSQL 15+, Zod 4, Bruno.

## Codebase Audit (Post-Boilerplate)

### What exists and works
- `CommonModule` (global): DB provider, CqrsModule, ConfigModule, exception filters, validation pipe
- `AuthModule` (complete boilerplate): Login command, JWT guard (custom, no passport), permission guard (default-deny, requires `@RequirePermission`), role/permission policy (hardcoded), `@Public()` / `@RequirePermission()` / `@CurrentUser()` decorators
- `AppModule` imports `CommonModule` only (auth not wired yet)
- CLI migration runner (FileMigrationProvider)
- `main.ts` with Swagger + CORS (missing `localhost:5173`)
- `tsconfig.json` updated: `nodenext` module, `@/*` path aliases, strict checks
- Uses raw `jsonwebtoken` (not `@nestjs/jwt`), custom `TokenIssuer` interface

### What needs work
- **Itinerary Write Model** — phase 3
- **Read Model** — phase 4
- **QA & Bruno** — phase 6

### DB Schema Review — Critical `users` table mismatch

The `DB_SCHEMA.md` `users` table has:
```
username, email, password_hash, display_name, avatar_url, bio, is_verified
```

But auth repo reads: `id, email, password_hash, status, role_key`

**Resolution:** Update `DB_SCHEMA.md` `users` table to include `role_key` (VARCHAR, default `'user'`) and `status` (VARCHAR, default `'active'`). These are needed by the auth boilerplate and NOT stored in a separate permissions DB table (permissions are hardcoded in application layer per user requirement).

## Decisions

- Image upload → Deferred to V2 (accept URL strings)
- Service references → Deferred to V2
- Bruno collection → `api-doc/`
- Permissions → Hardcoded in application layer, NOT in DB

## Phases

| #   | Phase                       | Status  | Effort | Link                                            |
| --- | --------------------------- | ------- | ------ | ----------------------------------------------- |
| 0   | Fix Foundation              | Completed | 1h     | [phase-00](./phase-00-fix-foundation.md)        |
| 1   | Database Migrations         | Completed | 2h     | [phase-01](./phase-01-database-migrations.md)   |
| 2   | Auth Enhancements           | Completed | 2h     | [phase-02](./phase-02-auth-enhancements.md)     |
| 3   | Itinerary Write Model       | Completed | 4h     | [phase-03](./phase-03-itinerary-write.md)       |
| 4   | Read Model (Explore/Detail) | Completed | 3.5h   | [phase-04](./phase-04-read-model.md)            |
| 5   | Bookmarks                   | Completed | 1.5h   | [phase-05](./phase-05-bookmarks.md)             |
| 6   | QA & Bruno                  | Completed | 2h     | [phase-06](./phase-06-qa-bruno.md)              |

## Phase 03: Itinerary Write Model (DRAFT) - ✅ Completed
- [x] Database Schema Reconciliation (Reconciled with DB_SCHEMA.md)
- [x] Itinerary Domain Errors & Entities
- [x] Itinerary Repository (Transactional Write Model with mapping)
- [x] Command Handlers: Create, Update, Publish, Archive
- [x] Query Handler: ListMyItineraries
- [x] Itinerary Controller (Endpoints wired)

## Dependencies

`Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6`

## Out of Scope (V1)

- Presigned image upload, service references
- Ratings/reviews, comments/likes, full-text search
- Refresh tokens, realtime notifications
