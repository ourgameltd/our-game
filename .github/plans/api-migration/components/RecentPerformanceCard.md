# Migration Plan: RecentPerformanceCard Component

## File
`web/src/components/player/RecentPerformanceCard.tsx`

## Priority
**Medium** — Component fetches match and team data from static sources to display player performance summaries.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getMatchById` | `@data/matches` | Fetches match details (opponent, result, date) for a performance entry |
| `getTeamById` | `@data/teams` | Fetches team name for display alongside match result |

## Proposed API Changes

### Option A: Parent Passes All Data (Recommended)
The parent page (`PlayerProfilePage.tsx`) should fetch performance data from the API and pass fully resolved performance objects as props, including match details and team names. No API calls in this component.

### Option B: Component Uses API
If the component must fetch its own data:
- Use existing `apiClient.teams.getTeamOverview(teamId)` or new lightweight endpoint
- Requires new `GET /api/matches/{id}` endpoint for match details

### New API Endpoint Needed (for parent page)
```
GET /api/players/{id}/recent-performances
```
Response should include resolved match/team data:
```json
[
  {
    "matchId": "...",
    "date": "2024-01-15",
    "opponent": "Renton United",
    "result": "3-1",
    "teamName": "Blues",
    "rating": 7.5,
    "goals": 1,
    "assists": 0
  }
]
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}/recent-performances` API endpoint
- [ ] Add corresponding DTO in API client
- [ ] Create `usePlayerRecentPerformances(playerId)` hook
- [ ] Update `PlayerProfilePage.tsx` to fetch performances from API
- [ ] Update `RecentPerformanceCard.tsx` props to accept fully resolved data
- [ ] Remove `getMatchById` and `getTeamById` imports
- [ ] Handle loading/error states in parent


## Backend Implementation Standards

**NOTE**: This component does not require new API endpoints. It receives all data via props from parent pages. The parent pages are responsible for API calls following the backend standards documented in their migration plans.

If the component's parent pages require API endpoint changes, refer to those page migration plans for backend implementation requirements.

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getMatchById(matchId)` | Included in performances API response | Match details resolved server-side |
| `getTeamById(teamId)` | Included in performances API response | Team name resolved server-side |

## Dependencies

- `PlayerProfilePage.tsx` is the primary consumer — migration should be coordinated
- Match detail API endpoint needed for other pages too

## Notes
- Prefer Option A (parent passes data) to keep the component pure/reusable
- The API should resolve team/match names server-side to avoid N+1 queries in the frontend
- Current static implementation does individual lookups per performance entry — the API should return a flat list

## Database / API Considerations

**SQL Requirements** (in parent endpoint `GET /api/players/{id}/recent-performances`):
```sql
SELECT 
  m.Id as MatchId,
  m.Date,
  CASE WHEN m.HomeTeamId = pt.TeamId THEN at.Name ELSE ht.Name END as Opponent,
  pr.Rating,
  COUNT(g.Id) as Goals,
  COUNT(DISTINCT g2.AssistPlayerId) as Assists,
  t.Name as TeamName
FROM PerformanceRating pr
JOIN Match m ON pr.MatchId = m.Id
JOIN PlayerTeam pt ON pr.PlayerId = pt.PlayerId
JOIN Team t ON pt.TeamId = t.Id
JOIN Team ht ON m.HomeTeamId = ht.Id
JOIN Team at ON m.AwayTeamId = at.Id
LEFT JOIN Goal g ON g.ScorerId = pr.PlayerId AND g.MatchId = m.Id
LEFT JOIN Goal g2 ON g2.AssistPlayerId = pr.PlayerId AND g2.MatchId = m.Id
WHERE pr.PlayerId = @playerId
ORDER BY m.Date DESC
LIMIT 5
```

**Migration Check**:
- Verify `PerformanceRating` table exists with `Rating`, `PlayerId`, `MatchId`
- Verify `Goal` table has `ScorerId` and `AssistPlayerId` columns

**No client-side reference data needed** - all data resolved server-side
