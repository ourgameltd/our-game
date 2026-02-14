# Migration Plan: PlayerSettingsPage

## File
`web/src/pages/players/PlayerSettingsPage.tsx`

## Priority
**Medium** — Player edit/settings form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@/data/players` | Fetches player details to pre-populate settings form (name, position, medical info, emergency contacts) |

## Proposed API Changes

### New API Endpoints Required

1. **Get Player for Edit**
   ```
   GET /api/players/{id}
   ```
   Returns full player detail including editable fields.

2. **Update Player**
   ```
   PUT /api/players/{id}
   ```
   Request body: Updated player fields.

### New Hook Required
```typescript
usePlayer(playerId: string): UseApiState<PlayerDetailDto>
```

## Implementation Checklist

- [ ] Ensure `GET /api/players/{id}` endpoint exists
- [ ] Create `PUT /api/players/{id}` endpoint for saving changes
- [ ] Add `updatePlayer()` to API client
- [ ] Create `usePlayer()` hook if not already created for `PlayerProfilePage`
- [ ] Replace `getPlayerById` import with API hook
- [ ] Add loading state while player data fetches
- [ ] Add save/submit handler using `PUT` endpoint
- [ ] Add success/error toasts for save operations
- [ ] Handle validation errors from API


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

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getPlayerById(id)` | `GET /api/players/{id}` | Pre-populates form |
| Form submit (local state) | `PUT /api/players/{id}` | Saves changes to API |

## Dependencies

- Shares `GET /api/players/{id}` with `PlayerProfilePage`, `PlayerAbilitiesPage`
- `ClubPlayerSettingsPage.tsx` has similar patterns — coordinate endpoint design

## Notes
- This page needs both read (GET) and write (PUT) operations — more complex than read-only pages
- Form pre-population requires the API response to arrive before rendering form fields
- Consider optimistic updates for a better user experience
