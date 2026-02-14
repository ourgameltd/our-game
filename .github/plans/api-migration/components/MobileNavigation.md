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

### **RECOMMENDED: Option C - Navigation Context/Cache (No Additional API Calls)**

**DO NOT create additional API endpoints for navigation breadcrumbs.** Parent pages already fetch entity data, so use React state management to populate navigation.

### Implementation Strategy

1. **Create/Extend Navigation Store** (Zustand or Context):
```typescript
// web/src/stores/navigationStore.ts
interface NavigationStore {
  entityNames: Record<string, string>;  // Key format: "club:uuid" → "Vale FC"
  setEntityName: (type: string, id: string, name: string) => void;
  getEntityName: (type: string, id: string) => string | undefined;
  clearEntity: (type: string, id: string) => void;
}
```

2. **Pages Populate Store When Loading Data**:
```typescript
// In PlayerProfilePage.tsx
const { data: player } = usePlayer(playerId);
const { setEntityName } = useNavigationStore();

useEffect(() => {
  if (player) {
    setEntityName('player', playerId, player.name);
    setEntityName('team', player.teamId, player.teamName); // from denormalized data
    setEntityName('ageGroup', player.ageGroupId, player.ageGroupName);
    setEntityName('club', player.clubId, player.clubName);
  }
}, [player]);
```

3. **MobileNavigation Reads from Store**:
```typescript
// In MobileNavigation.tsx
const { getEntityName } = useNavigationStore();
const { clubId, teamId, playerId } = useParams();

const clubName = getEntityName('club', clubId) || 'Loading...';
const teamName = getEntityName('team', teamId);
const playerName = getEntityName('player', playerId);
```

### Why This Approach?

- ✅ **No redundant API calls** - pages already fetch entity data
- ✅ **Better performance** - synchronous reads from store
- ✅ **Simpler architecture** - no dedicated breadcrumb endpoints
- ✅ **Works offline** - store can persist to localStorage
- ✅ **Scales well** - handles any entity type without new endpoints

### Alternative Options (NOT RECOMMENDED)

#### Option A: Dedicated Breadcrumb/Navigation API
❌ **DO NOT USE** - Adds unnecessary API calls when pages already fetch entity data

#### Option B: Use Existing Detail Endpoints
❌ **DO NOT USE** - Creates redundant API calls in navigation component

## Implementation Checklist

- [ ] Create `navigationStore.ts` with Zustand or extend existing `NavigationContext`
- [ ] Define entity name storage interface (`type:id` → `name`)
- [ ] Add `setEntityName()`, `getEntityName()`, `clearEntity()` methods
- [ ] **CRITICAL**: Update ALL entity detail pages to populate store:
  - [ ] Club pages → set club name
  - [ ] Age group pages → set age group name + club name
  - [ ] Team pages → set team name + age group name + club name
  - [ ] Player pages → set player name + team/age-group/club names (from denormalized response)
  - [ ] Coach pages → set coach name + team/age-group names
  - [ ] Development plan pages → set all context names
  - [ ] Report card pages → set all context names
- [ ] Update `MobileNavigation.tsx` to read from store instead of static data functions
- [ ] Remove all data imports from `MobileNavigation.tsx`
- [ ] Handle loading state (show skeleton or placeholder when name not yet in store)
- [ ] Add localStorage persistence for navigation store (optional)
- [ ] Test breadcrumb display across all routes

## Database / API Considerations

**No database migrations needed** - this is purely a frontend state management change.

**No new API endpoints needed** - parent pages already fetch all required data.

**API Response Requirements**:
- All detail endpoints MUST include denormalized entity names:
  - Player responses: include `teamName`, `ageGroupName`, `clubName`
  - Team responses: include `ageGroupName`, `clubName`
  - Age group responses: include `clubName`
  - Match responses: include `homeTeamName`, `awayTeamName`, `clubName`
  - Report/Plan responses: include `playerName`, `teamName`, `ageGroupName`, `clubName`


## Backend Implementation Standards

**NOTE**: This component does not require new API endpoints. It uses a navigation store pattern (Zustand/Context) populated by parent pages. No API calls are made from this component.

Parent pages should follow backend implementation standards when fetching entity data and populate the navigation store with entity names for breadcrumb display.

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
