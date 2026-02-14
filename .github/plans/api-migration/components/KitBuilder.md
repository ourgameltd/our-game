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
