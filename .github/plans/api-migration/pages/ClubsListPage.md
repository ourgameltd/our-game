# Migration Plan: ClubsListPage

## File
`web/src/pages/clubs/ClubsListPage.tsx`

## Priority
**High** — Primary landing page for clubs; partially migrated.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `samplePlayers` | `@data/players` | Player count or summaries for club cards |
| `currentUser` | `@data/currentUser` | Determine which clubs the user has access to |

## Already Using API

| Hook/Call | Usage |
|---|---|
| `useMyTeams()` | Fetches teams the current user has access to |
| `useMyChildren()` | Fetches child players for parent users |

## Proposed API Changes

### Replace `currentUser`
Use existing `apiClient.users.getCurrentUser()` or create `useCurrentUser()` hook.

### Replace `samplePlayers`
Player data should come from the API. If player counts per club are needed, either:
- Include in club list response
- Use existing club detail endpoints
- Create `GET /api/clubs?includePlayerCounts=true`

### New Hook Needed
```typescript
useCurrentUser(): UseApiState<UserProfile>
```

## Implementation Checklist

- [ ] Replace `currentUser` import with API call (`getCurrentUser()`)
- [ ] Determine what `samplePlayers` is used for — likely player count display
- [ ] If player counts: include in club list API response or use `apiClient.clubs.getPlayers()`
- [ ] Create `useCurrentUser()` hook if not already existing
- [ ] Remove both data imports
- [ ] Test club grid renders correctly with API data
- [ ] Verify role-based filtering (only show clubs user has access to)

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `currentUser` | `getCurrentUser()` API call | User profile with club access |
| `samplePlayers` | Included in club list or separate call | Player counts per club |

## Dependencies

- `HomePage.tsx` — also imports `currentUser`
- `DrillFormPage.tsx`, `DrillTemplateFormPage.tsx` — also import `currentUser`
- `useMyTeams()` and `useMyChildren()` hooks already handle team/child data

## Notes
- This page is **partially migrated** — already uses `useMyTeams()` and `useMyChildren()`
- The remaining migration is relatively small: just replace `currentUser` and `samplePlayers`
- `currentUser` replacement is critical — it controls what clubs the user can see
- Player data may just be used for displaying counts — verify the actual usage
