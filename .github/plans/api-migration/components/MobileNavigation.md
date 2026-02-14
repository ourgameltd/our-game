# Migration Plan: MobileNavigation Component

## File
`web/src/components/navigation/MobileNavigation.tsx`

## Priority
**High** — Core navigation component used on every page; currently fetches entity names from static data for breadcrumb/navigation display.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getClubById` | `@data/clubs` | Resolve club name from route param for breadcrumb display |
| `getTeamById` | `@data/teams` | Resolve team name from route param for breadcrumb display |
| `getAgeGroupById` | `@data/ageGroups` | Resolve age group name from route param for breadcrumb display |
| `getPlayerById` | `@data/players` | Resolve player name from route param for breadcrumb display |
| `getCoachById` | `@data/coaches` | Resolve coach name from route param for breadcrumb display |

## Proposed API Changes

### Option A: Dedicated Breadcrumb/Navigation API (Recommended)
New endpoint that accepts entity IDs and returns display names in a single call:

```
GET /api/navigation/resolve?clubId={id}&teamId={id}&ageGroupId={id}&playerId={id}&coachId={id}
```

Response:
```json
{
  "clubName": "Vale FC",
  "teamName": "Blues",
  "ageGroupName": "2015",
  "playerName": "James Wilson",
  "coachName": "Mike Smith"
}
```

### Option B: Use Existing Detail Endpoints
Use existing API endpoints to resolve each entity name individually:
- `apiClient.clubs.getClubById(clubId)` → extract `.name`
- `apiClient.teams.getTeamOverview(teamId)` → extract `.name` (or create lightweight endpoint)  
- `apiClient.ageGroups.getById(ageGroupId)` → extract `.name`
- Player detail endpoint (needs creation) → extract `.name`
- Coach detail endpoint (needs creation) → extract `.name`

### Option C: Navigation Context/Cache
Pass entity names down through route context or use a Zustand navigation store that pages populate as they load their data. Navigation component reads from store instead of fetching.

## Implementation Checklist

- [ ] Decide on approach (A, B, or C) — Option C recommended for performance
- [ ] If Option C: Create `useNavigationStore` Zustand store or extend existing `NavigationContext`
- [ ] If Option C: Update page components to populate store with entity names on load
- [ ] Update `MobileNavigation.tsx` to read entity names from store/context instead of static data
- [ ] Remove all 5 data imports
- [ ] Test breadcrumb display with API data across all routes
- [ ] Handle loading states (entity names may not be available immediately)
- [ ] Handle error states (entity not found)

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `getClubById(id).name` | Navigation store / API | Club display name |
| `getTeamById(id).name` | Navigation store / API | Team display name |
| `getAgeGroupById(id).name` | Navigation store / API | Age group display name |
| `getPlayerById(id).name` | Navigation store / API | Player display name |
| `getCoachById(id).name` | Navigation store / API | Coach display name |

## Dependencies

- `NavigationContext` already exists in `web/src/contexts/` — may be extended
- All entity detail pages already fetch the entity data — they can populate a shared store
- Existing API hooks (`useClubById`, `useAgeGroupById`, etc.) could be reused

## Notes
- This is the **highest priority component** because it affects every page
- Option C (context/store) avoids additional API calls since pages already fetch entity data
- Must handle the case where navigation renders before page data loads (show skeleton/placeholder)
- Consider caching entity names in session/local storage to avoid flicker on route changes
- The current static data approach is synchronous — API approach introduces async behavior for the first render
