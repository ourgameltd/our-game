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


## Backend Implementation Standards

**NOTE**: This component does not require new API endpoints. It receives all data via props from parent pages. The parent pages are responsible for API calls following the backend standards documented in their migration plans.

If the component's parent pages require API endpoint changes, refer to those page migration plans for backend implementation requirements.

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

## Database / API Considerations

**Reference Data Strategy**:
- `playerDirections` — check if `Direction` enum exists in database (OurGame.Persistence.Enums)
- If Direction enum exists (Forward, Backward, etc.), API should return enum values
- Client-side constants map enum values to display labels

**Migration Check**:
- Verify `Direction` enum exists in OurGame.Persistence.Enums
- Verify `PositionOverride` table has Direction column using enum
- Verify `FormationPosition` table structure

**Parent API Response Requirements**:
- Tactic detail responses should include resolved positions with:
  - `x`, `y` coordinates (from Formation)
  - `role` (PlayerPosition enum: ST, CM, LB, etc.)
  - `direction` (Direction enum if exists)
  - `isOverridden` flag for inheritance display
