## Overview

- **Priority:** P2
- **Status:** Pending
- **Description:** Bruno API collection, build verification, docs update.

## Implementation Steps

1. **Bruno collection** at `api-doc/VN-Itinerary/`
   - Environments: `local` (localhost:3000), `ci`
   - Auth flow: register → login → use token variable
   - All endpoints with example payloads

2. **Build verification**
   - `npm run build` passes
   - `npm run migrate` idempotent
   - `npm run start:prod` boots

3. **Update docs**
   - `README.md` — new endpoints, correct env vars
   - `deployment-guide.md` — correct smoke check paths

## Todo List

- [x] Bruno collection setup
- [x] Auth request files
- [x] Itinerary request files
- [x] Build verification
- [x] Update README.md
- [x] Update deployment-guide.md

## Success Criteria

- `bru run api-doc/VN-Itinerary --env local` passes
- `npm run build` succeeds
- Swagger at `/api` shows all endpoints
