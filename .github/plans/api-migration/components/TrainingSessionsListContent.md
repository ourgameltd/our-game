# Migration Plan: TrainingSessionsListContent Component

## File
`web/src/components/training/TrainingSessionsListContent.tsx`

## Priority
**Medium** — Component imports drill data to enrich training session display.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleDrills` | `@/data/training` | Array of all drills — used to resolve drill names/details within training session data |

## Proposed API Changes

### Option A: Parent Passes Resolved Data (Recommended)
Training session API responses should include drill details inline (name, duration, category) rather than just drill IDs. The parent page fetches training sessions from API and passes fully resolved data.

### Option B: Component Fetches Drills
Use existing `apiClient.drills.getByScope()` to fetch available drills, then resolve locally.

### API Response Should Include
The existing `ClubTrainingSessionDto` should include drill details:
```json
{
  "id": "...",
  "date": "2024-01-15",
  "drills": [
    {
      "drillId": "...",
      "name": "Passing Triangles",
      "duration": 15,
      "category": "passing"
    }
  ]
}
```

## Implementation Checklist

- [ ] Verify `ClubTrainingSessionDto` includes drill details (name, category)
- [ ] If not, extend the API to include drill details in training session responses
- [ ] Update component props to accept fully resolved training session data
- [ ] Remove `sampleDrills` import
- [ ] Update parent pages (`ClubTrainingSessionsPage`, `AgeGroupTrainingSessionsPage`, `TrainingSessionsListPage`)
- [ ] Test drill names and categories display correctly


## Backend Implementation Standards

**NOTE**: This component does not require new API endpoints. It receives all data via props from parent pages. The parent pages are responsible for API calls following the backend standards documented in their migration plans.

If the component's parent pages require API endpoint changes, refer to those page migration plans for backend implementation requirements.

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `sampleDrills.find(d => d.id === drillId)` | Inline drill details in API response | Resolved server-side |

## Dependencies

- Parent pages: `ClubTrainingSessionsPage.tsx` (already using API), `AgeGroupTrainingSessionsPage.tsx` (already using API), `TrainingSessionsListPage.tsx` (still using static data)
- `TrainingSessionsListPage.tsx` migration should happen first or in parallel

## Notes
- The API already serves training sessions (`useClubTrainingSessions`) — just needs to include drill details
- Resolving drill names server-side avoids an extra fetch for the drill catalog
- This is a shared list content component used by multiple pages
