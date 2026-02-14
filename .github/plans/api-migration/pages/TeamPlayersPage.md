# Migration Plan: TeamPlayersPage

## File
`web/src/pages/teams/TeamPlayersPage.tsx`

## Priority
**High** — Team squad management page; displays players with positions and squad numbers.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getTeamById` | `@data/teams` | Fetches team details and player assignments (squad numbers) |
| `getPlayerSquadNumber` | `@data/teams` | Resolves a player's squad number within the team |
| `getPlayersByTeamId` | `@data/players` | Fetches all players assigned to the team |
| `getPlayersByAgeGroupId` | `@data/players` | Fetches all players in the age group (for potential additions) |

## Proposed API Changes

### New API Endpoints Required

1. **Team Players with Squad Numbers**
   ```
   GET /api/teams/{teamId}/players
   ```
   Response should include squad numbers:
   ```json
   [
     {
       "playerId": "...",
       "name": "James Wilson",
       "position": "ST",
       "squadNumber": 9,
       "photo": "...",
       "age": 10,
       "overallRating": 72
     }
   ]
   ```

2. **Available Players (for adding to team)**
   ```
   GET /api/age-groups/{ageGroupId}/players?excludeTeamId={teamId}
   ```
   or already exists: `apiClient.ageGroups.getPlayersByAgeGroupId()`

### New Hook Required
```typescript
useTeamPlayers(teamId: string): UseApiState<TeamPlayerDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/players` endpoint
- [ ] Include squad numbers in the response
- [ ] Create `TeamPlayerDto` with position, squad number, photo, ratings
- [ ] Reuse existing `useAgeGroupPlayers()` for available players
- [ ] Add DTOs to API client
- [ ] Create `useTeamPlayers()` hook
- [ ] Replace all data imports
- [ ] Add loading/empty states
- [ ] Test player list, squad number display, add/remove player functionality


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
| `getTeamById(teamId)` | Via team detail or team players endpoint | Team context |
| `getPlayerSquadNumber(teamId, playerId)` | Included in team players response | Squad number per player |
| `getPlayersByTeamId(teamId)` | `GET /api/teams/{teamId}/players` | Team squad |
| `getPlayersByAgeGroupId(ageGroupId)` | `useAgeGroupPlayers()` (exists) | Available players for selection |

## Dependencies

- `TeamSettingsPage.tsx` — also uses team/player data with squad numbers
- `AddEditMatchPage.tsx` — needs team players for lineup builder
- `AgeGroupPlayersPage.tsx` — already migrated (pattern to follow)

## Notes
- Squad numbers are a join property (team × player) — they come from team player assignments, not the player entity
- Consider POST/PUT/DELETE endpoints for managing team roster (add/remove players, assign squad numbers)
- The age group players endpoint for "available players" should exclude those already on the team

## Database / API Considerations

**SQL Requirements for `GET /api/teams/{teamId}/players`**:
```sql
SELECT p.Id as PlayerId,
       p.FirstName + ' ' + p.LastName as Name,
       p.Position,
       p.PhotoUrl,
       pt.SquadNumber,
       YEAR(GETDATE()) - YEAR(p.DateOfBirth) as Age,
       AVG(pa.Value) as OverallRating
FROM PlayerTeam pt
JOIN Player p ON pt.PlayerId = p.Id
LEFT JOIN PlayerAttribute pa ON p.Id = pa.PlayerId
WHERE pt.TeamId = @teamId
GROUP BY p.Id, pt.SquadNumber, p.FirstName, p.LastName, p.Position, p.PhotoUrl, p.DateOfBirth
ORDER BY pt.SquadNumber
```

**SQL for Available Players** (use existing endpoint):
```sql
SELECT p.Id, p.FirstName + ' ' + p.LastName as Name, p.Position
FROM Player p
JOIN PlayerAgeGroup pag ON p.Id = pag.PlayerId
WHERE pag.AgeGroupId = @ageGroupId
  AND p.Id NOT IN (
    SELECT PlayerId FROM PlayerTeam WHERE TeamId = @excludeTeamId
  )
```

**Additional Endpoints Needed**:
- `POST /api/teams/{teamId}/players` — Add player to team with squad number
- `DELETE /api/teams/{teamId}/players/{playerId}` — Remove player from team
- `PUT /api/teams/{teamId}/players/{playerId}/squad-number` — Update squad number

**Migration Check**:
- Verify PlayerTeam join table has SquadNumber column (INT, unique per team)
- Verify PlayerAgeGroup table for age group assignments
- Consider unique constraint on (TeamId, SquadNumber)
- Consider cascade delete rules

**Navigation Store Population**:
```typescript
setEntityName('team', teamId, teamName); // Already set by parent team page
```

**No client-side reference data needed** - positions from enum
