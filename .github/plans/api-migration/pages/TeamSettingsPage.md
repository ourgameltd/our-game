# Migration Plan: TeamSettingsPage

## File
`web/src/pages/teams/TeamSettingsPage.tsx`

## Priority
**Medium** — Team settings/edit form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getTeamById` | `@/data/teams` | Fetches team details to pre-populate settings form |
| `getPlayerSquadNumber` | `@/data/teams` | Gets squad numbers for player list in settings |
| `getPlayersByTeamId` | `@/data/players` | Fetches team players for roster management within settings |
| `teamLevels` | `@/data/referenceData` | Dropdown options for team level (recreational, competitive, elite) |

## Proposed API Changes

### New API Endpoints Required

1. **Team Detail for Edit**
   ```
   GET /api/teams/{teamId}
   ```
   or reuse `useTeamOverview()` — already exists

2. **Update Team**
   ```
   PUT /api/teams/{teamId}
   ```

3. **Team Players with Squad Numbers** (shared)
   ```
   GET /api/teams/{teamId}/players
   ```

### Reference Data Note
`teamLevels` → move to shared constants.

## Implementation Checklist

- [ ] Ensure `GET /api/teams/{teamId}` or `useTeamOverview()` provides editable fields
- [ ] Create `PUT /api/teams/{teamId}` endpoint
- [ ] Reuse `GET /api/teams/{teamId}/players` (shared with TeamPlayersPage)
- [ ] Move `teamLevels` to shared constants
- [ ] Replace data imports with API hooks
- [ ] Wire form submit to PUT endpoint
- [ ] Add loading/error states
- [ ] Test settings form pre-population and save

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getTeamById(teamId)` | `useTeamOverview()` or new detail endpoint | Pre-populate form |
| `getPlayerSquadNumber(teamId, playerId)` | Included in team players response | Squad numbers |
| `getPlayersByTeamId(teamId)` | `GET /api/teams/{teamId}/players` | Player roster |
| `teamLevels` | Shared constants | No API call |
| Form submit | `PUT /api/teams/{teamId}` | Save changes |

## Dependencies

- `AddEditTeamPage.tsx` — also uses team data with referenceData
- `TeamPlayersPage.tsx` — shares team players endpoint
- `TeamOverviewPage.tsx` — already migrated, uses `useTeamOverview()`

## Notes
- `useTeamOverview()` already exists — may contain the needed fields for this form
- `teamLevels` is a fixed set of options — stays client-side
- Consider what team settings are editable (name, level, colors, etc.)
