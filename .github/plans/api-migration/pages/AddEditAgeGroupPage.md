# Migration Plan: AddEditAgeGroupPage

## File
`web/src/pages/ageGroups/AddEditAgeGroupPage.tsx`

## Priority
**Medium** — Form for creating/editing age groups.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAgeGroupById` | `../../data/ageGroups` | Fetches age group details for edit mode |
| `sampleClubs` | `../../data/clubs` | Club context for the age group |
| `teamLevels` | `@/data/referenceData` | Team level dropdown options |
| `squadSizes` | `@/data/referenceData` | Squad size dropdown options |
| `AgeGroupLevel` type | `@/data/referenceData` | TypeScript type for level values |

## Proposed API Changes

### New API Endpoints Required

1. **Create Age Group**
   ```
   POST /api/age-groups
   ```

2. **Update Age Group**
   ```
   PUT /api/age-groups/{id}
   ```

### Existing Endpoints
- `apiClient.ageGroups.getById()` / `useAgeGroupById()` — exists for edit mode
- `useClubById()` — exists for club context

### Reference Data Note
`teamLevels`, `squadSizes`, `AgeGroupLevel` → move to shared constants.

## Implementation Checklist

- [ ] Use existing `useAgeGroupById()` hook for edit mode pre-population
- [ ] Use existing `useClubById()` for club context
- [ ] Create `POST /api/age-groups` endpoint
- [ ] Create `PUT /api/age-groups/{id}` endpoint
- [ ] Create request DTOs for create/update
- [ ] Move `teamLevels`, `squadSizes`, `AgeGroupLevel` to shared constants
- [ ] Replace all data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Test create and edit flows

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getAgeGroupById(id)` | `useAgeGroupById()` (exists) | Edit mode |
| `sampleClubs` | `useClubById()` (exists) | Club context |
| `teamLevels`, `squadSizes` | Shared constants | No API call |
| Form submit | `POST`/`PUT /api/age-groups` | Save |

## Dependencies

- `AgeGroupOverviewPage.tsx` — already migrated (pattern to follow)
- `AgeGroupSettingsPage.tsx` — similar settings form
- Existing age group hooks available

## Notes
- Most data access is already covered by existing API hooks
- Only new endpoints needed are the CRUD operations (POST/PUT)
- Reference data items are UI dropdown options — stay client-side
