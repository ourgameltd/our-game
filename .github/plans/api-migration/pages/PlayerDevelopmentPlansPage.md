# Migration Plan: PlayerDevelopmentPlansPage

## File
`web/src/pages/players/PlayerDevelopmentPlansPage.tsx`

## Priority
**High** — Lists all development plans for a player; key coaching management view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player name and details for page header |
| `getDevelopmentPlansByPlayerId` | `@data/developmentPlans` | Fetches all development plans for the player |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation context |
| `getTeamById` | `@data/teams` | Resolves team name for navigation context |

## Proposed API Changes

### New API Endpoints Required

1. **Player Development Plans List**
   ```
   GET /api/players/{id}/development-plans
   ```
   Response: Array of development plan summaries for the player.

2. **Player Detail** (shared with other player pages)
   ```
   GET /api/players/{id}
   ```
   Should include team and age group context.

### New Hooks Required
```typescript
usePlayerDevelopmentPlans(playerId: string): UseApiState<DevelopmentPlanSummaryDto[]>
usePlayer(playerId: string): UseApiState<PlayerDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}/development-plans` endpoint
- [ ] Create `DevelopmentPlanSummaryDto` (id, title, status, targetDate, progress %)
- [ ] Reuse `GET /api/players/{id}` for player context (name, team, age group)
- [ ] Add DTOs to API client
- [ ] Create hooks
- [ ] Replace all 4 static data imports
- [ ] Add loading/empty/error states
- [ ] Test plan list display, filtering, navigation to plan detail

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getDevelopmentPlansByPlayerId(id)` | `GET /api/players/{id}/development-plans` | Plan summaries list |
| `getPlayerById(id)` | `GET /api/players/{id}` | Player header context |
| `getTeamById(teamId)` | Included in player detail | Denormalized |
| `getAgeGroupById(ageGroupId)` | Included in player detail | Denormalized |

## Dependencies

- `PlayerDevelopmentPlanPage.tsx` — individual plan detail (shared DTO basis)
- `AddEditDevelopmentPlanPage.tsx` — create/edit form
- `TeamDevelopmentPlansPage.tsx`, `AgeGroupDevelopmentPlansPage.tsx`, `ClubDevelopmentPlansPage.tsx` — similar list views at different scopes

## Notes
- Four data imports here means four separate lookups currently — the API should minimize this
- Player detail response should include team and age group names to avoid extra calls
- Consider including development plan statistics (total plans, active, completed) in the response
