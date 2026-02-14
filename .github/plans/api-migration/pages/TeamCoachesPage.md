# Migration Plan: TeamCoachesPage

## File
`web/src/pages/teams/TeamCoachesPage.tsx`

## Priority
**High** — Team coaching staff page.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getTeamById` | `@data/teams` | Fetches team details for page context |
| `getCoachesByTeamId` | `@data/coaches` | Fetches coaches assigned to the team |
| `getCoachesByClubId` | `@data/coaches` | Fetches all club coaches (for "available coaches" display or comparison) |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/teams/{teamId}/coaches
```

Response:
```json
[
  {
    "coachId": "...",
    "name": "Mike Smith",
    "role": "Head Coach",
    "certifications": [...],
    "photo": "..."
  }
]
```

### Existing Endpoints
- `apiClient.clubs.getCoaches(clubId)` — already exists for club-level coaches
- `apiClient.ageGroups.getCoachesByAgeGroupId()` — already exists

### New Hook Required
```typescript
useTeamCoaches(teamId: string): UseApiState<CoachSummaryDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/coaches` endpoint
- [ ] Create `CoachSummaryDto` for list display
- [ ] Add DTO to API client
- [ ] Create `useTeamCoaches()` hook
- [ ] Replace all 3 data imports
- [ ] Add loading/empty states
- [ ] Test coach list display, role badges, certifications

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getTeamById(teamId)` | Via existing team detail hooks or include in coach response | Team context |
| `getCoachesByTeamId(teamId)` | `GET /api/teams/{teamId}/coaches` | Team coaches |
| `getCoachesByClubId(clubId)` | `apiClient.clubs.getCoaches()` (exists) | All club coaches |

## Dependencies

- `AgeGroupCoachesPage.tsx` — already migrated (pattern to follow)
- `ClubCoachesPage.tsx` — partially migrated (uses API + referenceData)
- `CoachProfilePage.tsx` — coach detail page

## Notes
- Follow the pattern established by `AgeGroupCoachesPage.tsx` which is already using `apiClient.ageGroups.getCoachesByAgeGroupId()`
- `coachRoleDisplay` may still be needed for role labels — that stays as a shared constant
