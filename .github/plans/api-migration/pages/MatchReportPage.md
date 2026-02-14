# Migration Plan: MatchReportPage

## File
`web/src/pages/matches/MatchReportPage.tsx`

## Priority
**High** — Match report detail view; key post-match review page showing goals, cards, ratings, etc.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleMatches` | `@/data/matches` | Find match by ID to display report (lineup, events, ratings) |
| `samplePlayers` | `@/data/players` | Resolve player names for goal scorers, assists, bookings, subs, ratings |
| `sampleCoaches` | `@/data/coaches` | Resolve coach names for staff on match day |
| `sampleTeams` | `@/data/teams` | Resolve team names for match header |
| `sampleClubs` | `@/data/clubs` | Resolve club details for match context |
| `coachRoleDisplay` | `@/data/referenceData` | Display labels for coach roles in match staff section |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/matches/{id}/report
```

Response: Complete match report with all names resolved:
```json
{
  "matchId": "...",
  "date": "2024-01-15",
  "homeTeam": { "id": "...", "name": "Vale FC Blues", "clubName": "Vale FC" },
  "awayTeam": { "id": "...", "name": "Renton United" },
  "score": { "home": 3, "away": 1 },
  "lineup": [
    { "playerId": "...", "playerName": "James Wilson", "position": "ST", "squadNumber": 9, "rating": 8.0 }
  ],
  "goalScorers": [
    { "playerId": "...", "playerName": "James Wilson", "minute": 23, "type": "open_play" }
  ],
  "cards": [...],
  "substitutions": [...],
  "coaches": [
    { "coachId": "...", "coachName": "Mike Smith", "role": "Head Coach" }
  ],
  "manOfMatch": { "playerId": "...", "playerName": "James Wilson" }
}
```

### Reference Data Note
`coachRoleDisplay` is a UI label mapping → move to shared constants.

### New Hook Required
```typescript
useMatchReport(matchId: string): UseApiState<MatchReportDto>
```

## Implementation Checklist

- [ ] Create `GET /api/matches/{id}/report` endpoint (or include report in match detail)
- [ ] Create `MatchReportDto` with all report sections (lineup, events, ratings, staff)
- [ ] Ensure all names are resolved server-side (players, coaches, teams)
- [ ] Move `coachRoleDisplay` to shared constants
- [ ] Add DTO to API client
- [ ] Create `useMatchReport()` hook
- [ ] Replace all 6 data imports
- [ ] Add loading state for report sections
- [ ] Handle "no report yet" state (match scheduled but not played)
- [ ] Test all report sections: lineup, goals, cards, subs, ratings, man of match


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
| `sampleMatches.find(m => m.id === matchId)` | `GET /api/matches/{id}/report` | Full report |
| `samplePlayers` for name resolution | Resolved in API response | All player names inline |
| `sampleCoaches` for name resolution | Resolved in API response | Coach names inline |
| `sampleTeams` for team names | Resolved in API response | Team context inline |
| `sampleClubs` for club context | Resolved in API response | Club names inline |
| `coachRoleDisplay` | Shared constants | UI label mapping |

## Dependencies

- `AddEditMatchPage.tsx` — shares match detail endpoint
- `MatchesListPage.tsx` — navigates here
- Player, coach, team endpoints are shared with many other pages

## Notes
- This page has 6 data imports resolving names from multiple entity types — the API MUST return denormalized data
- Server-side name resolution is critical to avoid N+1 frontend lookups
- Match report is one of the richest data views — design DTO carefully
- Consider separating the match header (date, teams, score) from the full report (events, ratings) if the report is large
- `coachRoleDisplay` can be resolved server-side or kept as client-side constant

## Database / API Considerations

**SQL Requirements for `GET /api/matches/{id}/report` (Highly Denormalized)**:
```sql
-- Match header
SELECT m.Id, m.Date, m.Location, m.Status,
       ht.Id as HomeTeamId, ht.Name as HomeTeamName,
       at.Id as AwayTeamId, at.Name as AwayTeamName,
       hc.Name as HomeClubName, ac.Name as AwayClubName,
       m.HomeScore, m.AwayScore,
       mr.Summary, mr.Conditions, mr.Attendance
FROM Match m
JOIN Team ht ON m.HomeTeamId = ht.Id
JOIN Team at ON m.AwayTeamId = at.Id
JOIN AgeGroup hag ON ht.AgeGroupId = hag.Id
JOIN AgeGroup aag ON at.AgeGroupId = aag.Id
JOIN Club hc ON hag.ClubId = hc.Id
JOIN Club ac ON aag.ClubId = ac.Id
LEFT JOIN MatchReport mr ON m.Id = mr.MatchId
WHERE m.Id = @matchId

-- Lineup with ratings (resolved names)
SELECT ml.PlayerId, 
       p.FirstName + ' ' + p.LastName as PlayerName,
       ml.PositionRole, ml.SquadNumber,
       pr.Rating, pr.ManOfMatch
FROM MatchLineup ml
JOIN Player p ON ml.PlayerId = p.Id
LEFT JOIN PerformanceRating pr ON pr.MatchId = ml.MatchId AND pr.PlayerId = ml.PlayerId
WHERE ml.MatchId = @matchId
ORDER BY ml.StartingXI DESC, ml.SquadNumber

-- Goal scorers with assists
SELECT g.Id, g.Minute, g.Type,
       ps.FirstName + ' ' + ps.LastName as ScorerName,
       pa.FirstName + ' ' + pa.LastName as AssistName
FROM Goal g
JOIN Player ps ON g.ScorerId = ps.Id
LEFT JOIN Player pa ON g.AssistPlayerId = pa.Id
WHERE g.MatchId = @matchId
ORDER BY g.Minute

-- Cards
SELECT c.CardType, c.Minute,
       p.FirstName + ' ' + p.LastName as PlayerName,
       c.Reason
FROM Card c
JOIN Player p ON c.PlayerId = p.Id
WHERE c.MatchId = @matchId
ORDER BY c.Minute

-- Substitutions
SELECT ms.Minute,
       pout.FirstName + ' ' + pout.LastName as PlayerOutName,
       pin.FirstName + ' ' + pin.LastName as PlayerInName
FROM MatchSubstitution ms
JOIN Player pout ON ms.PlayerOutId = pout.Id
JOIN Player pin ON ms.PlayerInId = pin.Id
WHERE ms.MatchId = @matchId
ORDER BY ms.Minute

-- Match staff
SELECT c.Id, c.FirstName + ' ' + c.LastName as CoachName,
       mc.Role
FROM MatchCoach mc
JOIN Coach c ON mc.CoachId = c.Id
WHERE mc.MatchId = @matchId
```

**Migration Check**:
- Verify all match event tables exist (Goal, Card, MatchSubstitution)
- Verify PerformanceRating has Rating (decimal), ManOfMatch (bit) columns
- Verify Goal has Type column (open play, penalty, free kick, header, etc.)
- Consider adding GoalType enum if not exists
- Verify Card.Reason is nullable VARCHAR

**Reference Data**:
- `coachRoleDisplay` → client-side constant mapping CoachRole enum
- CardType from enum (already in database)
- Goal types - check if enum or free text

**Navigation Store Population**:
```typescript
if (report) {
  setEntityName('match', matchId, `vs ${report.opponentName}`);
  setEntityName('team', report.teamId, report.teamName);
}
```

**Performance Optimization**:
- Consider returning all data in single response (match + events + ratings)
- OR use separate endpoints for sections: `/report/lineup`, `/report/events`, `/report/staff`
- Lineup + ratings likely most expensive query - may need indexes on PerformanceRating
