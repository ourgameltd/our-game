# Migration Plan: ClubPlayerSettingsPage

## File
`web/src/pages/clubs/ClubPlayerSettingsPage.tsx`

## Priority
**Medium** — Player settings within club context.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@/data/players` | Fetches player details for settings form |
| `getTeamsByClubId` | `@/data/teams` | Fetches club teams for team assignment dropdown |
| `getClubById` | `@/data/clubs` | Club context for the page |
| `getAgeGroupById` | `@/data/ageGroups` | Age group context |

## Proposed API Changes

### New API Endpoints Required

1. **Player Detail** (shared)
   ```
   GET /api/players/{id}
   ```

2. **Update Player** (shared)
   ```
   PUT /api/players/{id}
   ```

### Existing Endpoints
- `useClubById()` — exists
- `useClubTeams()` — exists (for team dropdown)

## Implementation Checklist

- [ ] Reuse `GET /api/players/{id}` (shared with player pages)
- [ ] Reuse `PUT /api/players/{id}` for saving changes
- [ ] Use existing `useClubById()` for club context
- [ ] Use existing `useClubTeams()` for team assignment dropdown
- [ ] Use existing `useAgeGroupById()` for age group context
- [ ] Replace all 4 data imports
- [ ] Wire form submit to PUT endpoint
- [ ] Test settings form and save functionality


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
| `getPlayerById(id)` | `GET /api/players/{id}` | Player detail |
| `getTeamsByClubId(clubId)` | `useClubTeams()` (exists) | Team dropdown |
| `getClubById(clubId)` | `useClubById()` (exists) | Club context |
| `getAgeGroupById(ageGroupId)` | `useAgeGroupById()` (exists) | Age group context |

## Dependencies

- `PlayerSettingsPage.tsx` — player-context settings page
- Many existing hooks are reusable here

## Notes
- Several existing hooks already cover the needed data
- Main new requirement is the player detail and update endpoints
- This page is a club-context wrapper around player settings
