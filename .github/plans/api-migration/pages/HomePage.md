# Migration Plan: HomePage

## File
`web/src/pages/HomePage.tsx`

## Priority
**High** — Landing page after login; primary entry point for the application.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `currentUser` | `../data/currentUser` | Hardcoded demo user object for displaying welcome message, user name, role, and personalized dashboard content |

## Proposed API Changes

### Use Existing API
`apiClient.users.getCurrentUser()` already exists and returns a `UserProfile` with name, email, roles, and permissions.

### Existing Hook/Endpoint
- `getCurrentUser()` in `web/src/api/users.ts`
- Already used by `ProfilePage.tsx`

## Implementation Checklist

- [ ] Replace `currentUser` import with `getCurrentUser()` API call or create `useCurrentUser()` hook
- [ ] Add loading state while user profile fetches
- [ ] Add error handling for auth failures (redirect to login)
- [ ] Update any references to `currentUser.clubs`, `currentUser.roles` to match API response shape
- [ ] Remove import of `currentUser` from `@data/currentUser`
- [ ] Test welcome message displays correctly with API data
- [ ] Verify role-based dashboard content works with API user profile

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `currentUser.name` | `UserProfile.displayName` | May need field name mapping |
| `currentUser.email` | `UserProfile.email` | Direct mapping |
| `currentUser.roles` | `UserProfile.roles` | Verify role format matches |
| `currentUser.clubs` | Separate API call or included in profile | May need `apiClient.clubs.getMyClubs()` |

## Dependencies

- `ProfilePage.tsx` already uses `getCurrentUser()` — same pattern applies
- `ClubsListPage.tsx` also imports `currentUser` — coordinate migration

## Notes
- The `currentUser` import is the demo/seed data user — in production this comes from authentication
- The `UserProfile` type from the API client may have different field names than the static `User` type
- Consider creating a `useCurrentUser()` hook that caches the result to avoid re-fetching on every page
- Dashboard widgets may need additional API calls for club summaries, upcoming matches, etc.
