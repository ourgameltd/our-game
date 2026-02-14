# Migration Plan: PlayerAbilitiesPage

## File
`web/src/pages/players/PlayerAbilitiesPage.tsx`

## Priority
**High** — Key page for player development tracking; displays EA FC-style ability ratings.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player with full attributes (35 abilities across pace, shooting, passing, dribbling, defending, physical, mental, technical) |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/players/{id}/abilities
```

Response:
```json
{
  "playerId": "...",
  "playerName": "James Wilson",
  "overallRating": 72,
  "categories": {
    "pace": { "acceleration": 75, "sprintSpeed": 78 },
    "shooting": { "positioning": 70, "finishing": 68, "shotPower": 72, "longShots": 65, "volleys": 60, "penalties": 70 },
    "passing": { ... },
    "dribbling": { ... },
    "defending": { ... },
    "physical": { ... },
    "mental": { ... },
    "technical": { ... }
  },
  "history": [
    { "date": "2024-01-01", "overallRating": 68 },
    { "date": "2024-06-01", "overallRating": 72 }
  ]
}
```

### Or Use Player Detail
Could be part of `GET /api/players/{id}` with an `?include=abilities` query parameter.

### New Hook Required
```typescript
usePlayerAbilities(playerId: string): UseApiState<PlayerAbilitiesDto>
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}/abilities` endpoint (or include in player detail)
- [ ] Create `PlayerAbilitiesDto` with all 35 attribute categories
- [ ] Add DTO to API client
- [ ] Create `usePlayerAbilities()` hook
- [ ] Replace `getPlayerById` import with API hook
- [ ] Add loading state for ability radar charts
- [ ] Handle error state for player not found
- [ ] Test attribute display, charts, and category breakdowns
- [ ] Verify attribute labels still resolve correctly (from referenceData `playerAttributes`)

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `player.attributes.pace` | `abilities.categories.pace` | All 35 attributes |
| `player.attributes.shooting` | `abilities.categories.shooting` | Each with sub-attributes |
| Player overall rating | Computed server-side | Weighted average of all attributes |

## Dependencies

- `referenceData.ts` `playerAttributes` may still be used for label display — that's OK (see referenceData notes)
- Player detail API (`GET /api/players/{id}`) may include abilities — coordinate design

## Notes
- EA FC-style attributes are a core feature — the schema must match the 35-attribute structure
- Consider including ability history for growth tracking charts
- Attribute labels (e.g., "Sprint Speed", "Finishing") should remain in referenceData as client-side constants
- Heavy chart rendering — loading state is important
