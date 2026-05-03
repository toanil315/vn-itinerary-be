## Context

- [app.module.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/app.module.ts)
- [main.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/main.ts)
- [common.module.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/common/common.module.ts)

## Overview

- **Priority:** P0 — blocks everything
- **Status:** Completed
- **Description:** Fix remaining broken references, wire AuthModule, add health endpoint, fix CORS.

## What Changed

User added full auth boilerplate, deleted `app.controller.ts`, simplified `app.module.ts` to just `CommonModule`, updated `tsconfig.json` to `nodenext` with `@/*` aliases. Guards/decorators now live inside `modules/auth/` — no need to create in `common/`.

## Related Code Files

### Create
- `src/common/domain/repository.ts` (replace typo `repository,.ts`)
- `src/app.controller.ts` (re-create with health endpoint using auth module's `@Public()`)

### Modify
- `src/app.module.ts` — import `AuthModule`
- `src/main.ts` — add `http://localhost:5173` to CORS origins

### Delete
- `src/common/domain/repository,.ts` (typo filename)
- `src/common/decorators/public.decorator.ts` (we created this, but auth module has its own)
- `src/common/decorators/require-permission.decorator.ts` (same — auth module has its own)
- `src/common/guards/jwt-auth.guard.ts` (auth module has its own)
- `src/common/guards/permission.guard.ts` (auth module has its own)

## Implementation Steps

1. Delete duplicate files we created earlier (`common/decorators/`, `common/guards/`)
2. Delete `src/common/domain/repository,.ts`, create `src/common/domain/repository.ts`
3. Re-create `src/app.controller.ts` with health endpoint
   - Import `@Public()` from `@/modules/auth/public`
   - Import `Result` from `@/common/domain/result`
4. Update `src/app.module.ts`: import `AuthModule` from `./modules/auth/auth.module`
5. Update `src/main.ts`: add `http://localhost:5173` to CORS origins

## Todo List

- [ ] Clean up duplicate decorator/guard files
- [ ] Fix repository filename
- [ ] Re-create app.controller.ts
- [ ] Wire AuthModule into AppModule
- [ ] Fix CORS in main.ts

## Success Criteria

- `npm run start:dev` boots without errors
- `GET /health` returns `{ success: true, data: { status: "ok" } }`
- `POST /auth/login` route is accessible
- Swagger at `/api` loads
