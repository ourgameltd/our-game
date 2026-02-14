# Migration Plan: CoachSettingsPage

## File
`web/src/pages/coaches/CoachSettingsPage.tsx`

## Priority
**Medium** — Coach profile settings/edit form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getCoachById` | `@data/coaches` | Fetches coach details to pre-populate form |
| `getClubById` | `@data/clubs` | Club context for role/team assignment options |
| `getTeamsByClubId` | `@data/teams` | Available teams for coach team assignment dropdown |
| `getAgeGroupById` | `@data/ageGroups` | Age group context |
| `coachRoles` | `@data/referenceData` | Coach role dropdown options |

## Proposed API Changes

### New API Endpoints Required

1. **Coach Detail** (shared with CoachProfilePage)
   ```
   GET /api/coaches/{id}
   ```

2. **Update Coach**
   ```
   PUT /api/coaches/{id}
   ```

### Existing Endpoints
- `useClubById()` — exists
- `useClubTeams()` — exists (for team assignment dropdown)
- `useAgeGroupById()` — exists

### Reference Data Note
`coachRoles` → move to shared constants.

## Implementation Checklist

- [ ] Reuse `GET /api/coaches/{id}` (shared with CoachProfilePage)
- [ ] Create `PUT /api/coaches/{id}` endpoint
- [ ] Create `CoachUpdateDto` request type
- [ ] Add to API client
- [ ] Use existing hooks for club, teams, age group context
- [ ] Move `coachRoles` to shared constants
- [ ] Replace all 5 data imports
- [ ] Wire form submit to PUT endpoint
- [ ] Add validation and error handling
- [ ] Test settings form pre-population and save

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getCoachById(id)` | `GET /api/coaches/{id}` | Pre-populate form |
| `getClubById(clubId)` | `useClubById()` (exists) | Club context |
| `getTeamsByClubId(clubId)` | `useClubTeams()` (exists) | Team dropdown |
| `getAgeGroupById(ageGroupId)` | `useAgeGroupById()` (exists) | Age group context |
| `coachRoles` | Shared constants | No API call |
| Form submit | `PUT /api/coaches/{id}` | Save changes |

## Dependencies

- `CoachProfilePage.tsx` — shares coach detail endpoint
- Several existing hooks reusable here

## Notes
- Mix of new (coach CRUD) and existing (club/team/age-group) API integrations
- `coachRoles` is a fixed set of role options — stays client-side
- Settings may include: name, role, certifications, team assignments, specializations
