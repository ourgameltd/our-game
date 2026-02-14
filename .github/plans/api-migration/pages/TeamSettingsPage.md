# Migration Plan: TeamSettingsPage

## File
`web/src/pages/teams/TeamSettingsPage.tsx`

## Priority
**Medium** — Team settings/edit form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getTeamById` | `@/data/teams` | Fetches team details to pre-populate settings form |
| `getPlayerSquadNumber` | `@/data/teams` | Gets squad numbers for player list in settings |
| `getPlayersByTeamId` | `@/data/players` | Fetches team players for roster management within settings |
| `teamLevels` | `@/data/referenceData` | Dropdown options for team level (recreational, competitive, elite) |

## Proposed API Changes

### New API Endpoints Required

1. **Team Detail for Edit**
   ```
   GET /api/teams/{teamId}
   ```
   or reuse `useTeamOverview()` — already exists

2. **Update Team**
   ```
   PUT /api/teams/{teamId}
   ```

3. **Team Players with Squad Numbers** (shared)
   ```
   GET /api/teams/{teamId}/players
   ```

### Reference Data Note
`teamLevels` → move to shared constants.

## Implementation Checklist

- [ ] Ensure `GET /api/teams/{teamId}` or `useTeamOverview()` provides editable fields
- [ ] Create `PUT /api/teams/{teamId}` endpoint
- [ ] Reuse `GET /api/teams/{teamId}/players` (shared with TeamPlayersPage)
- [ ] Move `teamLevels` to shared constants
- [ ] Replace data imports with API hooks
- [ ] Wire form submit to PUT endpoint
- [ ] Add loading/error states
- [ ] Test settings form pre-population and save


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

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getTeamById(teamId)` | `useTeamOverview()` or new detail endpoint | Pre-populate form |
| `getPlayerSquadNumber(teamId, playerId)` | Included in team players response | Squad numbers |
| `getPlayersByTeamId(teamId)` | `GET /api/teams/{teamId}/players` | Player roster |
| `teamLevels` | Shared constants | No API call |
| Form submit | `PUT /api/teams/{teamId}` | Save changes |

## Dependencies

- `AddEditTeamPage.tsx` — also uses team data with referenceData
- `TeamPlayersPage.tsx` — shares team players endpoint
- `TeamOverviewPage.tsx` — already migrated, uses `useTeamOverview()`

## Notes
- `useTeamOverview()` already exists — may contain the needed fields for this form
- `teamLevels` is a fixed set of options — stays client-side
- Consider what team settings are editable (name, level, colors, etc.)
