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
