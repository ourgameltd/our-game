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
