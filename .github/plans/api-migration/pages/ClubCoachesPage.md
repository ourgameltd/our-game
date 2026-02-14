# Migration Plan: ClubCoachesPage

## File
`web/src/pages/clubs/ClubCoachesPage.tsx`

## Priority
**Low** — Partially migrated; only remaining static import is reference data.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `coachRoleDisplay` | `@/data/referenceData` | Maps coach role enum values to display labels |

## Already Using API

| Hook/Call | Usage |
|---|---|
| `apiClient.clubs.getCoaches(clubId)` | Fetches all coaches for the club |
| `apiClient.clubs.getTeams(clubId)` | Fetches all teams for filtering coaches by team |

## Proposed API Changes

### No new API endpoint needed
The page is already using API for data. Only `coachRoleDisplay` remains as a static import.

### Recommended Action
Move `coachRoleDisplay` to a shared constants module.

## Implementation Checklist

- [ ] Move `coachRoleDisplay` to shared constants
- [ ] Update import path
- [ ] Verify coach role badges display correctly
- [ ] Done — page is fully migrated after this

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `coachRoleDisplay` | Shared constants | No API call — UI label mapping |

## Dependencies

- Other files using `coachRoleDisplay`: `CoachCard.tsx`, `CoachDetailsHeader.tsx`, `CoachProfilePage.tsx`, `MatchReportPage.tsx`, etc.
- All should be updated together

## Notes
- This is the simplest migration — just an import path change for a UI label constant
- The page is already fully functional with API data
- This should be done as part of the batch referenceData constant migration
