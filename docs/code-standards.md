# Code Standards

## 1. Core Principles

- Keep domain behavior in domain entities or command/query handlers, not controllers.
- Controllers only orchestrate transport concerns and bus dispatch.
- Return `Result<T>` between layers for consistent success/failure handling.
- Favor explicit domain errors over generic throw/catch patterns.

## 2. Folder and Module Conventions

Each feature module follows:

- `domain/`: entities, value objects, events, repository interface, domain errors
- `application/commands/`: write-side commands + handlers + DTOs
- `application/queries/`: read-side queries + handlers + DTOs
- `infrastructure/`: repository implementation
- `presentation/`: NestJS controllers

Cross-cutting code belongs in `src/common`.

Module public entrypoint policy:

- Every module must expose cross-module contracts only under `public/`.
- Other modules must import through `src/modules/<module>/public` only.
- Importing another module internals (`application`, `domain`, `infrastructure`, `presentation`) is prohibited.

## 3. Naming Conventions

- Files: kebab-case (for example `create-booking.command-handler.ts`)
- Classes/types/enums: PascalCase
- Variables/functions/methods: camelCase
- Constants/tokens: UPPER_SNAKE_CASE or clear token names (`DATABASE_TOKEN`)
- Avoid abbreviations unless universally understood (e.g. `DTO`, `ID`).
- Use descriptive names that convey intent and domain meaning.
- For naming ports and adapters, use the pattern `<Name>` and `<Name>Impl` (e.g. `BookingSheetSync`, `GoogleSheetsImpl`). DO NOT use `Port` or `Adapter` suffixes in class names.

## 4. CQRS Guidelines

- Every command/query has one handler.
- Keep handler responsibilities focused:
  - Validate business invariants
  - Call repository methods
  - Build domain result DTO
- Avoid direct DB access from controllers.

## 5. Error and Validation Standards

- Request data shape validation should be schema-driven (Zod DTO integration). All validation errors should return a consistent 400 response with details. For example:

```json
{
  "success": false,
  "error": {
    "code": "VB_VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "customerName": ["Invalid input: expected string, received number"]
    }
  },
  "timestamp": "2026-03-26T10:22:17.240Z"
}
```

- Domain failures should map to well-defined `BusinessError`. For example:

````json
{
  "success": false,
  "error": {
    "code": "BOOKING.NOT_FOUND",
    "message": "The booking with reference a was not found"
  },
  "timestamp": "2026-03-26T10:21:34.216Z"
}
```

- Another layer's error (repository, mapper, ...) should be thrown as `ServiceError` with context, not swallowed or re-thrown as generic errors.
- Use global exception filters for transport-level consistency.
- Never leak raw database errors directly to API clients.
- For expected failure scenarios (e.g. "booking not found"), return a controlled error response with appropriate HTTP status code and message, rather than throwing an unhandled exception. for example

```json
{
  "success": false,
  "error": {
    "code": "BOOKING.NOT_FOUND",
    "message": "The booking with reference a was not found"
  },
  "timestamp": "2026-03-26T10:21:34.216Z"
}
````

## 6. Persistence Standards

- Use repository interfaces in domain/application layers.
- Repository should accept domain entities and return domain entities, not persistence models.
- Keep Kysely-specific query details inside infrastructure implementations.
- Use migrations for all schema changes.
- Do not mutate historical migration files after merge.

## 7. API and DTO Standards

- Keep DTOs near their command/query handlers. For example, `CreateBookingDTO` should be in the same folder as `CreateBookingCommandHandler`.
- Annotate endpoint behavior with Swagger decorators. For example:

```ts
@ApiTags('Bookings')
@Controller('bookings')
export class AdminBookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create Booking',
    description: 'Create a booking from manual booking form',
  })
  @ApiZodResponse({
    description: 'Booking created successfully',
    type: CreateBookingResponse,
    statusCode: 201,
  })
  async createBooking(
    @Body() request: CreateBookingRequest,
  ): Promise<Result<any>> {
    const command = new CreateBookingCommand(request);
    return await this.commandBus.execute(command);
  }
```

- Use explicit response DTOs for each endpoint. Avoid returning domain entities directly from controllers.
- Preserve backward compatibility for public routes unless versioned.

## 8. Configuration Standards

- Use `ConfigService.getOrThrow` for required environment settings.
- Keep defaults explicit and minimal.
- Document all required env vars in `README.md`.

## 9. Auth and Authorization Standards

- Private routes must define explicit permission metadata via `@RequirePermission(...)`.
- Public routes must be explicitly marked with `@Public()`.
- Authorization model is default-deny: private route without permission metadata should fail.
- Role-permission policy is hardcoded in application layer for current phase.
- JWT access token TTL is 4 hours unless explicitly changed by architecture decision.

## 10. Testing Standards (Target)

- Unit tests for domain entities and critical handlers.
- Integration tests for repository behavior and migration health.
- E2E coverage for controller endpoints and response contracts.
- Add regression tests for business-rule bugs.

## 11. Development Workflow Standards

- Always start with a clear implementation plan in `docs/plans/`.
- Follow the plan step by step, and update the plan if any changes are needed during implementation
- Keep PRs focused and small, ideally one per feature or bug fix.
- Link related PRs to their corresponding plan documents for context.
- Update documentation in the same PR as code changes, especially for architectural decisions and known risks.
- Update postman collection and API docs with any endpoint changes.
- For larger features, consider a multi-phase plan with incremental deliverables and clear success criteria for each phase.

## 12. Documentation Standards

- Treat `docs/` as the source of truth.
- Update docs in the same change set as behavior updates.
- Keep architectural assumptions and known risks explicit.

## 13. Implementation Standards

- Always read the `README.md` and `code-standards.md` before starting implementation.
- Identify all related code files to modify or create before starting implementation.
- Define domain entities and repository interfaces before writing application logic.
- Identify all necessary `Domain Events`, `Domain Business Errors`, and `Result<T>` types before writing handler logic.
- Use `Result<T>` for all return types in application and domain layers.
- Avoid direct database access from controllers; use repositories instead.
- For any external API integration, define a clear interface and implement it in the infrastructure layer
- For any new feature, consider the need for new domain events and how they might be consumed in the future.
- For any new feature, consider potential failure scenarios and how to represent them with `BusinessError` and `ServiceError`.
- For any new feature, consider how to write tests that cover both success and failure paths, and write those tests as part of the implementation process.
