# Phase 05 — Hardening, lifecycle, and QA

## Implementation Status

- [x] Completed

## Overview

Finalize security controls, cleanup mechanisms, observability, and end-to-end verification.

## Requirements

1. Strict R2 CORS for frontend origins only.
2. Temporary object cleanup policy and stale-session cleanup job.
3. API docs and examples for FE upload sequence.

## Related Code Files

- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/README.md`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/api-doc/*`
- Create: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/modules/upload/application/jobs/cleanup-stale-uploads.job.ts`
- Modify: `/Users/dangcongtoan/Desktop/codes/VN itinerary/BE/src/common/database/migrations/index.ts`

## Implementation Steps

1. Add runbook docs:
   - R2 CORS JSON example
   - Token scope policy
   - lifecycle rule for `tmp/` prefix
2. Add cleanup job:
   - expire stale reserved sessions
   - optionally delete matching orphan objects
3. Add audit-safe logs:
   - reserve/confirm attempts, user ID, upload IDs
   - never log full presigned URL query string
4. Add test matrix:
   - valid flow
   - expired URL
   - oversize file
   - wrong MIME
   - non-owner upload ID
   - >5 images/activity rejection

## Success Criteria

- Security controls are documented and enforceable in code.
- FE has clear API contract and sequence for integration.
- Failure cases return explicit, actionable errors.
