# Migration Plan: AddEditDevelopmentPlanPage

## File
`web/src/pages/players/AddEditDevelopmentPlanPage.tsx`

## Priority
**Medium** — Form page for creating/editing player development plans.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player details for form context header |
| `getDevelopmentPlansByPlayerId` | `@data/developmentPlans` | Fetches existing plans to find the one being edited |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation |
| `getTeamById` | `@data/teams` | Resolves team name for navigation |
| `developmentPlanStatuses` | `@data/referenceData` | Dropdown options for plan status (Active, Completed, Paused, etc.) |
| `DevelopmentPlanStatus` type | `@data/referenceData` | TypeScript type for status values |

## Proposed API Changes

### New API Endpoints Required

1. **Get Development Plan for Edit**
   ```
   GET /api/development-plans/{id}
   ```

2. **Create Development Plan**
   ```
   POST /api/development-plans
   ```

3. **Update Development Plan**
   ```
   PUT /api/development-plans/{id}
   ```

4. **Player Detail** (shared)
   ```
   GET /api/players/{id}
   ```

### Reference Data Note
`developmentPlanStatuses` and `DevelopmentPlanStatus` type — these are static dropdown options and should move to a shared constants module, not an API.

## Implementation Checklist

- [ ] Create `GET /api/development-plans/{id}` endpoint (if not already done for detail page)
- [ ] Create `POST /api/development-plans` endpoint
- [ ] Create `PUT /api/development-plans/{id}` endpoint
- [ ] Create request/response DTOs
- [ ] Reuse `GET /api/players/{id}` for player context
- [ ] Move `developmentPlanStatuses` to shared constants
- [ ] Create `useDevelopmentPlan()` hook for edit mode
- [ ] Replace all data imports
- [ ] Wire form submit to POST/PUT endpoints
- [ ] Add validation error handling from API
- [ ] Add save success/error feedback
- [ ] Test create and edit flows

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getDevelopmentPlansByPlayerId(id)` filter | `GET /api/development-plans/{planId}` | Direct plan fetch |
| `getPlayerById(id)` | `GET /api/players/{id}` | Player context |
| `getTeamById(teamId)` | Included in player detail | Denormalized |
| `getAgeGroupById(ageGroupId)` | Included in player detail | Denormalized |
| `developmentPlanStatuses` | Shared constants | No API call |
| Form submit | `POST` or `PUT /api/development-plans` | Save to API |

## Dependencies

- `PlayerDevelopmentPlansPage.tsx` — list page navigates here
- `PlayerDevelopmentPlanPage.tsx` — detail page may link to edit
- Player detail API needed first

## Notes
- Form needs both read (pre-populate) and write (save) operations
- Distinguish between create (no planId in URL) and edit (planId present) modes
- `developmentPlanStatuses` is a fixed set of options — stays client-side as constants
- Validation should happen both client-side and server-side
