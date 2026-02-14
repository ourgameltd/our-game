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
