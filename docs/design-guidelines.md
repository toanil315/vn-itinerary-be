# Design Guidelines

## Purpose

This document defines practical API and backend design guidelines for maintaining consistency in this codebase.

## 1. API Design

- Keep endpoint naming resource-oriented and stable.
- Use DTOs with schema validation for all request bodies and query parameters.
- Return consistent response envelopes through shared `Result<T>` flow.
- Prefer additive API changes over breaking changes.

## 2. Module Design

- Keep each module bounded by domain context.
- Keep controllers thin and application handlers focused.
- Add shared utilities only when used by multiple modules.
- Avoid cross-module direct infrastructure coupling.

## 3. Domain Design

- Encode invariants in domain entities or domain-focused handlers.
- Keep state transitions explicit and validated.
- Use domain errors with meaningful codes/messages.
- Define and document domain events when behavior matters outside the transaction boundary.

## 4. Persistence Design

- Put SQL/query details inside repository implementations.
- Keep DB-to-domain mapping explicit and centralized.
- Add migrations for every schema change and avoid drift.
- Document any schema debt and deprecation windows.

## 5. Validation and Error Design

- Validate input early with Zod-integrated DTOs.
- Do not surface raw internal errors to API clients.
- Maintain a stable error response format.
- Include enough context for debugging without exposing sensitive data.

## 6. Performance Design

- Default list APIs to pagination.
- Avoid unbounded query patterns.
- Add indexes for frequently filtered/sorted columns.
- Monitor query behavior before and after major schema updates.

## 7. Security Design

- Assume admin endpoints require authentication and authorization by default.
- Treat customer and document fields as sensitive.
- Minimize PII in logs and error payloads.
- Enforce least-privilege credentials for DB and runtime.

## 8. Documentation Design

- Update docs in `docs/` in the same change set as feature changes.
- Mark assumptions and known risks explicitly.
- Prefer concise checklists and decision records over narrative-only docs.
