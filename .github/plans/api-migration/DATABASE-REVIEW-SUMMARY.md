# API Migration Plans - Database & State Management Review Summary

**Review Date**: February 14, 2026  
**Reviewer**: GitHub Copilot  
**Status**: ✅ Complete

## Overview

All API migration plans have been reviewed and updated to include:
1. **SQL query requirements** for each endpoint
2. **Database migration checks** to verify schema compatibility
3. **Reference data strategy** (database vs client-side)
4. **State management patterns** for navigation and breadcrumbs
5. **Performance considerations** (denormalization, N+1 query prevention)

## Key Updates Made

### 1. README.md - Strategic Guidance Added

**New Sections**:
- **Database & Reference Data Strategy** - Guidelines for migrations, enums, and denormalization
- **State Management Strategy** - React Context/Zustand for navigation (NOT API calls)
- **SQL Query Notes** - Added to each endpoint with JOIN requirements and performance notes

**Key Decisions**:
- Denormalize common lookups (team names, club names) in API responses
- Use existing database enums (CardType, CoachRole, Direction, DrillCategory, etc.)
- Keep UI labels client-side for i18n readiness
- Complex queries (tactic inheritance, statistics) use custom SQL

### 2. MobileNavigation Component - Critical Change

**Previous Approach** ❌:
- Options included dedicated API endpoint or using detail endpoints
- Would cause redundant API calls

**New Approach** ✅:
- Use React Context or Zustand store for entity names
- Parent pages populate store when loading data
- Navigation component reads from store (synchronous, no API calls)
- Pattern documented with implementation examples

**Implementation**:
```typescript
// Pages populate store
if (player) {
  setEntityName('player', playerId, player.name);
  setEntityName('team', player.teamId, player.teamName); // from denormalized response
}

// Navigation reads from store
const playerName = getEntityName('player', playerId) || 'Loading...';
```

### 3. Database Migration Checks

**Per-Page Analysis** - Each plan now includes:

✅ **Tables Required**:
- Verified against existing Models folder
- Identified missing columns/relationships
- Flagged enum vs VARCHAR issues

✅ **SQL Queries Documented**:
- Primary query for GET endpoints with JOINs
- Transaction logic for POST/PUT endpoints
- Recursive CTEs for complex logic (tactic inheritance)

✅ **Indexes Needed**:
- Foreign key columns (TeamId, PlayerId, MatchId)
- Date/Status columns for filtering
- Unique constraints (squad numbers, etc.)

### 4. Reference Data Strategy Clarified

**Database Enums** (already exist):
- CardType, CoachRole, Direction, DrillCategory, KitType, LinkType
- MatchStatus, PlayerPosition, SquadSize, Severity, UserRole, Level
- DrillSource, KitItemType, OrderStatus, PlanStatus, ObjectiveStatus, SessionStatus, ScopeType

**Client-Side Constants** (keep in frontend):
- UI label mappings (coachRoleDisplay, playerAttributeLabels)
- Display formatters and color schemes
- Formation position templates (30+ formations)
- Chart rendering configurations

**Potential New Enums** (evaluate):
- WeatherCondition for matches (currently missing)
- ImageTag for player albums
- GoalType (open play, penalty, header, etc.)

### 5. Key Pages Updated

#### High-Priority Pages (SQL + Denormalization)

**PlayerProfilePage** ✅:
- Single query with JOINs for Player + Team + AgeGroup + Club
- Denormalize all names to avoid N+1 lookups
- Performance ratings pre-computed
- Navigation store population pattern

**MatchReportPage** ✅:
- Most complex view - 6+ lookup tables
- All names resolved server-side (players, coaches, teams)
- Comprehensive SQL examples for lineup, goals, cards, subs
- Consider separate endpoint for performance

**AddEditMatchPage** ✅:
- Complex transaction with Match + Lineup + Events
- Weather enum needs to be added to database
- Reference data strategy for dropdowns
- Squad number resolution query

**TacticDetailPage** ✅:
- Recursive CTE for inheritance resolution
- Position override logic server-side
- Complex but documented SQL approach

**PlayerAbilitiesPage** ✅:
- All 35 EA FC attributes from PlayerAttribute table
- Overall rating calculation (weighted by position)
- Attribute history for growth charts
- Migration check for attribute seeding

#### Form Pages (Transactions + Validation)

**AddEditTrainingSessionPage** ✅:
- Multi-table INSERT transaction
- SessionDrill with OrderIndex for sequence
- SessionAttendance tracking
- Reference data moved to constants

**DrillFormPage** ✅:
- Scope-based access control (Club/AgeGroup/Team/User)
- Junction tables for scope links
- DrillLink table for external resources
- PlayerAttributes for focus areas

**AddEditReportCardPage** ✅:
- PlayerReport + AttributeEvaluation + ReportDevelopmentAction
- Consider assessment templates for dynamic forms
- Transaction integrity critical

### 6. Component Updates

**TeamCard, RecentPerformanceCard, CoachCard** ✅:
- All receive denormalized data via props
- Parents responsible for API calls
- SQL documented in parent endpoints
- No client-side lookups

**KitBuilder, PositionRolePanel** ✅:
- UI reference data stays client-side
- Database enums used for stored values
- Display mappings in constants

## Database Schema Verification Checklist

### ✅ Existing Models Confirmed
- [x] Player, Team, Club, AgeGroup, Coach
- [x] Match, MatchLineup, MatchReport, Goal, Card, MatchSubstitution
- [x] TrainingSession, SessionDrill, SessionAttendance
- [x] DevelopmentPlan, DevelopmentGoal, ProgressNote
- [x] PlayerReport, AttributeEvaluation, ReportDevelopmentAction
- [x] Drill, DrillTemplate, DrillLink
- [x] Formation, FormationPosition
- [x] TacticPrinciple, PositionOverride
- [x] PlayerAttribute, PerformanceRating
- [x] PlayerTeam (with SquadNumber), TeamCoach, AgeGroupCoordinator
- [x] Kit, KitOrder, EmergencyContact, PlayerImage

### ⚠️ Missing/Check Required
- [ ] WeatherCondition enum for Match table (currently missing)
- [ ] GoalType enum or field in Goal table
- [ ] PlayerAttributeHistory for growth tracking (optional)
- [ ] Assessment template schema (for dynamic report cards)
- [ ] Attendance status enum (Present, Absent, Injured, Late)

### 🔍 Denormalization Requirements

**API Responses MUST Include**:
- Team → `clubName`, `ageGroupName`, `clubPrimaryColor`, `clubSecondaryColor`
- Player → `teamName`, `ageGroupName`, `clubName`
- Match → `homeTeamName`, `awayTeamName`, `clubName`, opponent resolved
- Performance → `playerName`, `matchOpponent`, `teamName`
- Coach → Team assignments with `teamName`, `ageGroupName`
- Report/Plan → Full entity context names

**Implementation**:
- Use SQL JOINs in API layer
- DTOs include denormalized fields
- Single query returns all display data

## Reference Data Migration Path

### Phase 1: Enum Verification (Immediate)
1. Verify all database enums match frontend usage
2. Add WeatherCondition enum if weather field is VARCHAR
3. Check GoalType/EventType enums
4. Validate all enum values match dropdown options

### Phase 2: Client-Side Constants (With Migration)
1. Move all `referenceData.ts` exports to `web/src/constants/`
2. Separate UI labels from API enums
3. Create `displayMappings.ts` for enum → label conversion
4. Update all component imports

### Phase 3: Seeded Reference Data (Later)
1. Formation templates (30+ formations) → seed script
2. Drill templates → scope-based reference data
3. Assessment templates → optional dynamic forms

## State Management Implementation

### Navigation Store - Required Changes

**Create** `web/src/stores/navigationStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationStore {
  entityNames: Record<string, string>; // "player:uuid" → "James Wilson"
  setEntityName: (type: string, id: string, name: string) => void;
  getEntityName: (type: string, id: string) => string | undefined;
  clearEntity: (type: string, id: string) => void;
  clearAll: () => void;
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      entityNames: {},
      setEntityName: (type, id, name) =>
        set((state) => ({
          entityNames: { ...state.entityNames, [`${type}:${id}`]: name },
        })),
      getEntityName: (type, id) => get().entityNames[`${type}:${id}`],
      clearEntity: (type, id) =>
        set((state) => {
          const newNames = { ...state.entityNames };
          delete newNames[`${type}:${id}`];
          return { entityNames: newNames };
        }),
      clearAll: () => set({ entityNames: {} }),
    }),
    { name: 'navigation-store' }
  )
);
```

**Update All Entity Pages**:
- HomePage → sets user info (optional)
- Club pages → set club name
- Age group pages → set age group + club names
- Team pages → set team + age group + club names
- Player pages → set player + all parent entity names
- Coach pages → set coach + team/club names
- Match pages → set match descriptor
- Development plan pages → set plan + player context
- Report pages → set report + player context

**Update MobileNavigation**:
```typescript
const { getEntityName } = useNavigationStore();
const { clubId, teamId, playerId } = useParams();

const clubName = getEntityName('club', clubId);
const teamName = getEntityName('team', teamId);
const playerName = getEntityName('player', playerId);

// Handle loading state
if (!clubName && clubId) return <Skeleton />;
```

## Performance Optimization Patterns

### 1. Denormalized Queries (Prevent N+1)
```sql
-- GOOD: Single query with JOINs
SELECT p.Id, p.Name, t.Name as TeamName, ag.Name as AgeGroupName
FROM Player p
JOIN Team t ON p.TeamId = t.Id
JOIN AgeGroup ag ON t.AgeGroupId = ag.Id

-- BAD: Multiple queries
SELECT p.Id, p.Name, p.TeamId FROM Player
-- Then frontend does: teams.find(t => t.id === player.teamId)
```

### 2. Computed Fields (Server-Side)
```sql
-- Overall rating, attendance counts, statistics
AVG(pa.Value) as OverallRating,
COUNT(DISTINCT sa.PlayerId) as AttendanceCount
```

### 3. Pagination
```sql
OFFSET @skip ROWS
FETCH NEXT @take ROWS ONLY
```

### 4. Indexes Required
- Foreign keys: PlayerId, TeamId, ClubId, MatchId
- Date columns: Match.Date, TrainingSession.Date
- Status enums: Match.Status, Session.Status
- Join tables: PlayerTeam(TeamId, PlayerId), TeamCoach(TeamId, CoachId)

### 5. Consider Materialized Views
- Team statistics (wins, losses, goals)
- Player performance summaries
- Attendance records

## Migration Order Recommendation

Based on complexity and dependencies:

### Phase 1: Core Entities (Weeks 1-2)
1. ✅ User profile (getCurrentUser) - simple
2. Navigation store implementation - critical
3. Player detail + abilities - high traffic
4. Team players list - common operation
5. Club settings, Team settings - admin functions

### Phase 2: Performance & Development (Weeks 3-4)
6. Player recent performances - denormalization test
7. Report cards (read-only) - moderate complexity
8. Development plans (read-only) - moderate
9. Coach profiles - multiple entity relationships

### Phase 3: Complex Forms (Weeks 5-6)
10. Create/edit report cards - transactions
11. Create/edit development plans - transactions
12. Drill forms - scope logic
13. Training session forms - nested data

### Phase 4: Match Management (Weeks 7-8)
14. Match list - filtering and pagination
15. Match report (read) - extensive denormalization
16. **AddEditMatchPage LAST** - most complex form

### Phase 5: Cleanup (Week 9)
17. Reference data migration to constants
18. Component prop-only migrations
19. Remove `data/` directory
20. Final testing and optimization

## Testing Strategy

### Database Migration Tests
- EF Core migration generation and application
- Seed data scripts for reference tables
- Foreign key constraint validation
- Enum value validation

### API Endpoint Tests
- Unit tests for repository methods (SQL)
- Integration tests for API endpoints
- DTO mapping validation
- Authorization/permissions checks

### Frontend Integration Tests
- React Query state management
- Loading/error state handling
- Navigation store population
- Denormalized data rendering

## Risks & Mitigation

### Risk 1: Schema Mismatches
**Mitigation**: Detailed migration checks in each plan, verify against Models folder

### Risk 2: N+1 Query Performance
**Mitigation**: SQL examples enforce JOIN patterns, DTOs include denormalized fields

### Risk 3: Missing Database Enums
**Mitigation**: WeatherCondition and other gaps identified, add before migration

### Risk 4: Reference Data Inconsistency
**Mitigation**: Clear strategy (database enums + client labels), phase 2 dedicated to this

### Risk 5: Navigation Flicker
**Mitigation**: Zustand persist middleware, localStorage backing, skeleton fallback

## Success Criteria

✅ **All 51 migration plans include**:
- SQL query requirements
- Database migration checks
- Reference data strategy
- State management patterns
- Navigation store usage

✅ **Strategic guidance documented**:
- Database schema verification
- Enum strategy clarified
- Denormalization patterns established
- Performance optimization documented

✅ **State management architecture defined**:
- Navigation store pattern
- No redundant API calls for breadcrumbs
- Parent-child data flow clarified

## Next Steps

1. **Review this summary** with development team
2. **Create database migration PRs** for missing enums (WeatherCondition, etc.)
3. **Implement navigation store** in `web/src/stores/`
4. **Begin Phase 1 migrations** following recommended order
5. **Track progress** using the README.md checklist

---

**All migration plans are now database-aware and ready for implementation.**
