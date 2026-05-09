# Phase 02 — Upload reservation and confirmation API

## Implementation Status

- [x] Completed

## Overview

Expose authenticated APIs for FE to reserve upload slots, receive signed URLs, and confirm completed uploads.

## Requirements

1. Reserve endpoint supports batch reservation for multiple files.
2. Enforce per-file and per-activity limits:
   - max files/activity: 5
   - max size/image: 10 MB
3. Confirm endpoint verifies object existence before marking usable.

## Related Code Files

- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/auth/application/policy/permission-key.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/presentation/upload.controller.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/application/commands/reserve-activity-images/reserve-activity-images.dto.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/application/commands/reserve-activity-images/reserve-activity-images.command-handler.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/application/commands/confirm-activity-images/confirm-activity-images.dto.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/application/commands/confirm-activity-images/confirm-activity-images.command-handler.ts`

## API Contract (target)

1. `POST /v1/activity-images/uploads/reserve`
   - Input: activity client reference + file manifest (`content_type`, `size_bytes`, optional `caption`)
   - Output: `upload_id`, `object_key`, `put_url`, `required_headers`, `expires_at`
2. `POST /v1/activity-images/uploads/confirm`
   - Input: list of `upload_id`
   - Backend action: `HEAD` each object in R2, validate size/type, mark `confirmed`
   - Output: confirmed upload descriptors usable by itinerary payload

## Implementation Steps

1. Add zod DTO validation:
   - MIME allowlist (jpeg/png/webp/heic optional by product decision)
   - `size_bytes <= 10 * 1024 * 1024`
   - list length and per-activity max 5
2. Add idempotency support on reserve (header or request key).
3. Implement rate limit guard for reserve endpoint (per user/IP).
4. Confirm endpoint hard-fails missing/expired/not-owned upload IDs.

## Success Criteria

- FE can reserve and receive signed URLs for batch uploads.
- Confirm endpoint guarantees only valid uploaded objects can be referenced downstream.
