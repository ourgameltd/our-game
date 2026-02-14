# Migration Plan: TeamCard Component

## File
`web/src/components/team/TeamCard.tsx`

## Priority
**Medium** — Component enriches team data by looking up age group and club details from static data.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name to display on team card |
| `getClubById` | `@data/clubs` | Resolves club name and colors for team card styling |

## Proposed API Changes

### Option A: Parent Passes Resolved Data (Recommended)
Parent pages that render `TeamCard` should pass the age group name and club info as part of the team data prop. The API response for team lists should include these details.

### Option B: Component Uses API Hooks
Use existing hooks:
- `useAgeGroupById(ageGroupId)` — already exists in `web/src/api/hooks.ts`
- `useClubById(clubId)` — already exists in `web/src/api/hooks.ts`

However, this could cause many parallel API calls when rendering a grid of team cards.

### Preferred Approach
Ensure the team list API responses include `ageGroupName` and `clubName`/`clubColors` as denormalized fields (which `TeamListItemDto` and `TeamWithStatsDto` may already include).

## Implementation Checklist

- [ ] Verify `TeamListItemDto` / `TeamWithStatsDto` include age group and club display info
- [ ] If not, extend the DTOs to include `ageGroupName`, `clubName`, `clubPrimaryColor`, `clubSecondaryColor`
- [ ] Update `TeamCard.tsx` props interface to accept resolved names/colors
- [ ] Update parent pages to pass resolved data from API responses
- [ ] Remove `getAgeGroupById` and `getClubById` imports
- [ ] Test team card grid renders correctly with all styling


## Backend Implementation Standards

**NOTE**: This component does not require new API endpoints. It receives all data via props from parent pages. The parent pages are responsible for API calls following the backend standards documented in their migration plans.

If the component's parent pages require API endpoint changes, refer to those page migration plans for backend implementation requirements.

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getAgeGroupById(id).name` | `team.ageGroupName` from API DTO | Resolved in API response |
| `getClubById(id).name` | `team.clubName` from API DTO | Resolved in API response |
| `getClubById(id).primaryColor` | `team.clubPrimaryColor` from API DTO | For card styling |

## Dependencies

- Used by team list pages: `TeamsListPage.tsx` (already using API), and potentially `AgeGroupsListPage.tsx`
- Parent pages already fetch team data from API — just need resolved fields

## Notes
- Option A is preferred to avoid N+1 API calls when rendering multiple team cards
- The existing `TeamWithStatsDto` likely already contains the needed fields — verify
- Club color theming is important for the visual design of team cards

## Database / API Considerations

**SQL Requirements**:
- Team list endpoints must JOIN with AgeGroup and Club tables
- Include `ageGroupName`, `clubName`, `clubPrimaryColor`, `clubSecondaryColor` in SELECT
- Single query returns all needed display data

**Migration Check**:
- Verify Club table has `primaryColor` and `secondaryColor` columns
- Verify denormalized fields in TeamListItemDto/TeamWithStatsDto

**No client-side reference data needed** - all data from database
