# Migration Plan: AddEditTacticPage

## File
`web/src/pages/tactics/AddEditTacticPage.tsx`

## Priority
**Medium** — Form for creating/editing tactics with formation selection.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getTacticById` | `@/data/tactics` | Fetches existing tactic for edit mode |
| `getResolvedPositions` | `@/data/tactics` | Resolves positions for preview display |
| `getFormationById` | `@/data/formations` | Fetches base formation for selected formation |
| `sampleFormations` | `@/data/formations` | All formations for formation selection dropdown |

## Proposed API Changes

### New API Endpoints Required

1. **Get Tactic for Edit** (shared with TacticDetailPage)
   ```
   GET /api/tactics/{id}
   ```

2. **Create Tactic**
   ```
   POST /api/tactics
   ```

3. **Update Tactic**
   ```
   PUT /api/tactics/{id}
   ```

4. **Formations List (optional)**
   ```
   GET /api/formations?squadSize=11
   ```
   Or keep formations client-side as they're reference data (30+ standard formations).

### Position Resolution
`getResolvedPositions` may need to stay client-side for real-time preview during editing, or use a preview API endpoint.

## Implementation Checklist

- [ ] Reuse `GET /api/tactics/{id}` for edit mode (shared with TacticDetailPage)
- [ ] Create `POST /api/tactics` endpoint
- [ ] Create `PUT /api/tactics/{id}` endpoint
- [ ] Create tactic create/update DTOs
- [ ] Decide if formations stay client-side or become API — recommend client-side for editing responsiveness
- [ ] Keep `getResolvedPositions` client-side for real-time preview, or create lightweight preview endpoint
- [ ] Replace data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Add validation error handling
- [ ] Test tactic creation with formation selection, position editing, scope assignment

## Data Mapping

| Current (Static) | Target (API/Client) | Notes |
|---|---|---|
| `getTacticById(id)` | `GET /api/tactics/{id}` | Edit mode |
| `getResolvedPositions(tactic)` | Client-side or API preview | Real-time editing preview |
| `getFormationById(id)` | Client-side formations data | Responsive editing |
| `sampleFormations` | Client-side formations data or `GET /api/formations` | Formation dropdown |
| Form submit | `POST`/`PUT /api/tactics` | Save tactic |

## Dependencies

- `TacticDetailPage.tsx` — shares tactic detail endpoint
- `TacticsListPage.tsx` — already migrated (navigates here)
- `TacticDisplay.tsx` component — used for pitch preview

## Notes
- Formations are system reference data (4v4, 5v5, 7v7, 9v9, 11v11) — keeping them client-side is acceptable
- Position resolution during editing should be immediate — client-side logic preferred for UX
- The saved tactic only stores overrides/deltas — the API reconstructs full positions on read
- Consider validating tactic structure server-side (positions within bounds, valid formation reference)
