## Context

- [DB_SCHEMA.md](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/docs/DB_SCHEMA.md) — itineraries, days, activities
- [code-standards.md](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/docs/code-standards.md) — CQRS §4, Persistence §6
- [create page FE](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/vn-itinerary/src/routes/create/+page.server.ts)
- [auth public exports](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/modules/auth/public/index.ts)

## Overview

- **Priority:** P1
- **Status:** Pending
- **Description:** Create/update/publish/archive commands with transactional nested writes.

## Key Auth Integration Notes

- Import `@Public()`, `@RequirePermission()`, `@CurrentUser()` from `@/modules/auth/public`
- Use `PermissionKeys.ITINERARY_CREATE` etc. for permission checks
- `@CurrentUser()` returns `AuthenticatedUser` with `{ userId, email, roleKey }`
- Owner checks: compare `request.user.userId` with `itinerary.author_id`

## Architecture

```
src/modules/itinerary/
├── itinerary.module.ts
├── domain/
│   └── itinerary.errors.ts
├── application/
│   ├── commands/
│   │   ├── create-itinerary/
│   │   ├── update-itinerary/
│   │   ├── publish-itinerary/
│   │   └── archive-itinerary/
│   └── queries/
│       └── list-my-itineraries/
├── infrastructure/
│   └── itinerary.repository.ts
└── presentation/
    └── itinerary.controller.ts
```

## Implementation Steps

1. **Domain errors** — `ITINERARY.NOT_FOUND`, `NOT_OWNER`, `CANNOT_PUBLISH`, `ALREADY_PUBLISHED`

2. **CreateItinerary** — generate slug, transaction: insert itinerary → days → activities → images → tags. Return `Result<{ id, slug }>`

3. **UpdateItinerary** — owner check, draft only. Delete children + re-insert in tx.

4. **PublishItinerary** — validate ≥1 day with ≥1 activity. Set `status='published'`, `published_at=now()`.

5. **ArchiveItinerary** — owner check. Set `status='archived'`.

6. **ListMyItineraries** — `WHERE author_id = $userId ORDER BY updated_at DESC`, paginated.

7. **Repository** — all Kysely queries. Transaction via `db.transaction().execute()`.

8. **Controller** — all private, each uses `@RequirePermission(PermissionKeys.ITINERARY_*)`:
   - `POST /v1/itineraries` — create
   - `PATCH /v1/itineraries/:id` — update
   - `POST /v1/itineraries/:id/publish` — publish
   - `POST /v1/itineraries/:id/archive` — archive
   - `GET /v1/me/itineraries` — list own

## Todo List

- [ ] Domain errors
- [ ] CreateItinerary command + handler + DTO
- [ ] UpdateItinerary command + handler
- [ ] PublishItinerary command + handler
- [ ] ArchiveItinerary command + handler
- [ ] ListMyItineraries query
- [ ] Itinerary repository
- [ ] Write controller
- [ ] Wire ItineraryModule + add to AppModule

## Success Criteria

- Create draft → update → publish works end-to-end
- Publish fails if no days/activities
- Non-owner mutation returns `NOT_OWNER`
- All writes transactional
