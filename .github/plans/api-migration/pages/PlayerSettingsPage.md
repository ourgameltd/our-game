# Migration Plan: PlayerSettingsPage

## File
`web/src/pages/players/PlayerSettingsPage.tsx`

## Priority
**Medium** — Player edit/settings form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@/data/players` | Fetches player details to pre-populate settings form (name, position, medical info, emergency contacts) |

## Proposed API Changes

### New API Endpoints Required

1. **Get Player for Edit**
   ```
   GET /api/players/{id}
   ```
   Returns full player detail including editable fields.

2. **Update Player**
   ```
   PUT /api/players/{id}
   ```
   Request body: Updated player fields.

### New Hook Required
```typescript
usePlayer(playerId: string): UseApiState<PlayerDetailDto>
```

## Implementation Checklist

- [ ] Ensure `GET /api/players/{id}` endpoint exists
- [ ] Create `PUT /api/players/{id}` endpoint for saving changes
- [ ] Add `updatePlayer()` to API client
- [ ] Create `usePlayer()` hook if not already created for `PlayerProfilePage`
- [ ] Replace `getPlayerById` import with API hook
- [ ] Add loading state while player data fetches
- [ ] Add save/submit handler using `PUT` endpoint
- [ ] Add success/error toasts for save operations
- [ ] Handle validation errors from API

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getPlayerById(id)` | `GET /api/players/{id}` | Pre-populates form |
| Form submit (local state) | `PUT /api/players/{id}` | Saves changes to API |

## Dependencies

- Shares `GET /api/players/{id}` with `PlayerProfilePage`, `PlayerAbilitiesPage`
- `ClubPlayerSettingsPage.tsx` has similar patterns — coordinate endpoint design

## Notes
- This page needs both read (GET) and write (PUT) operations — more complex than read-only pages
- Form pre-population requires the API response to arrive before rendering form fields
- Consider optimistic updates for a better user experience
