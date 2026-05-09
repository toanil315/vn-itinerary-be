---
title: "R2 Activity Image Upload Plan"
description: "Add secure Cloudflare R2 signed-upload flow and optional activity images in create/update itinerary payloads."
status: pending
priority: P1
effort: 14h
branch: main
tags: [backend, api, security, feature]
created: 2026-05-07
---

# R2 Activity Image Upload Plan

## Overview

Implement direct browser upload to Cloudflare R2 using backend-generated signed PUT URLs, then allow `create itinerary` and `update itinerary` payloads to include optional multiple images per activity.

## Scope and Decisions

- Max images per activity: **5**
- Max image size: **10 MB**
- Release scope: **no malware scanner yet**, but architecture keeps a clean extension point
- Upload flow: two-phase commit (`reserve/sign -> upload -> confirm -> create/update itinerary`)
- R2 posture: private bucket, strict CORS, short-lived presigned URLs

## Security Baseline (MUST)

1. Backend owns object key generation; FE cannot choose keys.
2. Presigned URL TTL <= 5 minutes.
3. Upload sessions stored server-side with status transitions.
4. Confirm endpoint performs `HEAD` verification (size/content-type/key ownership) before image can be attached to itinerary.
5. Lifecycle cleanup for temporary/orphaned uploads.
6. R2 token scope minimized to target bucket only.

## Phases

| # | Phase | Status | Effort | Link |
|---|---|---|---|---|
| 1 | Storage foundation and R2 signer | Completed | 3h | [phase-01](./phase-01-storage-foundation.md) |
| 2 | Upload reservation and confirmation API | Completed | 3h | [phase-02](./phase-02-upload-session-api.md) |
| 3 | Itinerary payload extension for activity images | Completed | 4h | [phase-03](./phase-03-itinerary-images-write-flow.md) |
| 4 | Read model and response mapping for activity images | Completed | 2h | [phase-04](./phase-04-read-model-images.md) |
| 5 | Hardening, limits, lifecycle, and QA | Completed | 2h | [phase-05](./phase-05-security-hardening-and-qa.md) |

## Dependencies

`Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5`

## Deliverable Shape

- New upload APIs for FE signed-upload flow
- Updated create/update DTOs to support optional `activities[].images[]`
- DB write/read path for `activity_images`
- Security controls aligned with Cloudflare R2 best practices
- API docs updated with new flow and payload contracts
