# Migration Plan: AgeGroupSettingsPage

## File
`web/src/pages/ageGroups/AgeGroupSettingsPage.tsx`

## Priority
**Medium** — Age group settings/edit form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAgeGroupById` | `@/data/ageGroups` | Fetches age group details to pre-populate settings form |
| `teamLevels` | `@/data/referenceData` | Team level dropdown options |
| `squadSizes` | `@/data/referenceData` | Squad size dropdown options |

## Proposed API Changes

### Existing Endpoints
- `useAgeGroupById()` — already exists, returns `AgeGroupDetailDto`

### New API Endpoint Required
```
PUT /api/age-groups/{id}
```

### Reference Data Note
`teamLevels`, `squadSizes` → move to shared constants.

## Implementation Checklist

- [ ] Use existing `useAgeGroupById()` hook for pre-populating form
- [ ] Create `PUT /api/age-groups/{id}` endpoint (shared with AddEditAgeGroupPage)
- [ ] Move `teamLevels`, `squadSizes` to shared constants
- [ ] Replace data imports
- [ ] Wire form submit to PUT endpoint
- [ ] Add validation and error handling
- [ ] Test settings form

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getAgeGroupById(id)` | `useAgeGroupById()` (exists) | Pre-populate form |
| `teamLevels` | Shared constants | No API call |
| `squadSizes` | Shared constants | No API call |
| Form submit | `PUT /api/age-groups/{id}` | Save changes |

## Dependencies

- `AddEditAgeGroupPage.tsx` — shares the PUT endpoint
- `AgeGroupOverviewPage.tsx` — already migrated (context)

## Notes
- Read access is already covered by existing hooks
- Only the PUT endpoint needs creation
- Reference data items are fixed option sets — stay client-side
