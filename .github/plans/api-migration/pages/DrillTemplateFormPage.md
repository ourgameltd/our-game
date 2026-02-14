# Migration Plan: DrillTemplateFormPage

## File
`web/src/pages/drills/DrillTemplateFormPage.tsx`

## Priority
**Medium** — Form for creating/editing drill templates.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleDrillTemplates` | `@/data/training` | Find existing template for edit mode |
| `sampleDrills` | `@/data/training` | Available drills to include in template |
| `sampleClubs` | `@/data/clubs` | Club context for scope selection |
| `sampleAgeGroups` | `@/data/ageGroups` | Age group options for scope |
| `sampleTeams` | `@/data/teams` | Team options for scope |
| `currentUser` | `@/data/currentUser` | Current user for author/ownership |
| `getAttributeLabel` | `@/data/referenceData` | Display labels for attributes |

## Proposed API Changes

### New API Endpoints Required

1. **Get Drill Template for Edit**
   ```
   GET /api/drill-templates/{id}
   ```

2. **Create Drill Template**
   ```
   POST /api/drill-templates
   ```

3. **Update Drill Template**
   ```
   PUT /api/drill-templates/{id}
   ```

### Existing Endpoints
- `apiClient.drillTemplates.getByScope()` — list exists
- `apiClient.drills.getByScope()` — drills for inclusion exist
- Context hooks exist (club, age groups, teams)
- `getCurrentUser()` — exists

### Reference Data Note
`getAttributeLabel` → move to shared constants.

## Implementation Checklist

- [ ] Create `GET /api/drill-templates/{id}` endpoint
- [ ] Create `POST /api/drill-templates` endpoint
- [ ] Create `PUT /api/drill-templates/{id}` endpoint
- [ ] Create template CRUD DTOs
- [ ] Use existing `useDrillsByScope()` for drill selection
- [ ] Replace `currentUser` with `getCurrentUser()` API call
- [ ] Use existing context hooks for scope selection
- [ ] Move `getAttributeLabel` to shared constants
- [ ] Replace all data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Test create and edit flows

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `sampleDrillTemplates.find()` | `GET /api/drill-templates/{id}` | Edit mode |
| `sampleDrills` | `useDrillsByScope()` (exists) | Drill selection |
| `sampleClubs` | `useClubById()` (exists) | Scope |
| `sampleAgeGroups` | `useAgeGroupsByClubId()` (exists) | Scope |
| `sampleTeams` | `useClubTeams()` (exists) | Scope |
| `currentUser` | `getCurrentUser()` (exists) | Author |
| `getAttributeLabel` | Shared constants | UI label |
| Form submit | `POST`/`PUT /api/drill-templates` | Save |

## Dependencies

- `DrillTemplatesListPage.tsx` — partially migrated (uses `useDrillTemplatesByScope()`)
- `DrillFormPage.tsx` — similar form pattern
- Drill templates may reference multiple drills — complex nested form

## Notes
- Similar structure to `DrillFormPage.tsx` — shared migration approach
- Several existing hooks reduce new API work
- `currentUser` is the last remaining user of `currentUser.ts` data (with HomePage and ClubsListPage)
