# Migration Plan: ImageAlbum Component

## File
`web/src/components/player/ImageAlbum.tsx`

## Priority
**Low** — Component receives album data via props; only imports reference data for tag/label display.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `imageTags` | `@/data/referenceData` | Tag categories/labels for classifying player photos in the album |

## Proposed API Changes

### No API endpoint needed
`imageTags` is a static list of tag options (e.g., "Match Day", "Training", "Team Photo") used for UI filtering/display. This should remain client-side.

### Recommended Action
Move `imageTags` to a shared constants module.

## Implementation Checklist

- [ ] Move `imageTags` to shared constants module
- [ ] Update import path in `ImageAlbum.tsx`
- [ ] Verify album tag filters render correctly
- [ ] Remove from `data/referenceData.ts` once all consumers migrated

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `imageTags` array | Shared constant | No API call — static tag options |

## Dependencies

- Check if `imageTags` is used by other files (e.g., `PlayerAlbumPage.tsx`)
- Album photo data itself comes from parent (player profile/album API)

## Notes
- Album photos should be served from player API (`GET /api/players/{id}/album`)
- But the tag labels/categories for filtering are static UI constants
- Component itself just needs an import path change
