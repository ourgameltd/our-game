# Migration Plan: AddEditTrainingSessionPage

## File
`web/src/pages/teams/AddEditTrainingSessionPage.tsx`

## Priority
**High** — Complex form with 8 data imports for creating/editing training sessions.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleTrainingSessions` | `@/data/training` | Find existing session for edit mode |
| `sampleDrills` | `@/data/training` | Available drills to add to session |
| `sampleDrillTemplates` | `@/data/training` | Drill templates for quick-add |
| `sampleTeams` | `@/data/teams` | Team context |
| `sampleClubs` | `@/data/clubs` | Club context |
| `samplePlayers` | `@/data/players` | Player attendance tracking |
| `getAgeGroupById` | `@/data/ageGroups` | Age group context |
| `sampleCoaches` | `@/data/coaches` | Coach assignment for session |
| `getCoachesByTeam` | `@/data/coaches` | Filter coaches by team |
| `getCoachesByAgeGroup` | `@/data/coaches` | Filter coaches by age group |
| `coachRoleDisplay` | `@/data/referenceData` | Coach role labels |
| `sessionDurations` | `@/data/referenceData` | Duration dropdown options |
| `drillCategories` | `@/data/referenceData` | Drill category labels |
| `getDrillCategoryColors` | `@/data/referenceData` | Category color mapping |

## Proposed API Changes

### New API Endpoints Required

1. **Get Training Session for Edit**
   ```
   GET /api/training-sessions/{id}
   ```

2. **Create Training Session**
   ```
   POST /api/training-sessions
   ```

3. **Update Training Session**
   ```
   PUT /api/training-sessions/{id}
   ```

4. **Team Players** (shared)
   ```
   GET /api/teams/{teamId}/players
   ```

5. **Team Coaches** (shared)
   ```
   GET /api/teams/{teamId}/coaches
   ```

### Existing Endpoints
- `apiClient.drills.getByScope()` — available drills (exists)
- `apiClient.drillTemplates.getByScope()` — drill templates (exists)
- Club/team/age group context hooks exist

### Reference Data Note
`coachRoleDisplay`, `sessionDurations`, `drillCategories`, `getDrillCategoryColors` → move to shared constants.

## Implementation Checklist

- [ ] Create `GET /api/training-sessions/{id}` endpoint
- [ ] Create `POST /api/training-sessions` endpoint
- [ ] Create `PUT /api/training-sessions/{id}` endpoint
- [ ] Create training session DTOs (detail, create, update)
- [ ] Use existing `useDrillsByScope()` for drill selection
- [ ] Use existing `useDrillTemplatesByScope()` for template selection
- [ ] Create `useTeamPlayers()` and `useTeamCoaches()` hooks (shared)
- [ ] Move reference data items to shared constants
- [ ] Replace all data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Add validation and error handling
- [ ] Test session creation with drills, attendance, coach assignment

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `sampleTrainingSessions.find()` | `GET /api/training-sessions/{id}` | Edit mode |
| `sampleDrills` | `useDrillsByScope()` (exists) | Drill selection |
| `sampleDrillTemplates` | `useDrillTemplatesByScope()` (exists) | Template selection |
| `samplePlayers` | `GET /api/teams/{teamId}/players` | Attendance |
| `sampleCoaches`/`getCoachesByTeam` | `GET /api/teams/{teamId}/coaches` | Staff assignment |
| Reference data items | Shared constants | UI labels |
| Form submit | `POST`/`PUT /api/training-sessions` | Save session |

## Dependencies

- `TrainingSessionsListPage.tsx` — navigates here
- `ClubTrainingSessionsPage.tsx` — already migrated (pattern to follow)
- Drills and drill templates APIs already exist

## Notes
- Second most complex form after `AddEditMatchPage` (8 data file imports)
- Several needed APIs already exist (drills, drill templates, club context)
- Training session creation involves nested data (drills with order, player attendance)
- Reference data items should all become shared constants
