# Migration Plan: PlayerReportCardsPage

## File
`web/src/pages/players/PlayerReportCardsPage.tsx`

## Priority
**High** — Lists all report cards for a player; key coaching review view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player name and details for page header |
| `getReportsByPlayerId` | `@data/reports` | Fetches all report cards for the player |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation context |
| `getTeamById` | `@data/teams` | Resolves team name for navigation context |

## Proposed API Changes

### New API Endpoints Required

1. **Player Report Cards List**
   ```
   GET /api/players/{id}/reports
   ```
   Response: Array of report card summaries.

2. **Player Detail** (shared with other player pages)
   ```
   GET /api/players/{id}
   ```
   Should include team and age group context.

### New Hooks Required
```typescript
usePlayerReports(playerId: string): UseApiState<ReportCardSummaryDto[]>
usePlayer(playerId: string): UseApiState<PlayerDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}/reports` endpoint
- [ ] Create `ReportCardSummaryDto` (id, date, overallGrade, coachName, status)
- [ ] Reuse `GET /api/players/{id}` for player context
- [ ] Add DTOs to API client
- [ ] Create hooks
- [ ] Replace all 4 static data imports
- [ ] Add loading/empty/error states
- [ ] Test report list, filtering, navigation to report detail


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
| `getReportsByPlayerId(id)` | `GET /api/players/{id}/reports` | Report summaries list |
| `getPlayerById(id)` | `GET /api/players/{id}` | Player header context |
| `getTeamById(teamId)` | Included in player detail | Denormalized |
| `getAgeGroupById(ageGroupId)` | Included in player detail | Denormalized |

## Dependencies

- `PlayerReportCardPage.tsx` — individual report detail
- `AddEditReportCardPage.tsx` — create/edit form
- `TeamReportCardsPage.tsx`, `AgeGroupReportCardsPage.tsx` (already migrated), `ClubReportCardsPage.tsx` (already migrated) — similar views at different scopes

## Notes
- Four data imports — API should minimize the number of calls needed
- Player detail should include team and age group names inline
- Report list should include enough info for sorting/filtering (date, grade, coach)
