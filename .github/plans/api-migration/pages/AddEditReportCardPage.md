# Migration Plan: AddEditReportCardPage

## File
`web/src/pages/players/AddEditReportCardPage.tsx`

## Priority
**Medium** — Form page for creating/editing player report cards.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player details for form context |
| `getReportsByPlayerId` | `@data/reports` | Fetches existing reports to find the one being edited |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation |
| `getTeamById` | `@data/teams` | Resolves team name for navigation |

## Proposed API Changes

### New API Endpoints Required

1. **Get Report Card for Edit**
   ```
   GET /api/reports/{id}
   ```

2. **Create Report Card**
   ```
   POST /api/reports
   ```

3. **Update Report Card**
   ```
   PUT /api/reports/{id}
   ```

4. **Player Detail** (shared)
   ```
   GET /api/players/{id}
   ```

## Implementation Checklist

- [ ] Create `GET /api/reports/{id}` endpoint (shared with detail page)
- [ ] Create `POST /api/reports` endpoint
- [ ] Create `PUT /api/reports/{id}` endpoint
- [ ] Create request/response DTOs for report card CRUD
- [ ] Reuse `GET /api/players/{id}` for player context
- [ ] Create hooks as needed
- [ ] Replace all 4 data imports
- [ ] Wire form submit to POST/PUT endpoints
- [ ] Add validation and error handling
- [ ] Test create and edit flows

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getReportsByPlayerId(id)` filter by report ID | `GET /api/reports/{reportId}` | Direct report fetch |
| `getPlayerById(id)` | `GET /api/players/{id}` | Player context |
| `getTeamById(teamId)` | Included in player detail | Denormalized |
| `getAgeGroupById(ageGroupId)` | Included in player detail | Denormalized |
| Form submit | `POST` or `PUT /api/reports` | Save to API |

## Dependencies

- `PlayerReportCardsPage.tsx` — list page navigates here
- `PlayerReportCardPage.tsx` — detail page may link to edit
- Report card DTOs (`ClubReportCardDto`) already exist — may need extension

## Notes
- Form has create and edit modes (determined by URL param)
- Report card assessments include multiple categories and ratings — complex form
- Assessment categories may overlap with player attributes from referenceData
- Consider including assessment template/schema in the API response for dynamic form generation
