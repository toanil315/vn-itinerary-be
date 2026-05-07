# Phase 03 — Itinerary payload extension for activity images

## Overview

Extend create/update itinerary write model to accept optional `images` arrays on each activity and persist confirmed uploads to `activity_images`.

## Requirements

1. `create itinerary` and `update itinerary` payloads support optional `activities[].images[]`.
2. Each image entry maps to confirmed upload session only.
3. Persist activity-image relation transactionally with itinerary write operations.

## Related Code Files

- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/itinerary/application/commands/create-itinerary/create-itinerary.dto.ts`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/itinerary/application/commands/update-itinerary/update-itinerary.dto.ts`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/itinerary/infrastructure/itinerary.repository.impl.ts`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/itinerary/presentation/itinerary.controller.ts`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/common/database/migrations/013-alter-activity-images-for-r2-keys.ts`

## Payload Shape (target)

`activities[].images[]`:
- `upload_id` (required)
- `caption` (optional)
- `display_order` (required int)

Server resolves `upload_id -> object_key/url` from confirmed upload sessions; FE does not send arbitrary URL.

## Implementation Steps

1. Update zod schemas:
   - images optional
   - max 5 images/activity
   - dedupe/validate `display_order`
2. In repository create flow:
   - insert itinerary/day/activity rows
   - resolve and lock confirmed upload sessions for current user
   - insert `activity_images` rows per activity
3. In repository update flow:
   - preserve current strategy (rewrite days/activities)
   - delete stale `activity_images` linked to rewritten activities
   - reinsert from incoming confirmed upload refs
4. Mark consumed upload sessions as attached/used.

## Success Criteria

- Create/update works with and without images.
- Invalid upload references fail fast with domain error.
- No cross-user upload session reuse possible.
