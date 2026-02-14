# Migration Plan: TeamDevelopmentPlansPage

## File
`web/src/pages/teams/TeamDevelopmentPlansPage.tsx`

## Priority
**High** — Lists development plans at team scope; key coaching management view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleClubs` | `@/data/clubs` | Resolves club name for page context |
| `sampleAgeGroups` | `@/data/ageGroups` | Resolves age group name for navigation |
| `sampleTeams` | `@/data/teams` | Resolves team name for page header |
| `samplePlayers` | `@/data/players` | Resolves player names for plan display |
| `getDevelopmentPlansByTeamId` | `@/data/developmentPlans` | Fetches all development plans for the team |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/teams/{teamId}/development-plans
```

Response: Array of development plan summaries with player names:
```json
[
  {
    "planId": "...",
    "title": "Shooting Improvement",
    "playerName": "James Wilson",
    "playerId": "...",
    "status": "active",
    "progress": 65,
    "targetDate": "2024-06-01",
    "focusAreas": ["shooting", "positioning"]
  }
]
```

### New Hook Required
```typescript
useTeamDevelopmentPlans(teamId: string): UseApiState<TeamDevelopmentPlanDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/development-plans` endpoint
- [ ] Create `TeamDevelopmentPlanDto` with player names resolved
- [ ] Reuse team detail hooks for context
- [ ] Add DTO to API client
- [ ] Create hook
- [ ] Replace all 5 data imports
- [ ] Add loading/empty/error states
- [ ] Test plan list, filtering by status, navigation to plan detail

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getDevelopmentPlansByTeamId(teamId)` | `GET /api/teams/{teamId}/development-plans` | Plan list |
| `samplePlayers` for name resolution | Resolved in API response | Player names inline |
| `sampleTeams` | Via team detail hooks | Team context |
| `sampleAgeGroups` | Via team detail | Age group context |
| `sampleClubs` | Via team detail | Club context |

## Dependencies

- `AgeGroupDevelopmentPlansPage.tsx` — similar scope, needs same migration
- `ClubDevelopmentPlansPage.tsx` — club-scope version
- `PlayerDevelopmentPlansPage.tsx` — player-scope version

## Notes
- Five data imports — same pattern as `TeamReportCardsPage.tsx`
- API should return denormalized data with all names resolved
- Consider including summary statistics (total plans, active, completed) in the response
