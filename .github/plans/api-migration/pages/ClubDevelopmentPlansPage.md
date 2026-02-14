# Migration Plan: ClubDevelopmentPlansPage

## File
`web/src/pages/clubs/ClubDevelopmentPlansPage.tsx`

## Priority
**High** — Lists development plans at club scope.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleClubs` | `@/data/clubs` | Club details for page header |
| `samplePlayers` | `@/data/players` | Player name resolution for plan display |
| `getDevelopmentPlansByClubId` | `@/data/developmentPlans` | Fetches all development plans for the club |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/clubs/{clubId}/development-plans
```

Response: Array of development plan summaries with player names resolved (follow same pattern as report cards).

### Existing Endpoints
- `useClubById()` — already exists for club context

### New Hook Required
```typescript
useClubDevelopmentPlans(clubId: string): UseApiState<ClubDevelopmentPlanDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/clubs/{clubId}/development-plans` endpoint
- [ ] Create DTO with player names resolved
- [ ] Use existing `useClubById()` for club context
- [ ] Add to API client and create hook
- [ ] Replace all 3 data imports
- [ ] Add loading/empty/error states
- [ ] Test plan list display

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getDevelopmentPlansByClubId(clubId)` | `GET /api/clubs/{clubId}/development-plans` | Plan list |
| `samplePlayers` | Resolved in API response | Player names inline |
| `sampleClubs` | `useClubById()` (exists) | Club context |

## Dependencies

- `TeamDevelopmentPlansPage.tsx` — team-scope version
- `AgeGroupDevelopmentPlansPage.tsx` — age-group-scope version
- `ClubReportCardsPage.tsx` — already migrated (pattern to follow)

## Notes
- Follow the pattern from `ClubReportCardsPage.tsx` which uses `useClubReportCards()`
- Development plans and report cards have similar structures at each scope level
- API should resolve player names server-side
