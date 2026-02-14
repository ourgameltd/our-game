# Migration Plan: PlayerAlbumPage

## File
`web/src/pages/players/PlayerAlbumPage.tsx`

## Priority
**Medium** — Player photo gallery; secondary feature.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player with `album` array containing photo URLs, captions, dates, tags |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/players/{id}/album
```

Response:
```json
{
  "playerId": "...",
  "playerName": "James Wilson",
  "photos": [
    {
      "id": "...",
      "url": "https://...",
      "thumbnail": "https://...",
      "caption": "Match Day vs Renton",
      "date": "2024-01-15",
      "tags": ["match"]
    }
  ]
}
```

### New Hook Required
```typescript
usePlayerAlbum(playerId: string): UseApiState<PlayerAlbumDto>
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}/album` endpoint
- [ ] Create `PlayerAlbumDto` and `PlayerPhotoDto` types
- [ ] Add DTO to API client
- [ ] Create `usePlayerAlbum()` hook
- [ ] Replace `getPlayerById` import with API hook
- [ ] Add loading skeleton for photo grid
- [ ] Handle empty album state
- [ ] Test photo display, filtering by tags, lightbox/modal view

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `player.album` array | `GET /api/players/{id}/album` | Photo array with metadata |
| `player.name` | Included in album response or separate player detail call | For page title |

## Dependencies

- `ImageAlbum.tsx` component — receives album data via props, uses `imageTags` from referenceData
- Player detail API should be designed alongside this endpoint

## Notes
- Photo storage will eventually need Azure Blob Storage integration
- Image tags (`imageTags` in referenceData) are UI filter labels — stay client-side
- Consider pagination for players with many photos
- Thumbnail support important for grid performance
