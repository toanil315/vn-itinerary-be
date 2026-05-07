# Research Report — Cloudflare R2 Security and Best Practices

## Key Findings

1. R2 presigned URL support is `GET/HEAD/PUT/DELETE`; presigned `POST` is not supported.
2. Presigned URLs are bearer tokens; they are reusable until expiry.
3. For browser uploads, strict CORS and short URL TTL are mandatory.
4. Upload constraints must be enforced by API and confirm-time validation (R2 does not provide POST policy constraints).

## Recommended Policy for This Project

- Private upload bucket.
- Signed `PUT` URLs with max TTL 300s.
- Backend-generated object keys only (`tmp/user_{id}/activity/{uploadId}.{ext}`).
- Upload sessions in DB with statuses (`reserved`, `confirmed`, `expired`).
- Confirm endpoint runs `HEAD` validation for size/type/ownership.
- Max per activity: 5 images.
- Max size/image: 10 MB.
- Lifecycle cleanup for `tmp/` orphaned objects.

## Security Checklist

### MUST

1. Backend controls key path and scoping.
2. Strict CORS allowlist by exact origin/method/header.
3. Min-scope R2 API token per bucket.
4. Short URL TTL + server-side upload session validation.
5. Reject create/update payloads that reference unconfirmed uploads.

### SHOULD

1. Add `Content-MD5` integrity check for upload.
2. Add async malware scanning via event notifications in a follow-up phase.
3. Strip EXIF metadata before public serving.

## Sources

- Presigned URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- S3 compatibility matrix: https://developers.cloudflare.com/r2/api/s3/api/
- CORS: https://developers.cloudflare.com/r2/buckets/cors/
- Event notifications: https://developers.cloudflare.com/r2/buckets/event-notifications/
- Object lifecycle: https://developers.cloudflare.com/r2/buckets/object-lifecycles/
- R2 limits: https://developers.cloudflare.com/r2/platform/limits/
- Public buckets notes: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Audit logs: https://developers.cloudflare.com/r2/platform/audit-logs/
- Metrics/analytics: https://developers.cloudflare.com/r2/platform/metrics-analytics/
- Data location/jurisdiction: https://developers.cloudflare.com/r2/reference/data-location/
- Cloudflare UGC reference architecture: https://developers.cloudflare.com/reference-architecture/diagrams/storage/storing-user-generated-content/
