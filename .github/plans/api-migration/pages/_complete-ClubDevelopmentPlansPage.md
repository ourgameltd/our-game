# Migration Plan: ClubDevelopmentPlansPage

## File
`web/src/pages/clubs/ClubDevelopmentPlansPage.tsx`

## Priority
**High** — Lists development plans at club scope.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleClubs` | `@/data/clubs` | Club details for page header |
| `samplePlayers` | `@/data/players` | Player name resolution for plan display |
| `getDevelopmentPlansByClubId` | `@/data/developmentPlans` | Fetches all development plans for the club |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/clubs/{clubId}/development-plans
```

Response: Array of development plan summaries with player names resolved (follow same pattern as report cards).

### Existing Endpoints
- `useClubById()` — already exists for club context

### New Hook Required
```typescript
useClubDevelopmentPlans(clubId: string): UseApiState<ClubDevelopmentPlanDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/clubs/{clubId}/development-plans` endpoint
- [ ] Create DTO with player names resolved
- [ ] Use existing `useClubById()` for club context
- [ ] Add to API client and create hook
- [ ] Replace all 3 data imports
- [ ] Add loading/empty/error states
- [ ] Test plan list display


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
| `getDevelopmentPlansByClubId(clubId)` | `GET /api/clubs/{clubId}/development-plans` | Plan list |
| `samplePlayers` | Resolved in API response | Player names inline |
| `sampleClubs` | `useClubById()` (exists) | Club context |

## Dependencies

- `TeamDevelopmentPlansPage.tsx` — team-scope version
- `AgeGroupDevelopmentPlansPage.tsx` — age-group-scope version
- `ClubReportCardsPage.tsx` — already migrated (pattern to follow)

## Notes
- Follow the pattern from `ClubReportCardsPage.tsx` which uses `useClubReportCards()`
- Development plans and report cards have similar structures at each scope level
- API should resolve player names server-side
