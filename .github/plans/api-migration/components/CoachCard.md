# Migration Plan: CoachCard Component

## File
`web/src/components/coach/CoachCard.tsx`

## Priority
**Low** — Component receives coach data via props; only imports reference data for display labels.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `coachRoleDisplay` | `@/data/referenceData` | Maps coach role enum values to display labels |

## Proposed API Changes

### No API endpoint needed
`coachRoleDisplay` is a static UI label mapping (e.g., `"head_coach"` → `"Head Coach"`). This is client-side reference data that does not need an API call.

### Recommended Action
Move `coachRoleDisplay` to a shared constants/reference module (e.g., `web/src/constants/referenceData.ts` or `web/src/utils/labels.ts`) that is clearly separated from sample/mock data files. The `data/` directory should eventually only contain dev seed data or be removed entirely.

## Implementation Checklist

- [ ] Create shared constants module for UI label mappings if not already existing
- [ ] Move `coachRoleDisplay` to shared constants
- [ ] Update import path in `CoachCard.tsx`
- [ ] Verify component renders correctly with updated import
- [ ] Remove `coachRoleDisplay` from `data/referenceData.ts` once all consumers migrated

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `coachRoleDisplay` record | Shared constant | No API call — static label map |

## Dependencies

- Other files importing `coachRoleDisplay`: `CoachDetailsHeader.tsx`, `CoachProfilePage.tsx`, `CoachSettingsPage.tsx`, `MatchReportPage.tsx`, `AddEditTrainingSessionPage.tsx`, `AddEditMatchPage.tsx`
- All consumers must be updated before removing from `data/referenceData.ts`

## Notes
- This is a reusable component — coach data comes from parent via props
- No direct API integration needed in this component
- Migration is a simple import path change, no logic changes
