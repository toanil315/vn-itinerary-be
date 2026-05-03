# Deployment Guide

## 1. Deployment Targets

This guide assumes deployment as a Node.js service backed by PostgreSQL.

## 2. Required Environment Variables

- `PORT`
- `NODE_ENV`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `GOOGLE_SHEETS_SERVICE_ACCOUNT_FILE_PATH` (optional, default: `gg.service-account.json`)

## 3. Build and Release Steps

1. Install dependencies:
   - `npm ci`
2. Build:
   - `npm run build`
3. Run migrations:
   - `npm run migrate`
4. Start application:
   - `npm run start:prod`

If booking sync target APIs are used, ensure the service account JSON file exists at the configured path before startup.

## 4. Container-Oriented Flow (If Used)

1. Build app image.
2. Ensure database is reachable from runtime network.
3. Run migration command as pre-start job or startup hook.
4. Start the service process.

## 5. Health and Smoke Checks

After deployment:

- Verify process starts without configuration errors.
- Check Swagger endpoint at `/api`.
- Run Bruno collection smoke if API docs are part of the deployment change:
  - `bru run api-doc/Vietbike --env ci`
- Run smoke calls for:
  - `GET /public/vehicles`
  - `GET /bookings`
  - `GET /bookings/sync/target`
  - `GET /bookings/sync/spreadsheets?page=1&pageSize=10`

Bruno CI automation is defined in `.github/workflows/bruno-api-smoke.yml` and uploads report artifacts.

## 6. Rollback

- Code rollback: redeploy previous app artifact.
- Schema rollback (if needed):
  - `npm run migrate:rollback`
- Use rollback carefully if data-transforming migrations are present.

## 7. Operational Risks

- No built-in auth means public exposure risk for admin routes unless protected by gateway/network policy.
- Migration execution should be serialized to avoid concurrent runner conflicts.
- Ensure connection pool settings match environment scale.
- Service-account JSON file must be protected with least-privilege file permissions.

## 8. Recommended Hardening

- Add infrastructure-level authentication controls before public exposure.
- Add structured logging and centralized log shipping.
- Add readiness/liveness checks at orchestration level.
- Add backup and restore validation for PostgreSQL.
