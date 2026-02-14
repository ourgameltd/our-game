# Migration Plan: AddEditMatchPage

## File
`web/src/pages/matches/AddEditMatchPage.tsx`

## Priority
**High** — Most complex form in the application; 10 data imports across 9 data files.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleMatches` | `@/data/matches` | Find existing match for edit mode |
| `sampleTeams` | `@/data/teams` | Team selection dropdown, squad roster |
| `sampleClubs` | `@/data/clubs` | Club context for the match |
| `samplePlayers` | `@/data/players` | Player selection for lineup, scorers, cards, substitutions |
| `sampleFormations` | `@/data/formations` | Formation selection dropdown |
| `getFormationsBySquadSize` | `@/data/formations` | Filter formations by team's squad size |
| `sampleTactics` | `@/data/tactics` | Tactic selection for the match |
| `getResolvedPositions` | `@/data/tactics` | Resolve tactic positions for lineup display |
| `getAgeGroupById` | `@/data/ageGroups` | Age group context |
| `sampleAgeGroups` | `@/data/ageGroups` | Age group list |
| `sampleCoaches` | `@/data/coaches` | Coach selection for match staff |
| `getCoachesByTeam` | `@/data/coaches` | Filter coaches by team |
| `getCoachesByAgeGroup` | `@/data/coaches` | Filter coaches by age group |
| `getPlayerSquadNumber` | `@/data/teams` | Get player's squad number for lineup |
| `weatherConditions` | `@/data/referenceData` | Weather dropdown options |
| `squadSizes` | `@/data/referenceData` | Squad size reference |
| `cardTypes` | `@/data/referenceData` | Card type options (yellow, red) |
| `injurySeverities` | `@/data/referenceData` | Injury severity dropdown |
| `coachRoleDisplay` | `@/data/referenceData` | Coach role labels |

## Proposed API Changes

### New API Endpoints Required

1. **Get Match for Edit**
   ```
   GET /api/matches/{id}
   ```

2. **Create Match**
   ```
   POST /api/matches
   ```

3. **Update Match**
   ```
   PUT /api/matches/{id}
   ```

4. **Team Players with Squad Numbers**
   ```
   GET /api/teams/{teamId}/players?includeSquadNumbers=true
   ```

5. **Team Coaches**
   ```
   GET /api/teams/{teamId}/coaches
   ```

6. **Formations by Squad Size**
   ```
   GET /api/formations?squadSize=11
   ```
   or keep client-side (formation data is reference data)

7. **Tactics by Scope**
   Already exists: `apiClient.tactics.getByScope()`

### Reference Data (keep client-side)
- `weatherConditions`, `squadSizes`, `cardTypes`, `injurySeverities`, `coachRoleDisplay` → move to shared constants

### New Hooks Required
```typescript
useMatch(matchId: string): UseApiState<MatchDetailDto>
useTeamPlayers(teamId: string): UseApiState<TeamPlayerDto[]>
useTeamCoaches(teamId: string): UseApiState<CoachSummaryDto[]>
useFormations(squadSize?: number): UseApiState<FormationDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/matches/{id}` endpoint with full match detail
- [ ] Create `POST /api/matches` endpoint
- [ ] Create `PUT /api/matches/{id}` endpoint
- [ ] Create match detail/create/update DTOs
- [ ] Create `GET /api/teams/{teamId}/players` endpoint (with squad numbers)
- [ ] Create `GET /api/teams/{teamId}/coaches` endpoint
- [ ] Decide if formations stay client-side or become an API endpoint
- [ ] Use existing `useTacticsByScope()` for tactic selection
- [ ] Move reference data items to shared constants
- [ ] Create necessary hooks
- [ ] Replace all 10+ data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Handle lineup builder with API data
- [ ] Handle match event recording (goals, cards, subs) with API data
- [ ] Test create/edit flows end-to-end
- [ ] Add loading states for all dependent data dropdowns


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
| `sampleMatches.find()` | `GET /api/matches/{id}` | Match detail for edit |
| `sampleTeams` | Via club/age-group API or existing hooks | Team dropdown |
| `samplePlayers` | `GET /api/teams/{teamId}/players` | Lineup selection |
| `sampleCoaches`/`getCoachesByTeam` | `GET /api/teams/{teamId}/coaches` | Staff selection |
| `sampleFormations`/`getFormationsBySquadSize` | Client-side or `GET /api/formations` | Formation dropdown |
| `sampleTactics` | `useTacticsByScope()` | Already has API |
| `getResolvedPositions` | Server-side or keep client-side | Position resolution logic |
| `getPlayerSquadNumber` | Included in team players response | Squad numbers |
| `weatherConditions` etc. | Shared constants | Move from referenceData |
| Form submit | `POST`/`PUT /api/matches/{id}` | Save match |

## Dependencies

- `MatchReportPage.tsx` — shares match detail endpoint
- `MatchesListPage.tsx` — shares match list endpoint
- Team players and coaches endpoints used by other pages too
- Tactics API already exists

## Notes
- This is the **most complex page** in the application with the most data dependencies
- Consider a dedicated "match form data" endpoint that returns all needed dropdown data in one call
- Lineup builder needs real-time squad number resolution
- Formation/tactic resolution may stay client-side for responsiveness
- Match events (goals, cards, subs) are complex nested data — design API DTOs carefully
- This page should be one of the last to migrate due to its complexity

## Database / API Considerations

**SQL Requirements for `POST /api/matches` (Complex Transaction)**:
```sql
BEGIN TRANSACTION

-- Insert match
INSERT INTO Match (Id, Date, Location, HomeTeamId, AwayTeamId, 
                   HomeScore, AwayScore, Status, Weather, FormationId, TacticId)
VALUES (@id, @date, @location, @homeTeamId, @awayTeamId, 
        @homeScore, @awayScore, @status, @weather, @formationId, @tacticId)

-- Insert lineup players
INSERT INTO MatchLineup (MatchId, PlayerId, PositionRole, SquadNumber, StartingXI)
SELECT @matchId, PlayerId, Position, SquadNumber, IsStarting
FROM @lineupTable

-- Insert match coaches  
INSERT INTO MatchCoach (MatchId, CoachId, Role)
SELECT @matchId, CoachId, Role
FROM @coachesTable

-- Insert match report if provided
INSERT INTO MatchReport (MatchId, Summary, Conditions, Attendance)
VALUES (@matchId, @summary, @conditions, @attendance)

COMMIT TRANSACTION
```

**SQL Requirements for `PUT /api/matches/{id}` (Update with Events)**:
- Requires updating Match, MatchReport, Goals, Cards, Substitutions
- Use MERGE or DELETE+INSERT for event collections
- Complex validation (sub timing, card timing, squad number conflicts)

**SQL Requirements for `GET /api/teams/{teamId}/players?includeSquadNumbers=true`**:
```sql
SELECT p.Id, p.FirstName, p.LastName, p.Position, p.PhotoUrl,
       pt.SquadNumber,
       AVG(pa.Value) as OverallRating
FROM Player p
JOIN PlayerTeam pt ON p.Id = pt.PlayerId
LEFT JOIN PlayerAttribute pa ON p.Id = pa.PlayerId
WHERE pt.TeamId = @teamId
GROUP BY p.Id, pt.SquadNumber
ORDER BY pt.SquadNumber
```

**Migration Check**:
- Verify Match table has Weather column (add WeatherCondition enum or VARCHAR)
- Verify MatchStatus enum (Scheduled, InProgress, Completed, Cancelled)
- Verify Goal table has ScorerId, AssistPlayerId, Minute, Type columns
- Verify Card table has CardType enum (Yellow, Red), PlayerId, Minute
- Verify MatchSubstitution has PlayerOutId, PlayerInId, Minute
- Verify Injury table with Severity enum

**Reference Data Strategy**:
- `weatherConditions` → if not enum, add WeatherCondition enum to database OR keep client-side
- `cardTypes` → use CardType enum from database (already exists)
- `injurySeverities` → use Severity enum from database (already exists)
- `coachRoleDisplay` → client-side mapping for CoachRole enum
- `squadSizes` → use SquadSize enum from database (already exists)

**Navigation Store Population**:
```typescript
// After successful save
setEntityName('match', matchId, `vs ${opponentName}`)setEntityName('team', teamId, teamName);
```

**Performance Considerations**:
- Lineup builder with 11+ players - ensure squad number query is fast
- Formation/tactic data - consider caching on client
- Dropdown data (players, coaches) - may need separate "form data" endpoint
