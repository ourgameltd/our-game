# Migration Plan: KitBuilder Component

## File
`web/src/components/kit/KitBuilder.tsx`

## Priority
**Low** — Component receives kit data via props; only imports reference data for kit pattern types.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `kitTypes` | `@/data/referenceData` | Array of kit pattern types (e.g., "Plain", "Stripes", "Hoops", "Quarters") with display labels |

## Proposed API Changes

### No API endpoint needed
`kitTypes` is a static list of available kit patterns used for the kit builder UI. This is client-side reference data.

### Recommended Action
Move `kitTypes` to a shared constants module.

## Implementation Checklist

- [ ] Move `kitTypes` to shared constants module
- [ ] Update import path in `KitBuilder.tsx`
- [ ] Verify kit pattern selector renders correctly with all options
- [ ] Remove from `data/referenceData.ts` once all consumers migrated


## Backend Implementation Standards

**NOTE**: This component does not require new API endpoints. It receives all data via props from parent pages. The parent pages are responsible for API calls following the backend standards documented in their migration plans.

If the component's parent pages require API endpoint changes, refer to those page migration plans for backend implementation requirements.

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `kitTypes` array | Shared constant | No API call — static pattern options |

## Dependencies

- `kitTypes` may be used by kit-related pages (`ClubKitsPage.tsx`, `TeamKitsPage.tsx`)
- Kit order data itself should come from API

## Notes
- The kit builder is a visual component — kit patterns are rendering templates, not dynamic data
- Kit orders and club kit configurations come from API (`apiClient.clubs.getKits()` already exists)
- This migration is just an import path change

## Database / API Considerations

**Reference Data Strategy**:
- `kitTypes` should remain **client-side constant** — these are UI pattern types for the builder
- Database has `KitType` enum (Home, Away, Third, Goalkeeper, Training) for kit records
- Display patterns (Plain, Stripes, Hoops, Quarters) are rendering templates, not database values

**Migration Check**:
- Verify Kit table uses `KitType` enum from OurGame.Persistence.Enums
- Verify KitItemType enum exists for component types (shirt, shorts, socks)
- Pattern/design data stored as JSON or separate columns?

**SQL Not Applicable** - Component receives data via props, no queries
