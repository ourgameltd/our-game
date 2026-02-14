# Migration Plan: AgeGroupDevelopmentPlansPage

## File
`web/src/pages/ageGroups/AgeGroupDevelopmentPlansPage.tsx`

## Priority
**High** — Lists development plans at age group scope.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleClubs` | `@/data/clubs` | Club context for page header |
| `sampleAgeGroups` | `@/data/ageGroups` | Age group details for page header |
| `samplePlayers` | `@/data/players` | Player name resolution for plan display |
| `getDevelopmentPlansByAgeGroupId` | `@/data/developmentPlans` | Fetches all development plans for the age group |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/age-groups/{ageGroupId}/development-plans
```

Response: Array of development plan summaries with player names resolved.

### Existing Endpoints
- `useAgeGroupById()` — exists for age group context
- `useClubById()` — exists for club context

### New Hook Required
```typescript
useAgeGroupDevelopmentPlans(ageGroupId: string): UseApiState<DevelopmentPlanSummaryDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/age-groups/{ageGroupId}/development-plans` endpoint
- [ ] Create DTO with player names resolved
- [ ] Use existing `useAgeGroupById()` and `useClubById()` for context
- [ ] Add to API client and create hook
- [ ] Replace all 4 data imports
- [ ] Add loading/empty/error states
- [ ] Test plan list display

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getDevelopmentPlansByAgeGroupId(ageGroupId)` | `GET /api/age-groups/{ageGroupId}/development-plans` | Plan list |
| `samplePlayers` | Resolved in API response | Player names inline |
| `sampleAgeGroups` | `useAgeGroupById()` (exists) | Context |
| `sampleClubs` | `useClubById()` (exists) | Context |

## Dependencies

- `TeamDevelopmentPlansPage.tsx` — team-scope version
- `ClubDevelopmentPlansPage.tsx` — club-scope version
- `AgeGroupReportCardsPage.tsx` — already migrated (pattern to follow)

## Notes
- Follow the pattern from `AgeGroupReportCardsPage.tsx` which uses `useAgeGroupReportCards()`
- Existing context hooks reduce the number of new endpoints needed
- API must resolve player names server-side
