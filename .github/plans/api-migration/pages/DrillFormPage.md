# Migration Plan: DrillFormPage

## File
`web/src/pages/drills/DrillFormPage.tsx`

## Priority
**Medium** — Form for creating/editing drills.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleDrills` | `@/data/training` | Find existing drill for edit mode |
| `sampleClubs` | `@/data/clubs` | Club context for scope selection |
| `sampleAgeGroups` | `@/data/ageGroups` | Age group options for scope selection |
| `sampleTeams` | `@/data/teams` | Team options for scope selection |
| `currentUser` | `@/data/currentUser` | Current user for author/ownership |
| `getAttributeCategory` | `@/data/referenceData` | Categorizes player attributes for drill focus areas |
| `playerAttributes` | `@/data/referenceData` | Full list of player attributes for focus area selection |
| `linkTypes` | `@/data/referenceData` | External link type options (video, article, etc.) |

## Proposed API Changes

### New API Endpoints Required

1. **Get Drill for Edit**
   ```
   GET /api/drills/{id}
   ```

2. **Create Drill**
   ```
   POST /api/drills
   ```

3. **Update Drill**
   ```
   PUT /api/drills/{id}
   ```

### Existing Endpoints
- `apiClient.drills.getByScope()` — drill list exists
- `useClubById()`, `useAgeGroupsByClubId()`, `useClubTeams()` — context hooks exist
- `getCurrentUser()` — exists in API

### Reference Data Note
`getAttributeCategory`, `playerAttributes`, `linkTypes` → move to shared constants.

## Implementation Checklist

- [ ] Create `GET /api/drills/{id}` endpoint for edit mode
- [ ] Create `POST /api/drills` endpoint
- [ ] Create `PUT /api/drills/{id}` endpoint
- [ ] Create drill CRUD DTOs
- [ ] Replace `currentUser` with `getCurrentUser()` API call
- [ ] Use existing hooks for club/team/age-group scope selection
- [ ] Move reference data items to shared constants
- [ ] Replace all data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Add validation and error handling
- [ ] Test create and edit flows with scope selection

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `sampleDrills.find()` | `GET /api/drills/{id}` | Edit mode |
| `sampleClubs` | `useClubById()` (exists) | Scope selection |
| `sampleAgeGroups` | `useAgeGroupsByClubId()` (exists) | Scope selection |
| `sampleTeams` | `useClubTeams()` (exists) | Scope selection |
| `currentUser` | `getCurrentUser()` (exists) | Author |
| `playerAttributes`, `getAttributeCategory`, `linkTypes` | Shared constants | UI reference |
| Form submit | `POST`/`PUT /api/drills` | Save drill |

## Dependencies

- `DrillsListPage.tsx` — partially migrated (uses `useDrillsByScope()`)
- `DrillTemplateFormPage.tsx` — similar form pattern
- `AddEditTrainingSessionPage.tsx` — uses drills for session building

## Notes
- Six data file imports but several are covered by existing API hooks
- `playerAttributes` is a large reference data set (35 attributes) — should remain client-side
- Scope selection (club/age-group/team) determines where the drill is available
- Drills API already exists for listing — CRUD endpoints are the new addition
