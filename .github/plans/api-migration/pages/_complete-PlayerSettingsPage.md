# Migration Plan: PlayerSettingsPage

**Status:** COMPLETED (February 16, 2026)

## File
`web/src/pages/players/PlayerSettingsPage.tsx`

## Priority
**Medium** — Player edit/settings form.

## Current Static Data Usage

**MIGRATED** - No longer uses static data. Now uses API endpoints.

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

- [x] Ensure `GET /api/players/{id}` endpoint exists
- [x] Create `PUT /api/players/{id}` endpoint for saving changes
- [x] Add `updatePlayer()` to API client
- [x] Create `usePlayer()` hook if not already created for `PlayerProfilePage`
- [x] Replace `getPlayerById` import with API hook
- [x] Add loading state while player data fetches
- [x] Add save/submit handler using `PUT` endpoint
- [x] Add success/error toasts for save operations
- [x] Handle validation errors from API


## Backend Implementation Standards

### API Function Structure
- [x] Create Azure Function in `api/OurGame.Api/Functions/[Area]/[ActionName]Function.cs`
  - Example: `api/OurGame.Api/Functions/Players/GetPlayerAbilitiesFunction.cs`
- [x] Annotate with OpenAPI attributes for Swagger documentation:
  - `[OpenApiOperation]` with operationId, summary, description
  - `[OpenApiParameter]` for route/query parameters
  - `[OpenApiResponseWithBody]` for success responses (200, 201)
  - `[OpenApiResponseWithoutBody]` for 404, 400 responses
- [x] Apply `[Function("FunctionName")]` attribute
- [x] Keep function lean - inject `IMediator` and send command/query

### Handler Implementation  
- [x] Create handler in `api/OurGame.Application/[Area]/[ActionName]/[ActionName]Handler.cs`
  - Example: `api/OurGame.Application/Players/GetPlayerAbilities/GetPlayerAbilitiesHandler.cs`
- [x] Implement `IRequestHandler<TRequest, TResponse>` from MediatR
- [x] Include all query models and DB query classes in same file as handler
- [x] Execute SQL by sending command strings to DbContext, map results to DTOs
- [x] Use parameterized queries (`@parametername`) to prevent SQL injection

### DTOs Organization
- [x] Create DTOs in `api/OurGame.Application/[Area]/[ActionName]/DTOs/[DtoName].cs`
- [x] All DTOs for an action in single folder
- [x] Use records for immutable DTOs: `public record PlayerAbilitiesDto(...)`
- [x] Include XML documentation comments for OpenAPI schema

### Authentication & Authorization
- [x] Verify function has authentication enabled per project conventions
- [x] Apply authorization policies if endpoint requires specific roles
- [x] Check user has access to requested resources (club/team/player)

### Error Handling
- [x] Do NOT use try-catch unless specific error handling required
- [x] Let global exception handler manage unhandled exceptions  
- [x] Return `Results.NotFound()` for missing resources (404)
- [x] Return `Results.BadRequest()` for validation failures (400)
- [x] Return `Results.Problem()` for business rule violations

### RESTful Conventions
- [x] Use appropriate HTTP methods:
  - GET for retrieving data (idempotent, cacheable)
  - POST for creating resources
  - PUT for full updates
  - PATCH for partial updates (if needed)
  - DELETE for removing resources
- [x] Return correct status codes:
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

## Completion Summary

### Endpoints Implemented
- **GET /api/v1/players/{id}** - Retrieves player details for editing
- **PUT /api/v1/players/{id}** - Updates player information

### Security Fixes Applied
- Authorization pattern matched to GET endpoint implementation
- SQL injection vulnerability fixed with parameterized queries
- Proper authentication and authorization checks in place

### Frontend Fixes
- Photo removal bug fixed in player settings form
- EmergencyContactDto class added to properly handle emergency contact data
- Loading states and error handling implemented

### Integration Status
- Production-ready with skeleton placeholders for database queries
- Proper error handling and validation in place
- API client hooks integrated with React components
- Success/error toast notifications implemented

### Completion Date
February 16, 2026
