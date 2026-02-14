# Migration Plan: TeamDevelopmentPlansPage

## File
`web/src/pages/teams/TeamDevelopmentPlansPage.tsx`

## Priority
**High** — Lists development plans at team scope; key coaching management view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleClubs` | `@/data/clubs` | Resolves club name for page context |
| `sampleAgeGroups` | `@/data/ageGroups` | Resolves age group name for navigation |
| `sampleTeams` | `@/data/teams` | Resolves team name for page header |
| `samplePlayers` | `@/data/players` | Resolves player names for plan display |
| `getDevelopmentPlansByTeamId` | `@/data/developmentPlans` | Fetches all development plans for the team |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/teams/{teamId}/development-plans
```

Response: Array of development plan summaries with player names:
```json
[
  {
    "planId": "...",
    "title": "Shooting Improvement",
    "playerName": "James Wilson",
    "playerId": "...",
    "status": "active",
    "progress": 65,
    "targetDate": "2024-06-01",
    "focusAreas": ["shooting", "positioning"]
  }
]
```

### New Hook Required
```typescript
useTeamDevelopmentPlans(teamId: string): UseApiState<TeamDevelopmentPlanDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/development-plans` endpoint
- [ ] Create `TeamDevelopmentPlanDto` with player names resolved
- [ ] Reuse team detail hooks for context
- [ ] Add DTO to API client
- [ ] Create hook
- [ ] Replace all 5 data imports
- [ ] Add loading/empty/error states
- [ ] Test plan list, filtering by status, navigation to plan detail


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
| `getDevelopmentPlansByTeamId(teamId)` | `GET /api/teams/{teamId}/development-plans` | Plan list |
| `samplePlayers` for name resolution | Resolved in API response | Player names inline |
| `sampleTeams` | Via team detail hooks | Team context |
| `sampleAgeGroups` | Via team detail | Age group context |
| `sampleClubs` | Via team detail | Club context |

## Dependencies

- `AgeGroupDevelopmentPlansPage.tsx` — similar scope, needs same migration
- `ClubDevelopmentPlansPage.tsx` — club-scope version
- `PlayerDevelopmentPlansPage.tsx` — player-scope version

## Notes
- Five data imports — same pattern as `TeamReportCardsPage.tsx`
- API should return denormalized data with all names resolved
- Consider including summary statistics (total plans, active, completed) in the response
