## Context

- [auth.module.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/modules/auth/auth.module.ts)
- [auth.controller.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/modules/auth/presentation/auth.controller.ts)
- [password-hasher.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/modules/auth/domain/password-hasher.ts)
- [permission-key.ts](file:///Users/dangcongtoan/Desktop/codes/VN%20itinerary/BE/src/modules/auth/application/policy/permission-key.ts)

## Overview

- **Priority:** P1
- **Status:** Completed
- **Description:** Add register + GetMe to existing auth boilerplate. Add `hash()` to PasswordHasher. Populate itinerary permission keys.

## What Already Exists (Do NOT recreate)

- Login command + handler + DTO ✓
- JWT guard (custom, no passport) ✓
- Permission guard (default-deny) ✓
- Role/permission policy (hardcoded) ✓
- `@Public()`, `@RequirePermission()`, `@CurrentUser()` decorators ✓
- TokenIssuer (raw jsonwebtoken) ✓
- PasswordHasher (verify only) ✓
- AuthRepository interface + Kysely impl ✓

## What Needs Adding

### 1. `PasswordHasher` — add `hash()` method

```ts
// domain/password-hasher.ts
export abstract class PasswordHasher {
  abstract hash(plainText: string): Promise<string>;     // NEW
  abstract verify(plainText: string, hash: string): Promise<boolean>;
}
```

Update `Argon2PasswordHasherImpl` to implement `hash()`.

### 2. Register Command

- `application/commands/register/register.command.ts`
- `application/commands/register/register.command-handler.ts`
- `application/commands/register/register.dto.ts`
- Zod DTO: `{ username, email, password, displayName? }`
- Auth errors: add `EMAIL_ALREADY_EXISTS`, `USERNAME_TAKEN`
- AuthRepository: add `findByUsername()`, `createUser()`
- Handler: check uniqueness → hash password → insert → return `Result<{ id, email }>`

### 3. GetMe Query

- `application/queries/me/get-me.query.ts`
- `application/queries/me/get-me.query-handler.ts`
- `application/queries/me/get-me.dto.ts`
- AuthRepository: add `findUserProfile(id)`
- Returns: `{ id, username, email, displayName, avatarUrl, bio, isVerified, roleKey }`

### 4. Auth Controller Updates

- Add `POST /auth/register` (`@Public()`)
- Add `GET /auth/me` (private, use `@CurrentUser()`)
- Fix existing login summary from "Admin Login" to "Login"

### 5. Permission Keys

Populate `PermissionKeys` for itinerary operations:
```ts
export const PermissionKeys = {
  ITINERARY_CREATE: 'itinerary:create',
  ITINERARY_UPDATE: 'itinerary:update',
  ITINERARY_PUBLISH: 'itinerary:publish',
  ITINERARY_ARCHIVE: 'itinerary:archive',
  ITINERARY_LIST_OWN: 'itinerary:list-own',
  BOOKMARK_CREATE: 'bookmark:create',
  BOOKMARK_DELETE: 'bookmark:delete',
  BOOKMARK_LIST: 'bookmark:list',
} as const;
```

Update `RolePermissionPolicy` — `USER` role gets all above permissions.

### 6. JWT Issuer/Audience

Update `jwt-token.service.ts` defaults from `vietbike-api`/`vietbike-users` to `vn-itinerary-api`/`vn-itinerary-users`.

## Todo List

- [x] Add hash() to PasswordHasher + impl
- [x] Add auth errors (EMAIL_ALREADY_EXISTS, USERNAME_TAKEN)
- [x] Extend AuthRepository (findByUsername, createUser, findUserProfile)
- [x] Register command + handler + DTO
- [x] GetMe query + handler + DTO
- [x] Update auth controller (register, me endpoints)
- [x] Populate PermissionKeys
- [x] Update role-permission policy
- [x] Fix JWT issuer/audience defaults

## Success Criteria

- `POST /auth/register` creates user and returns 201
- `POST /auth/login` with new user credentials returns JWT
- `GET /auth/me` with Bearer token returns profile
- `GET /auth/me` without token returns 401
