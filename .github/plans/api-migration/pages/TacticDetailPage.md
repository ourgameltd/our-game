# Migration Plan: TacticDetailPage

## File
`web/src/pages/tactics/TacticDetailPage.tsx`

## Priority
**High** — Tactic detail view showing formation, positions, directions, inheritance.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getTacticById` | `@/data/tactics` | Fetches tactic by ID (name, formation reference, position overrides, inheritance) |
| `getResolvedPositions` | `@/data/tactics` | Resolves final positions by applying inheritance chain (club → team overrides) |
| `getFormationById` | `@/data/formations` | Fetches the base formation for the tactic |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/tactics/{id}
```

Response: Full tactic detail with resolved positions computed server-side:
```json
{
  "tacticId": "...",
  "name": "High Press 4-4-2",
  "scope": "club",
  "formationId": "...",
  "formationName": "4-4-2",
  "squadSize": 11,
  "resolvedPositions": [
    {
      "x": 50,
      "y": 15,
      "role": "ST",
      "direction": "forward",
      "isOverridden": false
    }
  ],
  "parentTacticId": "...",
  "overriddenFields": ["positions[0].direction", "positions[3].role"],
  "tacticStyle": "attacking"
}
```

### Position Resolution
The `getResolvedPositions()` function applies tactic inheritance (parent → child overrides). This logic should move to the API so the frontend receives pre-resolved positions.

### Formations Note
`getFormationById` fetches the base formation. If formations become an API resource, use `GET /api/formations/{id}`. Otherwise, include formation details in the tactic response.

### New Hook Required
```typescript
useTactic(tacticId: string): UseApiState<TacticDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/tactics/{id}` endpoint
- [ ] Implement position resolution logic server-side (inheritance chain)
- [ ] Include formation details in response
- [ ] Create `TacticDetailDto` with resolved positions
- [ ] Add DTO to API client
- [ ] Create `useTactic()` hook
- [ ] Replace all 3 data imports
- [ ] Add loading/error states
- [ ] Test tactic display with pitch rendering, position dots, direction arrows
- [ ] Test inheritance indicators (which fields are overridden)

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getTacticById(id)` | `GET /api/tactics/{id}` | Full tactic detail |
| `getResolvedPositions(tactic)` | `resolvedPositions` in response | Computed server-side |
| `getFormationById(formationId)` | Included in tactic response | Formation context |

## Dependencies

- `AddEditTacticPage.tsx` — shares tactic detail endpoint
- `TacticsListPage.tsx` — already migrated (uses `useTacticsByScope()`)
- `TacticDisplay.tsx` component — receives resolved positions via props
- `PrinciplePanel.tsx` component — receives resolved positions via props

## Notes
- Tactic inheritance is the most complex data logic in the static data layer
- Moving position resolution to the server simplifies the frontend significantly
- The `ResolvedPosition` type should become part of the API DTOs
- Formation data (position coordinates) may be embedded in the tactic response or kept client-side
