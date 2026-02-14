# Migration Plan: PlayerProfilePage

## File
`web/src/pages/players/PlayerProfilePage.tsx`

## Priority
**High** — Primary player detail page; key user-facing view with multiple data dependencies.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches full player profile (name, position, attributes, photo, medical info) |
| `getPlayerRecentPerformances` | `@data/matches` | Gets recent match ratings and stats for the player |
| `getUpcomingMatchesByTeamIds` | `@data/matches` | Gets upcoming scheduled matches for the player's teams |
| `getTeamById` | `@data/teams` | Resolves team name/details for display |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for breadcrumb/context |

## Proposed API Changes

### New API Endpoints Required

1. **Player Detail**
   ```
   GET /api/players/{id}
   ```
   Response: Full player profile including name, position, photo, attributes summary, team assignments, medical info.

2. **Player Recent Performances**
   ```
   GET /api/players/{id}/recent-performances
   ```
   Response: Array of recent match performances with resolved match/team names.

3. **Upcoming Matches for Player**
   ```
   GET /api/players/{id}/upcoming-matches
   ```
   or use team-based:
   ```
   GET /api/teams/{teamId}/matches?status=upcoming
   ```

### New Hooks Required
```typescript
usePlayer(playerId: string): UseApiState<PlayerDetailDto>
usePlayerRecentPerformances(playerId: string): UseApiState<PlayerPerformanceDto[]>
usePlayerUpcomingMatches(playerId: string): UseApiState<MatchSummaryDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}` endpoint in API
- [ ] Create `PlayerDetailDto` with all profile fields
- [ ] Create `GET /api/players/{id}/recent-performances` endpoint
- [ ] Create `PlayerPerformanceDto` (match date, opponent, result, rating, goals, assists)
- [ ] Create `GET /api/players/{id}/upcoming-matches` endpoint (or reuse team matches)
- [ ] Add DTOs to `web/src/api/client.ts`
- [ ] Create `usePlayer()`, `usePlayerRecentPerformances()` hooks
- [ ] Replace all 5 static data imports with API hooks
- [ ] Add loading skeleton states
- [ ] Add error handling for player not found
- [ ] Remove static data imports
- [ ] Test profile display, performance cards, upcoming matches


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
| `getPlayerById(id)` → Player object | `GET /api/players/{id}` → `PlayerDetailDto` | Map all profile fields |
| `getPlayerRecentPerformances(id)` | `GET /api/players/{id}/recent-performances` | Include resolved team/match names |
| `getUpcomingMatchesByTeamIds(teamIds)` | `GET /api/players/{id}/upcoming-matches` | Server resolves player's teams |
| `getTeamById(teamId)` | Included in player detail response | Denormalized team info |
| `getAgeGroupById(ageGroupId)` | Included in player detail response | Denormalized age group info |

## Dependencies

- `RecentPerformanceCard.tsx` component — should receive resolved data from this page
- `MobileNavigation.tsx` — needs player name for breadcrumb
- Player detail DTO should include team and age group names to avoid extra lookups

## Notes
- This is one of the most important pages in the app — high traffic
- The API should return denormalized data (team name, age group name) to minimize frontend calls
- Performance data should be pre-computed server-side, not calculated from raw match data
- Consider adding a player summary DTO for list/card views vs full detail DTO

## Database / API Considerations

**SQL Requirements for `GET /api/players/{id}`**:
```sql
SELECT p.Id, p.FirstName, p.LastName, p.DateOfBirth, p.Position, p.PhotoUrl,
       p.Height, p.Weight, p.PreferredFoot, p.MedicalNotes,
       t.Id as TeamId, t.Name as TeamName, pt.SquadNumber,
       ag.Id as AgeGroupId, ag.Name as AgeGroupName,
       c.Id as ClubId, c.Name as ClubName, c.PrimaryColor, c.SecondaryColor,
       AVG(pr.Rating) as AverageRating
FROM Player p
JOIN PlayerTeam pt ON p.Id = pt.PlayerId
JOIN Team t ON pt.TeamId = t.Id
JOIN AgeGroup ag ON t.AgeGroupId = ag.Id
JOIN Club c ON ag.ClubId = c.Id
LEFT JOIN PerformanceRating pr ON p.Id = pr.PlayerId
WHERE p.Id = @playerId
GROUP BY p.Id, t.Id, ag.Id, c.Id
```

**SQL Requirements for `GET /api/players/{id}/recent-performances`**:
- See RecentPerformanceCard.md for detailed SQL query
- Must JOIN Match, Team, Goal, PerformanceRating tables
- Resolve opponent name, team context in single query

**Migration Check**:
- Verify Player table has all profile fields (medical, contact, photo)
- Verify PlayerAttribute table for 35 EA FC attributes
- Verify PerformanceRating table exists
- Verify EmergencyContact table/relationship

**Navigation Store Population**:
```typescript
if (player) {
  setEntityName('player', playerId, `${player.firstName} ${player.lastName}`);
  setEntityName('team', player.teamId, player.teamName);
  setEntityName('ageGroup', player.ageGroupId, player.ageGroupName);
  setEntityName('club', player.clubId, player.clubName);
}
```

**No client-side reference data needed** - positions from PlayerPosition enum
