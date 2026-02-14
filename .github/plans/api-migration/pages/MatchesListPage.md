# Migration Plan: MatchesListPage

## File
`web/src/pages/matches/MatchesListPage.tsx`

## Priority
**High** — Primary match listing page; key user-facing view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleMatches` | `@/data/matches` | Full array of all matches for listing/filtering |
| `sampleTeams` | `@/data/teams` | Resolve team names for match display |
| `sampleClubs` | `@/data/clubs` | Resolve club names for match context |

## Proposed API Changes

### New API Endpoints Required

1. **Match List** (scoped)
   ```
   GET /api/teams/{teamId}/matches?page=1&pageSize=20&status=all
   ```
   or at club/age-group scope:
   ```
   GET /api/clubs/{clubId}/matches  (already exists)
   ```

The existing `apiClient.clubs.getMatches()` and `useClubMatches()` hook may cover this, but a team-scoped version and a general list may also be needed.

### Response should include resolved names
```json
{
  "matches": [
    {
      "id": "...",
      "date": "2024-01-15",
      "homeTeam": "Vale FC Blues",
      "awayTeam": "Renton United",
      "score": "3-1",
      "status": "completed",
      "teamId": "...",
      "clubName": "Vale FC"
    }
  ]
}
```

## Implementation Checklist

- [ ] Determine scope: is this a global match list or filtered by context (team/club/age-group)?
- [ ] Use existing `useClubMatches()` if club-scoped, or create new endpoint for global/team-scoped
- [ ] Create `GET /api/teams/{teamId}/matches` if team-scoped list needed
- [ ] Ensure response includes resolved team/club names
- [ ] Add DTOs to API client if new
- [ ] Replace all 3 data imports with API hook(s)
- [ ] Add loading skeleton for match list
- [ ] Add filtering (upcoming, completed, all) using API query params
- [ ] Test match list display, filtering, pagination
- [ ] Test navigation to match detail/report


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
| `sampleMatches` | `GET /api/...matches` endpoint | Match list with filters |
| `sampleTeams` | Resolved in API response | Team names inline |
| `sampleClubs` | Resolved in API response | Club names inline |

## Dependencies

- `ClubMatchesPage.tsx` — already using `useClubMatches()` (fully migrated)
- `AgeGroupMatchesPage.tsx` — already using API (fully migrated)
- `AddEditMatchPage.tsx` — match detail/creation
- `MatchReportPage.tsx` — match detail view

## Notes
- This page might be reachable from different contexts (club, team, age group) — the scope determines which API endpoint to use
- Existing `ClubMatchDto` and `useClubMatches()` provide a pattern to follow
- Include enough data in list items to avoid detail lookups (team names, scores, status)
- Consider pagination for clubs with many matches

## Database / API Considerations

**SQL Requirements for `GET /api/teams/{teamId}/matches`**:
```sql
SELECT m.Id, m.Date, m.Location, m.Status,
       CASE 
         WHEN m.HomeTeamId = @teamId THEN 'Home'
         ELSE 'Away'
       END as Venue,
       CASE
         WHEN m.HomeTeamId = @teamId THEN at.Name
         ELSE ht.Name
       END as Opponent,
       m.HomeScore, m.AwayScore,
       c.Name as ClubName
FROM Match m
JOIN Team ht ON m.HomeTeamId = ht.Id
JOIN Team at ON m.AwayTeamId = at.Id
JOIN AgeGroup ag ON ht.AgeGroupId = ag.Id
JOIN Club c ON ag.ClubId = c.Id
WHERE m.HomeTeamId = @teamId OR m.AwayTeamId = @teamId
ORDER BY m.Date DESC
```

**Filtering Options**:
- `?status=upcoming` — WHERE m.Status = 'Scheduled'
- `?status=completed` — WHERE m.Status = 'Completed'
- `?dateFrom=&dateTo=` — Date range filtering

**Migration Check**:
- Verify MatchStatus enum (Scheduled, InProgress, Completed, Cancelled)
- Verify indexes on Date, HomeTeamId, AwayTeamId, Status for performance

**Pagination**:
- Use OFFSET/FETCH for SQL Server pagination
- Return total count for UI pagination controls

**Navigation Store**:
- List page doesn't populate store (individual match pages do)

**No client-side reference data needed** - statuses from enum
