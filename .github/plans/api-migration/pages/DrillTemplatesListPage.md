# Migration Plan: DrillTemplatesListPage

## File
`web/src/pages/drills/DrillTemplatesListPage.tsx`

## Priority
**Low** — Partially migrated; only remaining static import is reference data.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAttributeLabel` | `@/data/referenceData` | Display labels for attributes linked to drill templates |
| `getAttributeCategory` | `@/data/referenceData` | Categorizes attributes for display |
| `drillCategories` | `@/data/referenceData` | Category filter options |
| `getDrillCategoryColors` | `@/data/referenceData` | Color mapping for category badges |

## Already Using API

| Hook/Call | Usage |
|---|---|
| `useDrillTemplatesByScope()` | Fetches drill templates from API |
| `useClubById()` | Club context |

## Proposed API Changes

### No new API endpoint needed
The page already uses API for drill template data. Only reference data remains.

### Recommended Action
Move all 4 reference data items to shared constants module.

## Implementation Checklist

- [ ] Move reference data items to shared constants (coordinated with DrillsListPage)
- [ ] Update import paths
- [ ] Verify template list renders correctly
- [ ] Done — page is fully migrated after this

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `getAttributeLabel` | Shared constants | UI label utility |
| `getAttributeCategory` | Shared constants | Attribute categorization |
| `drillCategories` | Shared constants | Category filter |
| `getDrillCategoryColors` | Shared constants | UI color mapping |

## Dependencies

- `DrillsListPage.tsx` — uses exact same reference data items (batch migrate together)

## Notes
- Identical migration as `DrillsListPage.tsx` — exact same 4 reference data items
- Should be done in the same PR as DrillsListPage migration
