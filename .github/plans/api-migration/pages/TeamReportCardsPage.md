# Migration Plan: TeamReportCardsPage

## File
`web/src/pages/teams/TeamReportCardsPage.tsx`

## Priority
**High** — Lists report cards at team scope; key coaching review view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleClubs` | `@/data/clubs` | Resolves club name for page context |
| `sampleAgeGroups` | `@/data/ageGroups` | Resolves age group name for navigation |
| `sampleTeams` | `@/data/teams` | Resolves team name for page header |
| `samplePlayers` | `@/data/players` | Resolves player names for report card display |
| `getReportsByTeamId` | `@/data/reports` | Fetches all report cards for the team |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/teams/{teamId}/reports
```

Response: Array of report card summaries with player names resolved:
```json
[
  {
    "reportId": "...",
    "date": "2024-01-15",
    "playerName": "James Wilson",
    "playerId": "...",
    "overallGrade": "B+",
    "coachName": "Mike Smith",
    "status": "published"
  }
]
```

### Existing Endpoints for Context
- Use existing `useTeamOverview()` or team detail for team/club/age-group context

### New Hook Required
```typescript
useTeamReportCards(teamId: string): UseApiState<TeamReportCardDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/reports` endpoint
- [ ] Create `TeamReportCardDto` with player/coach names resolved
- [ ] Reuse team detail hooks for page context (team name, club, age group)
- [ ] Add DTO to API client
- [ ] Create `useTeamReportCards()` hook
- [ ] Replace all 5 data imports
- [ ] Add loading/empty/error states
- [ ] Test report card list, filtering, navigation to individual reports

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getReportsByTeamId(teamId)` | `GET /api/teams/{teamId}/reports` | Report list |
| `samplePlayers` for name resolution | Resolved in API response | Player names inline |
| `sampleTeams` | Via team detail hooks | Team context |
| `sampleAgeGroups` | Via team detail (includes age group) | Age group context |
| `sampleClubs` | Via team detail (includes club) | Club context |

## Dependencies

- `AgeGroupReportCardsPage.tsx` — already migrated (`useAgeGroupReportCards()`)
- `ClubReportCardsPage.tsx` — already migrated (`useClubReportCards()`)
- Follow the pattern from those pages

## Notes
- Five data imports resolving names from different entities — API must return denormalized data
- Both `AgeGroupReportCardsPage` and `ClubReportCardsPage` are already migrated — follow their DTOs and patterns
- `ClubReportCardDto` already exists — `TeamReportCardDto` may be the same or similar
