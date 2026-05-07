# Phase 01 — Storage foundation and R2 signer

## Overview

Create R2 integration primitives and data model to safely issue signed upload URLs.

## Requirements

1. Add R2 config env vars and validation.
2. Implement signer service for presigned `PUT` URLs.
3. Introduce upload session persistence for one-time usage and ownership checks.

## Related Code Files

- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/app.module.ts`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/common/common.module.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/upload.module.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/domain/upload-session.entity.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/infrastructure/r2-signer.service.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/common/database/migrations/012-create-upload-sessions.ts`

## Implementation Steps

1. Add R2 env config:
   - `R2_ACCOUNT_ID`
   - `R2_BUCKET_NAME`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_UPLOAD_URL_TTL_SECONDS` (default 300)
2. Create `upload_sessions` table:
   - `id`, `user_id`, `object_key`, `bucket`, `status`, `content_type`, `max_size_bytes`, `expires_at`, `uploaded_at`, `confirmed_at`, `created_at`.
3. Add status enum in domain (`reserved`, `uploaded`, `confirmed`, `expired`, `rejected`).
4. Implement signer service using AWS SDK v3 S3-compatible client against R2 endpoint.
5. Key strategy:
   - `tmp/user_{userId}/activity/{uploadId}.{safeExt}`
   - random IDs only, no original filename in key.

## Success Criteria

- Backend can generate signed PUT URL and required headers with fixed TTL.
- Upload session row created for each reserved upload.
- Key path is deterministic, scoped, and FE cannot override.
