# Migration Plan: NotificationsPage

## File
`web/src/pages/NotificationsPage.tsx`

## Priority
**Low** — Only imports reference data for notification type color mapping.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getNotificationTypeColors` | `@/data/referenceData` | Returns color classes for different notification types (info, warning, success, error) |

## Proposed API Changes

### No API endpoint needed for the color mapping
`getNotificationTypeColors` is a UI utility that maps notification type strings to Tailwind CSS color classes. This should remain client-side.

### Notification Data API (Future)
Notification content itself will need an API endpoint:
```
GET /api/notifications?page=1&pageSize=20
```

But the color mapping for types is purely a frontend concern.

### Recommended Action
Move `getNotificationTypeColors` to a shared constants/utils module.

## Implementation Checklist

- [ ] Move `getNotificationTypeColors` to shared constants or utils module
- [ ] Update import path in `NotificationsPage.tsx`
- [ ] Verify notification type badges display correct colors
- [ ] Future: Create `GET /api/notifications` endpoint for actual notification data
- [ ] Future: Create `useNotifications()` hook for fetching notification data


## Backend Implementation Standards

### API Function Structure
- [ ] Create Azure Function in `api/OurGame.Api/Functions/[Area]/[ActionName]Function.cs`
  - Example: `api/OurGame.Api/Functions/Players/GetPlayerAbilitiesFunction.cs`
- [ ] Annotate with OpenAPI attributes for Swagger documentation:
  - `[OpenApiOperation]` with operationId, summary, description
  - `[OpenApiParameter]` for route/query parameters
  - `[OpenApiResponseWithBody]` for success responses (200, 201)
  - `[OpenApiResponseWithoutBody]` for 404, 400 responses
- [ ] Apply `[Function("FunctionName")]` attribute
- [ ] Keep function lean - inject `IMediator` and send command/query

### Handler Implementation  
- [ ] Create handler in `api/OurGame.Application/[Area]/[ActionName]/[ActionName]Handler.cs`
  - Example: `api/OurGame.Application/Players/GetPlayerAbilities/GetPlayerAbilitiesHandler.cs`
- [ ] Implement `IRequestHandler<TRequest, TResponse>` from MediatR
- [ ] Include all query models and DB query classes in same file as handler
- [ ] Execute SQL by sending command strings to DbContext, map results to DTOs
- [ ] Use parameterized queries (`@parametername`) to prevent SQL injection

### DTOs Organization
- [ ] Create DTOs in `api/OurGame.Application/[Area]/[ActionName]/DTOs/[DtoName].cs`
- [ ] All DTOs for an action in single folder
- [ ] Use records for immutable DTOs: `public record PlayerAbilitiesDto(...)`
- [ ] Include XML documentation comments for OpenAPI schema

### Authentication & Authorization
- [ ] Verify function has authentication enabled per project conventions
- [ ] Apply authorization policies if endpoint requires specific roles
- [ ] Check user has access to requested resources (club/team/player)

### Error Handling
- [ ] Do NOT use try-catch unless specific error handling required
- [ ] Let global exception handler manage unhandled exceptions  
- [ ] Return `Results.NotFound()` for missing resources (404)
- [ ] Return `Results.BadRequest()` for validation failures (400)
- [ ] Return `Results.Problem()` for business rule violations

### RESTful Conventions
- [ ] Use appropriate HTTP methods:
  - GET for retrieving data (idempotent, cacheable)
  - POST for creating resources
  - PUT for full updates
  - PATCH for partial updates (if needed)
  - DELETE for removing resources
- [ ] Return correct status codes:
  - 200 OK for successful GET/PUT
  - 201 Created for successful POST (include Location header)
  - 204 No Content for successful DELETE
  - 400 Bad Request for validation errors
  - 404 Not Found for missing resources
  - 401 Unauthorized for auth failures
  - 403 Forbidden for insufficient permissions

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `getNotificationTypeColors` | Shared constant/util | No API call — UI color mapping |

## Dependencies

- No other files currently import `getNotificationTypeColors`
- Notification data is currently not served by any API endpoint

## Notes
- This page likely shows hardcoded/demo notifications — the notification content will need its own API migration
- The color mapping function is a pure UI utility and should stay client-side
- Simple import path change for the reference data
