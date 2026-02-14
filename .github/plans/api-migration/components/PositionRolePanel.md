# Migration Plan: PositionRolePanel Component

## File
`web/src/components/tactics/PositionRolePanel.tsx`

## Priority
**Low** — Component receives data via props; only imports reference data for player direction labels.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `playerDirections` | `@/data/referenceData` | List of player movement directions (e.g., "Forward", "Back", "Left", "Right", "Hold") used when displaying position roles in tactics |

## Proposed API Changes

### No API endpoint needed
`playerDirections` is a static enum-like list of movement direction options. This is client-side reference data.

### Recommended Action
Move `playerDirections` to a shared constants module.

## Implementation Checklist

- [ ] Move `playerDirections` to shared constants module
- [ ] Update import path in `PositionRolePanel.tsx`
- [ ] Verify direction labels render correctly in tactic display
- [ ] Remove from `data/referenceData.ts` once all consumers migrated

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `playerDirections` array | Shared constant | No API call — static direction labels |

## Dependencies

- Check if `playerDirections` is used by `AddEditTacticPage.tsx` or other tactic-related files

## Notes
- Tactic position data comes via props from parent (tactic detail/edit pages)
- Direction labels are a fixed set of UI options, not dynamic data
- Simple import path change
