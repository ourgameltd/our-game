# Migration Plan: ClubSettingsPage

## File
`web/src/pages/clubs/ClubSettingsPage.tsx`

## Priority
**Medium** — Club configuration and settings form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getClubById` | `@/data/clubs` | Fetches club details to pre-populate settings form |

## Proposed API Changes

### Existing/New API Endpoints

1. **Club Detail** (exists)
   `useClubById(clubId)` — already exists and in use on other pages

2. **Update Club**
   ```
   PUT /api/clubs/{clubId}
   ```
   Request: Updated club fields (name, colors, logo, location, ethos, etc.)

### New Addition to API Client
```typescript
apiClient.clubs.updateClub(clubId: string, data: ClubUpdateDto): Promise<ApiResponse<void>>
```

## Implementation Checklist

- [ ] Use existing `useClubById()` hook for pre-populating form
- [ ] Create `PUT /api/clubs/{clubId}` endpoint
- [ ] Create `ClubUpdateDto` request type
- [ ] Add `updateClub()` to API client
- [ ] Replace `getClubById` import with `useClubById()` hook
- [ ] Wire form submit to PUT endpoint
- [ ] Add validation and error handling
- [ ] Test form pre-population and save

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getClubById(clubId)` | `useClubById(clubId)` (exists) | Pre-populate form |
| Form submit | `PUT /api/clubs/{clubId}` | Save changes |

## Dependencies

- `ClubOverviewPage.tsx` — already migrated, uses same `useClubById()`

## Notes
- Read part is already covered by existing hooks — just need the write (PUT) endpoint
- Club settings may include: name, description, colors, logo, location, ethos, principles
- Consider which fields should be editable vs read-only
