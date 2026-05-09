# Vietnam Itinerary Backend

NestJS backend service for Vietnam itinerary sharing. Built with clean architecture, CQRS, and Kysely.

## Features

- **Auth**: JWT-based authentication with role-based permissions (Register, Login, Me).
- **Itineraries**: 
  - Write Model: Create drafts, update, publish, and archive.
  - Read Model: Explore with region/tag filters, trending itineraries, and deep details.
  - View Tracking: IP-deduped view count tracking.
- **Bookmarks**: Authenticated users can save their favorite itineraries.
- **Leaderboard**: Public ranking of top itineraries.

## Requirements

- Node.js 20+
- PostgreSQL 15+

## Quick Start

1. Copy `.env.example` to `.env` and configure your database.
2. Install dependencies: `npm install`
3. Run migrations: `npm run migrate`
4. Start development: `npm run start:dev`

## Scripts

- `npm run start:dev`: Development server
- `npm run build`: Production build
- `npm run start:prod`: Start production server
- `npm run migrate`: Run database migrations
- `npm run migrate:rollback`: Rollback last migration
- `npm run codegen:database`: Generate Kysely types from database

## Activity Image Upload (Cloudflare R2)

### Required env vars

- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_UPLOAD_URL_TTL_SECONDS` (default `300`, hard max 300)
- `R2_PUBLIC_BASE_URL` (optional, used in itinerary detail image URL mapping)
- `UPLOAD_CLEANUP_INTERVAL_SECONDS` (default `600`)
- `UPLOAD_CLEANUP_DELETE_OBJECTS` (`true|false`, default `false`)

### FE upload sequence

1. `POST /v1/activity-images/uploads/reserve` with file manifest (`content_type`, `size_bytes`) for an activity.
2. Upload each file directly to R2 using returned `put_url` + `required_headers`.
3. `POST /v1/activity-images/uploads/confirm` with `upload_ids` after upload completes.
4. Send confirmed `upload_id` values in itinerary payload:
   - `days[].activities[].images[] = { upload_id, caption?, display_order }`
5. Backend attaches only confirmed, owned, non-expired sessions.

### Constraints

- Max 5 images per activity
- Max 10MB per image
- MIME allowlist: `image/jpeg`, `image/png`, `image/webp`, `image/heic`
- Cross-user session reuse is rejected

### R2 CORS example

```json
[
  {
    "AllowedOrigins": ["https://your-frontend.example.com"],
    "AllowedMethods": ["PUT", "HEAD"],
    "AllowedHeaders": ["content-type"],
    "ExposeHeaders": ["etag", "content-length", "content-type"],
    "MaxAgeSeconds": 300
  }
]
```

### Token scope and lifecycle notes

- R2 access key must be scoped to the target bucket only.
- Keep bucket private; backend signs temporary upload URLs.
- Apply object lifecycle rule for `tmp/` prefix for orphan cleanup backup.
- Backend cleanup job expires stale upload sessions and can optionally delete orphan objects.

## API Documentation

- Swagger UI: `http://localhost:3000/api`
- Bruno Collection: Located in `api-doc/VN-Itinerary/`
