# Migration Plan: CoachProfilePage

## File
`web/src/pages/coaches/CoachProfilePage.tsx`

## Priority
**High** — Primary coach detail page.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getCoachById` | `@data/coaches` | Fetches full coach profile (name, role, certifications, specializations, photo) |
| `getTeamsByIds` | `@data/teams` | Resolves team names for coaches' team assignments |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation |
| `getClubById` | `@data/clubs` | Resolves club name for navigation |
| `coachRoleDisplay` | `@/data/referenceData` | Display labels for coach roles |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/coaches/{id}
```

Response: Full coach profile with resolved team/club/age-group names:
```json
{
  "coachId": "...",
  "name": "Mike Smith",
  "role": "head_coach",
  "roleDisplay": "Head Coach",
  "photo": "...",
  "certifications": [...],
  "specializations": [...],
  "teams": [
    { "teamId": "...", "teamName": "Blues", "ageGroupName": "2015" }
  ],
  "clubName": "Vale FC",
  "clubId": "..."
}
```

### Reference Data Note
`coachRoleDisplay` → move to shared constants (or optionally resolve server-side).

### New Hook Required
```typescript
useCoach(coachId: string): UseApiState<CoachDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/coaches/{id}` endpoint
- [ ] Create `CoachDetailDto` with resolved names
- [ ] Add DTO to API client
- [ ] Create `useCoach()` hook
- [ ] Move `coachRoleDisplay` to shared constants
- [ ] Replace all 5 data imports
- [ ] Add loading/error states
- [ ] Test profile display, certifications, team assignments

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getCoachById(id)` | `GET /api/coaches/{id}` | Full profile |
| `getTeamsByIds(teamIds)` | Included in coach response | Team names resolved |
| `getAgeGroupById(ageGroupId)` | Included in coach response | Age group context |
| `getClubById(clubId)` | Included in coach response | Club context |
| `coachRoleDisplay` | Shared constants | UI label mapping |

## Dependencies

- `CoachSettingsPage.tsx` — shares coach detail endpoint
- `TeamCoachesPage.tsx`, `ClubCoachesPage.tsx`, `AgeGroupCoachesPage.tsx` — coach lists

## Notes
- Five data imports — API response should be comprehensive with resolved names
- Coach certifications need a clear schema in the DTO
- The `coachRoleDisplay` can be resolved server-side (`roleDisplay` field) or kept client-side
