# Migration Plan: MatchesListPage

## File
`web/src/pages/matches/MatchesListPage.tsx`

## Priority
**High** — Primary match listing page; key user-facing view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleMatches` | `@/data/matches` | Full array of all matches for listing/filtering |
| `sampleTeams` | `@/data/teams` | Resolve team names for match display |
| `sampleClubs` | `@/data/clubs` | Resolve club names for match context |

## Proposed API Changes

### New API Endpoints Required

1. **Match List** (scoped)
   ```
   GET /api/teams/{teamId}/matches?page=1&pageSize=20&status=all
   ```
   or at club/age-group scope:
   ```
   GET /api/clubs/{clubId}/matches  (already exists)
   ```

The existing `apiClient.clubs.getMatches()` and `useClubMatches()` hook may cover this, but a team-scoped version and a general list may also be needed.

### Response should include resolved names
```json
{
  "matches": [
    {
      "id": "...",
      "date": "2024-01-15",
      "homeTeam": "Vale FC Blues",
      "awayTeam": "Renton United",
      "score": "3-1",
      "status": "completed",
      "teamId": "...",
      "clubName": "Vale FC"
    }
  ]
}
```

## Implementation Checklist

- [ ] Determine scope: is this a global match list or filtered by context (team/club/age-group)?
- [ ] Use existing `useClubMatches()` if club-scoped, or create new endpoint for global/team-scoped
- [ ] Create `GET /api/teams/{teamId}/matches` if team-scoped list needed
- [ ] Ensure response includes resolved team/club names
- [ ] Add DTOs to API client if new
- [ ] Replace all 3 data imports with API hook(s)
- [ ] Add loading skeleton for match list
- [ ] Add filtering (upcoming, completed, all) using API query params
- [ ] Test match list display, filtering, pagination
- [ ] Test navigation to match detail/report

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `sampleMatches` | `GET /api/...matches` endpoint | Match list with filters |
| `sampleTeams` | Resolved in API response | Team names inline |
| `sampleClubs` | Resolved in API response | Club names inline |

## Dependencies

- `ClubMatchesPage.tsx` — already using `useClubMatches()` (fully migrated)
- `AgeGroupMatchesPage.tsx` — already using API (fully migrated)
- `AddEditMatchPage.tsx` — match detail/creation
- `MatchReportPage.tsx` — match detail view

## Notes
- This page might be reachable from different contexts (club, team, age group) — the scope determines which API endpoint to use
- Existing `ClubMatchDto` and `useClubMatches()` provide a pattern to follow
- Include enough data in list items to avoid detail lookups (team names, scores, status)
- Consider pagination for clubs with many matches
