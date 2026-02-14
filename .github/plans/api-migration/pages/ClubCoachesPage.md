# Migration Plan: ClubCoachesPage

## File
`web/src/pages/clubs/ClubCoachesPage.tsx`

## Priority
**Low** — Partially migrated; only remaining static import is reference data.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `coachRoleDisplay` | `@/data/referenceData` | Maps coach role enum values to display labels |

## Already Using API

| Hook/Call | Usage |
|---|---|
| `apiClient.clubs.getCoaches(clubId)` | Fetches all coaches for the club |
| `apiClient.clubs.getTeams(clubId)` | Fetches all teams for filtering coaches by team |

## Proposed API Changes

### No new API endpoint needed
The page is already using API for data. Only `coachRoleDisplay` remains as a static import.

### Recommended Action
Move `coachRoleDisplay` to a shared constants module.

## Implementation Checklist

- [ ] Move `coachRoleDisplay` to shared constants
- [ ] Update import path
- [ ] Verify coach role badges display correctly
- [ ] Done — page is fully migrated after this


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
| `coachRoleDisplay` | Shared constants | No API call — UI label mapping |

## Dependencies

- Other files using `coachRoleDisplay`: `CoachCard.tsx`, `CoachDetailsHeader.tsx`, `CoachProfilePage.tsx`, `MatchReportPage.tsx`, etc.
- All should be updated together

## Notes
- This is the simplest migration — just an import path change for a UI label constant
- The page is already fully functional with API data
- This should be done as part of the batch referenceData constant migration
