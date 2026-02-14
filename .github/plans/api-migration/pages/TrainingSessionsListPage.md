# Migration Plan: TrainingSessionsListPage

## File
`web/src/pages/teams/TrainingSessionsListPage.tsx`

## Priority
**High** — Team training sessions list; key coaching view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleTrainingSessions` | `@/data/training` | All training sessions for the team |
| `sampleTeams` | `@/data/teams` | Resolves team name for page context |
| `sampleClubs` | `@/data/clubs` | Resolves club name for navigation |

## Proposed API Changes

### Existing/New API Endpoints

Training session API already exists at club level:
- `apiClient.clubs.getTrainingSessions()` — `useClubTrainingSessions()` hook exists

Need team-scoped version:
```
GET /api/teams/{teamId}/training-sessions
```

Or filter club training sessions by team ID.

### New Hook Required
```typescript
useTeamTrainingSessions(teamId: string): UseApiState<TrainingSessionSummaryDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/training-sessions` endpoint or add team filter to existing
- [ ] Reuse or extend `ClubTrainingSessionDto` for team scope
- [ ] Use existing team hooks for team/club context
- [ ] Add to API client
- [ ] Create hook
- [ ] Replace all 3 data imports
- [ ] Add loading/empty/error states
- [ ] Test session list, filtering, navigation to session detail


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
| `sampleTrainingSessions.filter(s => s.teamId)` | `GET /api/teams/{teamId}/training-sessions` | Team sessions |
| `sampleTeams` | Via existing team hooks | Team context |
| `sampleClubs` | Via existing club hooks | Club context |

## Dependencies

- `ClubTrainingSessionsPage.tsx` — already migrated (pattern to follow)
- `AgeGroupTrainingSessionsPage.tsx` — already migrated
- `AddEditTrainingSessionPage.tsx` — create/edit form
- `TrainingSessionsListContent.tsx` component — used for rendering

## Notes
- Training sessions at club and age group scope are already migrated — follow that pattern
- The `ClubTrainingSessionDto` may be reusable at team scope — check DTO fields
- `TrainingSessionsListContent.tsx` component still imports drill data — coordinate migration

## Database / API Considerations

**SQL Requirements for `GET /api/teams/{teamId}/training-sessions`**:
```sql
SELECT ts.Id, ts.Date, ts.Location, ts.Duration, ts.Focus, ts.Status,
       t.Name as TeamName,
       ag.Name as AgeGroupName,
       c.Name as ClubName,
       COUNT(DISTINCT sd.DrillId) as DrillCount,
       COUNT(DISTINCT sa.PlayerId) as AttendanceCount
FROM TrainingSession ts
JOIN Team t ON ts.TeamId = t.Id
JOIN AgeGroup ag ON t.AgeGroupId = ag.Id
JOIN Club c ON ag.ClubId = c.Id
LEFT JOIN SessionDrill sd ON ts.Id = sd.SessionId
LEFT JOIN SessionAttendance sa ON ts.Id = sa.SessionId AND sa.Status = 'Present'
WHERE ts.TeamId = @teamId
GROUP BY ts.Id, ts.Date, ts.Location, ts.Duration, ts.Focus, ts.Status, t.Name, ag.Name, c.Name
ORDER BY ts.Date DESC
```

**Filtering Options**:
- `?status=upcoming` — future sessions
- `?status=completed` — past sessions
- `?dateFrom=&dateTo=` — date range

**Migration Check**:
- Verify SessionStatus enum (Scheduled, Completed, Cancelled)
- Verify SessionDrill and SessionAttendance tables for counts
- Verify indexes on TeamId, Date, Status

**Navigation Store**:
- List page doesn't populate store

**Reference Data**:
- Session durations — client-side helper constants
- DrillCategory colors — client-side for UI
