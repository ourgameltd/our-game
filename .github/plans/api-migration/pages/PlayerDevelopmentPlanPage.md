# Migration Plan: PlayerDevelopmentPlanPage

## File
`web/src/pages/players/PlayerDevelopmentPlanPage.tsx`

## Priority
**High** — Individual development plan detail view; key coaching tool.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `samplePlayers` | `@/data/players` | Used to find and display player name/details alongside development plan |
| `getDevelopmentPlansByPlayerId` | `@/data/developmentPlans` | Fetches all development plans for a player, then finds the specific one by ID |

## Proposed API Changes

### New API Endpoints Required

1. **Get Development Plan by ID**
   ```
   GET /api/development-plans/{id}
   ```
   Response: Full plan detail including player info, goals, milestones, progress, target areas.

### New Hook Required
```typescript
useDevelopmentPlan(planId: string): UseApiState<DevelopmentPlanDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/development-plans/{id}` endpoint
- [ ] Create `DevelopmentPlanDetailDto` with all plan fields
- [ ] Include player name/details in the response (denormalized)
- [ ] Add DTO to API client
- [ ] Create `useDevelopmentPlan()` hook
- [ ] Replace `samplePlayers` and `getDevelopmentPlansByPlayerId` imports
- [ ] Add loading/error states
- [ ] Test plan detail display, progress indicators, milestone tracking

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getDevelopmentPlansByPlayerId(id)` then filter | `GET /api/development-plans/{planId}` | Direct lookup by plan ID |
| `samplePlayers.find(p => ...)` | Included in plan response | Player info denormalized |

## Dependencies

- `PlayerDevelopmentPlansPage.tsx` — lists all plans for a player
- `AddEditDevelopmentPlanPage.tsx` — create/edit form
- Development plans by team/age-group/club also need endpoints

## Notes
- The current approach fetches all plans then filters — the API should return a single plan by ID directly
- Include player context (name, position, team) in the response for breadcrumb/header display
- Progress tracking and milestone completion should be updateable via API
