# Migration Plan: PlayerReportCardsPage

## File
`web/src/pages/players/PlayerReportCardsPage.tsx`

## Priority
**High** — Lists all report cards for a player; key coaching review view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player name and details for page header |
| `getReportsByPlayerId` | `@data/reports` | Fetches all report cards for the player |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation context |
| `getTeamById` | `@data/teams` | Resolves team name for navigation context |

## Proposed API Changes

### New API Endpoints Required

1. **Player Report Cards List**
   ```
   GET /api/players/{id}/reports
   ```
   Response: Array of report card summaries.

2. **Player Detail** (shared with other player pages)
   ```
   GET /api/players/{id}
   ```
   Should include team and age group context.

### New Hooks Required
```typescript
usePlayerReports(playerId: string): UseApiState<ReportCardSummaryDto[]>
usePlayer(playerId: string): UseApiState<PlayerDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}/reports` endpoint
- [ ] Create `ReportCardSummaryDto` (id, date, overallGrade, coachName, status)
- [ ] Reuse `GET /api/players/{id}` for player context
- [ ] Add DTOs to API client
- [ ] Create hooks
- [ ] Replace all 4 static data imports
- [ ] Add loading/empty/error states
- [ ] Test report list, filtering, navigation to report detail

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getReportsByPlayerId(id)` | `GET /api/players/{id}/reports` | Report summaries list |
| `getPlayerById(id)` | `GET /api/players/{id}` | Player header context |
| `getTeamById(teamId)` | Included in player detail | Denormalized |
| `getAgeGroupById(ageGroupId)` | Included in player detail | Denormalized |

## Dependencies

- `PlayerReportCardPage.tsx` — individual report detail
- `AddEditReportCardPage.tsx` — create/edit form
- `TeamReportCardsPage.tsx`, `AgeGroupReportCardsPage.tsx` (already migrated), `ClubReportCardsPage.tsx` (already migrated) — similar views at different scopes

## Notes
- Four data imports — API should minimize the number of calls needed
- Player detail should include team and age group names inline
- Report list should include enough info for sorting/filtering (date, grade, coach)
