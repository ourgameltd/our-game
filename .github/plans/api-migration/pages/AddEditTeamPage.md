# Migration Plan: AddEditTeamPage

## File
`web/src/pages/teams/AddEditTeamPage.tsx`

## Priority
**Medium** — Form for creating/editing teams.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAgeGroupById` | `../../data/ageGroups` | Resolves age group details for the team's parent |
| `getTeamById` | `../../data/teams` | Fetches team details for edit mode |
| `sampleClubs` | `../../data/clubs` | Club context for the team |
| `teamLevels` | `@/data/referenceData` | Dropdown options for team level |
| `TeamLevel` type | `@/data/referenceData` | TypeScript type for level values |

## Proposed API Changes

### New API Endpoints Required

1. **Create Team**
   ```
   POST /api/teams
   ```

2. **Update Team**
   ```
   PUT /api/teams/{teamId}
   ```

3. **Team Detail for Edit** (may reuse existing)
   `useTeamOverview()` already exists — verify it has editable fields.

### Reference Data Note
`teamLevels` and `TeamLevel` type → move to shared constants.

## Implementation Checklist

- [ ] Ensure team detail endpoint returns editable fields
- [ ] Create `POST /api/teams` endpoint
- [ ] Create `PUT /api/teams/{teamId}` endpoint
- [ ] Create request DTOs for create/update
- [ ] Use existing `useAgeGroupById()` hook for age group context
- [ ] Use existing `useClubById()` hook for club context
- [ ] Move `teamLevels` and `TeamLevel` to shared constants
- [ ] Replace all data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Add validation error handling
- [ ] Test create and edit flows

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getTeamById(teamId)` | `useTeamOverview()` or team detail endpoint | Edit mode pre-population |
| `getAgeGroupById(ageGroupId)` | `useAgeGroupById()` (exists) | Context |
| `sampleClubs` | `useClubById()` (exists) | Club context |
| `teamLevels` | Shared constants | No API call |
| Form submit | `POST`/`PUT /api/teams` | Save team |

## Dependencies

- `TeamsListPage.tsx` — already migrated (navigates here for create/edit)
- `TeamSettingsPage.tsx` — also uses team data for editing
- Existing hooks for club and age group context are available

## Notes
- Mix of existing API hooks (club, age group) and new endpoints needed (team CRUD)
- `teamLevels` is a fixed UI option set — stays client-side
- Distinguish create mode (no teamId) from edit mode (teamId present)
