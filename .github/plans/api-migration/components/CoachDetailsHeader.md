# Migration Plan: CoachDetailsHeader Component

## File
`web/src/components/coach/CoachDetailsHeader.tsx`

## Priority
**Low** — Component receives coach data via props; only imports reference data for display labels.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `coachRoleDisplay` | `@/data/referenceData` | Maps coach role enum values to human-readable display labels |

## Proposed API Changes

### No API endpoint needed
`coachRoleDisplay` is a static UI label mapping. This is client-side reference data.

### Recommended Action
Move `coachRoleDisplay` to a shared constants module and update the import path.

## Implementation Checklist

- [ ] Ensure shared constants module exists for UI label mappings
- [ ] Update import path from `@/data/referenceData` to shared constants
- [ ] Verify component header renders correctly
- [ ] Coordinate with other `coachRoleDisplay` consumers

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `coachRoleDisplay` record | Shared constant | No API call — static label map |

## Dependencies

- Same `coachRoleDisplay` used by: `CoachCard.tsx`, `CoachProfilePage.tsx`, `CoachSettingsPage.tsx`, `MatchReportPage.tsx`, `AddEditTrainingSessionPage.tsx`, `AddEditMatchPage.tsx`

## Notes
- Header component displays coach name, photo, role badge — all data arrives via props
- Only the role label formatting needs the reference data import
- Migration is a simple import path change
