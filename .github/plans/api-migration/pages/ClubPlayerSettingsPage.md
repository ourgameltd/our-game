# Migration Plan: ClubPlayerSettingsPage

## File
`web/src/pages/clubs/ClubPlayerSettingsPage.tsx`

## Priority
**Medium** — Player settings within club context.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@/data/players` | Fetches player details for settings form |
| `getTeamsByClubId` | `@/data/teams` | Fetches club teams for team assignment dropdown |
| `getClubById` | `@/data/clubs` | Club context for the page |
| `getAgeGroupById` | `@/data/ageGroups` | Age group context |

## Proposed API Changes

### New API Endpoints Required

1. **Player Detail** (shared)
   ```
   GET /api/players/{id}
   ```

2. **Update Player** (shared)
   ```
   PUT /api/players/{id}
   ```

### Existing Endpoints
- `useClubById()` — exists
- `useClubTeams()` — exists (for team dropdown)

## Implementation Checklist

- [ ] Reuse `GET /api/players/{id}` (shared with player pages)
- [ ] Reuse `PUT /api/players/{id}` for saving changes
- [ ] Use existing `useClubById()` for club context
- [ ] Use existing `useClubTeams()` for team assignment dropdown
- [ ] Use existing `useAgeGroupById()` for age group context
- [ ] Replace all 4 data imports
- [ ] Wire form submit to PUT endpoint
- [ ] Test settings form and save functionality

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getPlayerById(id)` | `GET /api/players/{id}` | Player detail |
| `getTeamsByClubId(clubId)` | `useClubTeams()` (exists) | Team dropdown |
| `getClubById(clubId)` | `useClubById()` (exists) | Club context |
| `getAgeGroupById(ageGroupId)` | `useAgeGroupById()` (exists) | Age group context |

## Dependencies

- `PlayerSettingsPage.tsx` — player-context settings page
- Many existing hooks are reusable here

## Notes
- Several existing hooks already cover the needed data
- Main new requirement is the player detail and update endpoints
- This page is a club-context wrapper around player settings
