# Migration Plan: TrainingSessionsListPage

## File
`web/src/pages/teams/TrainingSessionsListPage.tsx`

## Priority
**High** — Team training sessions list; key coaching view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleTrainingSessions` | `@/data/training` | All training sessions for the team |
| `sampleTeams` | `@/data/teams` | Resolves team name for page context |
| `sampleClubs` | `@/data/clubs` | Resolves club name for navigation |

## Proposed API Changes

### Existing/New API Endpoints

Training session API already exists at club level:
- `apiClient.clubs.getTrainingSessions()` — `useClubTrainingSessions()` hook exists

Need team-scoped version:
```
GET /api/teams/{teamId}/training-sessions
```

Or filter club training sessions by team ID.

### New Hook Required
```typescript
useTeamTrainingSessions(teamId: string): UseApiState<TrainingSessionSummaryDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/training-sessions` endpoint or add team filter to existing
- [ ] Reuse or extend `ClubTrainingSessionDto` for team scope
- [ ] Use existing team hooks for team/club context
- [ ] Add to API client
- [ ] Create hook
- [ ] Replace all 3 data imports
- [ ] Add loading/empty/error states
- [ ] Test session list, filtering, navigation to session detail

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `sampleTrainingSessions.filter(s => s.teamId)` | `GET /api/teams/{teamId}/training-sessions` | Team sessions |
| `sampleTeams` | Via existing team hooks | Team context |
| `sampleClubs` | Via existing club hooks | Club context |

## Dependencies

- `ClubTrainingSessionsPage.tsx` — already migrated (pattern to follow)
- `AgeGroupTrainingSessionsPage.tsx` — already migrated
- `AddEditTrainingSessionPage.tsx` — create/edit form
- `TrainingSessionsListContent.tsx` component — used for rendering

## Notes
- Training sessions at club and age group scope are already migrated — follow that pattern
- The `ClubTrainingSessionDto` may be reusable at team scope — check DTO fields
- `TrainingSessionsListContent.tsx` component still imports drill data — coordinate migration
