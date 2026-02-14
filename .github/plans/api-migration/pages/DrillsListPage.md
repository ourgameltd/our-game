# Migration Plan: DrillsListPage

## File
`web/src/pages/drills/DrillsListPage.tsx`

## Priority
**Low** — Partially migrated; only remaining static import is reference data.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAttributeLabel` | `@/data/referenceData` | Display label for player attributes linked to drills |
| `getAttributeCategory` | `@/data/referenceData` | Categorizes attributes for visual grouping |
| `drillCategories` | `@/data/referenceData` | Drill category options for filtering |
| `getDrillCategoryColors` | `@/data/referenceData` | Color mapping for category badges |

## Already Using API

| Hook/Call | Usage |
|---|---|
| `useDrillsByScope()` | Fetches drills from API by scope |
| `useClubById()` | Club context |

## Proposed API Changes

### No new API endpoint needed
The page already uses API for drill data. Only reference data items remain.

### Recommended Action
Move all 4 reference data items to shared constants module.

## Implementation Checklist

- [ ] Move `getAttributeLabel`, `getAttributeCategory`, `drillCategories`, `getDrillCategoryColors` to shared constants
- [ ] Update import paths
- [ ] Verify drill list renders correctly with all category badges and attribute labels
- [ ] Done — page is fully migrated after this

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `getAttributeLabel` | Shared constants | UI label utility |
| `getAttributeCategory` | Shared constants | Attribute categorization |
| `drillCategories` | Shared constants | Category filter options |
| `getDrillCategoryColors` | Shared constants | UI color mapping |

## Dependencies

- `DrillTemplatesListPage.tsx` — uses same reference data items
- `DrillFormPage.tsx` — uses some of these items
- `AddEditTrainingSessionPage.tsx` — uses `drillCategories` and colors

## Notes
- This is a simple import path migration — no logic changes needed
- All four items are UI label/color utilities, not dynamic data
- Should be batch-migrated with other referenceData consumers
