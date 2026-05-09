# Phase 04 — Read model and response mapping for activity images

## Implementation Status

- [x] Completed

## Overview

Ensure itinerary detail/list projections expose activity images consistently after write-flow changes.

## Requirements

1. Fetch image records per activity in detail query.
2. Define stable response shape for FE rendering.
3. Keep ordering by `display_order`.

## Related Code Files

- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/itinerary/infrastructure/itinerary.repository.impl.ts`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/itinerary/domain/activity.entity.ts`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/itinerary/application/queries/get-itinerary-detail/get-itinerary-detail.dto.ts`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/itinerary/application/queries/get-itinerary-detail/get-itinerary-detail.query-handler.ts`

## Implementation Steps

1. Add image sub-entity/value object to `Activity`.
2. Query `activity_images` when loading itinerary details.
3. Map object keys to delivery URL strategy:
   - either stored CDN URL
   - or backend-signed read URL endpoint if private-read is required.
4. Ensure list endpoints avoid heavy joins unless images are explicitly needed.

## Success Criteria

- Itinerary detail includes ordered image arrays per activity.
- Existing consumers without images remain backward-compatible.
