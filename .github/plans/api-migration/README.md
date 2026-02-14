# API Migration Plans — Static Data → API Endpoints

## Overview

This directory contains individual migration plan files for every `.tsx` file in the `web/src/` directory that currently imports static sample data from `web/src/data/`. Each plan documents the specific data dependencies, proposed API endpoints, implementation checklist, and data mapping required to migrate from static/mock data to live API calls.

## Current State

The frontend uses 15 static data files in `web/src/data/`:

| Data File | Exports | Used By (count) |
|---|---|---|
| `referenceData.ts` | UI labels, dropdowns, enum mappings (weatherConditions, teamLevels, kitTypes, playerPositions, coachRoles, playerAttributes, etc.) | ~20 files |
| `clubs.ts` | `sampleClubs`, `getClubById()` | ~15 files |
| `teams.ts` | `sampleTeams`, `getTeamById()`, `getTeamsByClubId()`, `getPlayerSquadNumber()` | ~18 files |
| `players.ts` | `samplePlayers`, `getPlayerById()`, `getPlayersByTeamId()`, `getPlayersByClubId()` | ~18 files |
| `ageGroups.ts` | `sampleAgeGroups`, `getAgeGroupById()`, `getAgeGroupsByClubId()` | ~14 files |
| `coaches.ts` | `sampleCoaches`, `getCoachById()`, `getCoachesByTeam()`, `getCoachesByClub()` | ~7 files |
| `matches.ts` | `sampleMatches`, `getMatchById()`, `getMatchesByTeamId()`, `getUpcomingMatches()`, `getPlayerRecentPerformances()` | ~7 files |
| `training.ts` | `sampleDrills`, `sampleTrainingSessions`, `sampleDrillTemplates` | ~6 files |
| `formations.ts` | `sampleFormations`, `getFormationById()`, `getFormationsBySquadSize()` | ~3 files |
| `tactics.ts` | `sampleTactics`, `getTacticById()`, `getResolvedPositions()`, inheritance logic | ~5 files |
| `reports.ts` | `sampleReports`, `getReportsByPlayerId()`, `getReportsByTeamId()` | ~5 files |
| `developmentPlans.ts` | `sampleDevelopmentPlans`, `getDevelopmentPlansByPlayerId()`, `getDevelopmentPlansByTeamId()` | ~6 files |
| `currentUser.ts` | `currentUser` (demo user object) | ~3 files |
| `statistics.ts` | `calculateGroupStatistics()`, computed from matches/players | ~0 (used indirectly) |
| `trainingPlans.ts` | `sampleTrainingPlans`, `getTrainingPlansByPlayerId()` | ~0 files |

## Existing API Endpoints

Already implemented in `web/src/api/client.ts` and `web/src/api/hooks.ts`:

| Namespace | Endpoints | Hooks |
|---|---|---|
| `apiClient.users` | `getCurrentUser()`, `getMyTeams()`, `getMyChildren()` | `useMyTeams()`, `useMyChildren()` |
| `apiClient.clubs` | `getClubById()`, `getTeams()`, `getPlayers()`, `getCoaches()`, `getStatistics()`, `getAgeGroups()`, `getKits()`, `getTrainingSessions()`, `getMatches()`, `getReportCards()` | `useClubById()`, `useClubStatistics()`, `useClubTeams()`, `useClubPlayers()`, `useClubCoaches()`, `useClubTrainingSessions()`, `useClubMatches()`, `useClubKits()`, `useClubReportCards()` |
| `apiClient.teams` | `getByAgeGroupId()`, `getTeamOverview()` | `useTeamsByAgeGroupId()`, `useTeamOverview()` |
| `apiClient.ageGroups` | `getByClubId()`, `getById()`, `getStatistics()`, `getPlayersByAgeGroupId()`, `getCoachesByAgeGroupId()`, `getReportCards()` | `useAgeGroupsByClubId()`, `useAgeGroup()`, `useAgeGroupById()`, `useAgeGroupStatistics()`, `useAgeGroupPlayers()`, `useAgeGroupReportCards()` |
| `apiClient.tactics` | `getByScope()` | `useTacticsByScope()` |
| `apiClient.drills` | `getByScope()` | `useDrillsByScope()` |
| `apiClient.drillTemplates` | `getByScope()` | `useDrillTemplatesByScope()` |

## Pages Already Fully Migrated (no data/ imports)

These pages have been fully migrated and do NOT need plans:

- `AgeGroupOverviewPage.tsx` — uses `apiClient.ageGroups`, `apiClient.clubs`, `apiClient.teams`
- `AgeGroupPlayersPage.tsx` — uses `useAgeGroupPlayers()`, `apiClient.ageGroups`
- `AgeGroupCoachesPage.tsx` — uses `apiClient.ageGroups`
- `AgeGroupMatchesPage.tsx` — uses `useClubMatches()`, `useAgeGroupById()`
- `AgeGroupReportCardsPage.tsx` — uses `useAgeGroupReportCards()`, `useAgeGroup()`
- `AgeGroupTrainingSessionsPage.tsx` — uses `useClubTrainingSessions()`, `useClub()`, `useAgeGroup()`
- `TeamOverviewPage.tsx` — uses `useTeamOverview()`
- `TeamsListPage.tsx` — uses `useClubById()`, `useAgeGroupById()`, `useTeamsByAgeGroupId()`
- `TacticsListPage.tsx` — uses `useTacticsByScope()`
- `ProfilePage.tsx` — uses `getCurrentUser()`
- `ClubOverviewPage.tsx` — uses `apiClient.clubs`
- `ClubPlayersPage.tsx` — uses `apiClient.clubs`
- `ClubKitsPage.tsx` — uses `apiClient.clubs`
- `ClubTrainingSessionsPage.tsx` — uses `useClubTrainingSessions()`, `useClubTeams()`
- `ClubMatchesPage.tsx` — uses `useClubMatches()`
- `ClubEthosPage.tsx` — uses `useClubById()`
- `ClubReportCardsPage.tsx` — uses `useClubReportCards()`

## Files Requiring Migration

### Components (11 files)

| File | Data Imports | Priority | Status |
|---|---|---|---|
| [CoachCard](components/CoachCard.md) | referenceData | Low | Not Started |
| [CoachDetailsHeader](components/CoachDetailsHeader.md) | referenceData | Low | Not Started |
| [ImageAlbum](components/ImageAlbum.md) | referenceData | Low | Not Started |
| [KitBuilder](components/KitBuilder.md) | referenceData | Low | Not Started |
| [MobileNavigation](components/MobileNavigation.md) | clubs, teams, ageGroups, players, coaches | High | Not Started |
| [PositionRolePanel](components/PositionRolePanel.md) | referenceData | Low | Not Started |
| [PrinciplePanel](components/PrinciplePanel.md) | tactics (type only) | Low | Not Started |
| [RecentPerformanceCard](components/RecentPerformanceCard.md) | matches, teams | Medium | Not Started |
| [TacticDisplay](components/TacticDisplay.md) | tactics (type only) | Low | Not Started |
| [TeamCard](components/TeamCard.md) | ageGroups, clubs | Medium | Not Started |
| [TrainingSessionsListContent](components/TrainingSessionsListContent.md) | training | Medium | Not Started |

### Pages (40 files)

| File | Data Imports | Priority | Status |
|---|---|---|---|
| [HomePage](pages/HomePage.md) | currentUser | High | Not Started |
| [NotificationsPage](pages/NotificationsPage.md) | referenceData | Low | Not Started |
| [AddEditAgeGroupPage](pages/AddEditAgeGroupPage.md) | ageGroups, clubs, referenceData | Medium | Not Started |
| [AgeGroupDevelopmentPlansPage](pages/AgeGroupDevelopmentPlansPage.md) | clubs, ageGroups, players, developmentPlans | High | Not Started |
| [AgeGroupSettingsPage](pages/AgeGroupSettingsPage.md) | ageGroups, referenceData | Medium | Not Started |
| [ClubCoachesPage](pages/ClubCoachesPage.md) | referenceData | Low | Partial |
| [ClubDevelopmentPlansPage](pages/ClubDevelopmentPlansPage.md) | clubs, players, developmentPlans | High | Not Started |
| [ClubPlayerSettingsPage](pages/ClubPlayerSettingsPage.md) | players, teams, clubs, ageGroups | Medium | Not Started |
| [ClubSettingsPage](pages/ClubSettingsPage.md) | clubs | Medium | Not Started |
| [ClubsListPage](pages/ClubsListPage.md) | players, currentUser | High | Partial |
| [CoachProfilePage](pages/CoachProfilePage.md) | coaches, teams, ageGroups, clubs, referenceData | High | Not Started |
| [CoachSettingsPage](pages/CoachSettingsPage.md) | coaches, clubs, teams, ageGroups, referenceData | Medium | Not Started |
| [DrillFormPage](pages/DrillFormPage.md) | training, clubs, ageGroups, teams, currentUser, referenceData | Medium | Not Started |
| [DrillsListPage](pages/DrillsListPage.md) | referenceData | Low | Partial |
| [DrillTemplateFormPage](pages/DrillTemplateFormPage.md) | training, clubs, ageGroups, teams, currentUser, referenceData | Medium | Not Started |
| [DrillTemplatesListPage](pages/DrillTemplatesListPage.md) | referenceData | Low | Partial |
| [AddEditMatchPage](pages/AddEditMatchPage.md) | matches, teams, clubs, players, formations, tactics, ageGroups, coaches, referenceData | High | Not Started |
| [MatchesListPage](pages/MatchesListPage.md) | matches, teams, clubs | High | Not Started |
| [MatchReportPage](pages/MatchReportPage.md) | matches, players, coaches, teams, clubs, referenceData | High | Not Started |
| [AddEditDevelopmentPlanPage](pages/AddEditDevelopmentPlanPage.md) | players, developmentPlans, ageGroups, teams, referenceData | Medium | Not Started |
| [AddEditReportCardPage](pages/AddEditReportCardPage.md) | players, reports, ageGroups, teams | Medium | Not Started |
| [PlayerAbilitiesPage](pages/PlayerAbilitiesPage.md) | players | High | Not Started |
| [PlayerAlbumPage](pages/PlayerAlbumPage.md) | players | Medium | Not Started |
| [PlayerDevelopmentPlanPage](pages/PlayerDevelopmentPlanPage.md) | players, developmentPlans | High | Not Started |
| [PlayerDevelopmentPlansPage](pages/PlayerDevelopmentPlansPage.md) | players, developmentPlans, ageGroups, teams | High | Not Started |
| [PlayerProfilePage](pages/PlayerProfilePage.md) | players, matches, teams, ageGroups | High | Not Started |
| [PlayerReportCardPage](pages/PlayerReportCardPage.md) | reports, players | High | Not Started |
| [PlayerReportCardsPage](pages/PlayerReportCardsPage.md) | players, reports, ageGroups, teams | High | Not Started |
| [PlayerSettingsPage](pages/PlayerSettingsPage.md) | players | Medium | Not Started |
| [AddEditTacticPage](pages/AddEditTacticPage.md) | tactics, formations | Medium | Not Started |
| [TacticDetailPage](pages/TacticDetailPage.md) | tactics, formations | High | Not Started |
| [AddEditTeamPage](pages/AddEditTeamPage.md) | ageGroups, teams, clubs, referenceData | Medium | Not Started |
| [AddEditTrainingSessionPage](pages/AddEditTrainingSessionPage.md) | training, teams, clubs, players, ageGroups, coaches, referenceData | High | Not Started |
| [TeamCoachesPage](pages/TeamCoachesPage.md) | teams, coaches | High | Not Started |
| [TeamDevelopmentPlansPage](pages/TeamDevelopmentPlansPage.md) | clubs, ageGroups, teams, players, developmentPlans | High | Not Started |
| [TeamKitsPage](pages/TeamKitsPage.md) | teams, clubs | Medium | Not Started |
| [TeamPlayersPage](pages/TeamPlayersPage.md) | teams, players | High | Not Started |
| [TeamReportCardsPage](pages/TeamReportCardsPage.md) | clubs, ageGroups, teams, players, reports | High | Not Started |
| [TeamSettingsPage](pages/TeamSettingsPage.md) | teams, players, referenceData | Medium | Not Started |
| [TrainingSessionsListPage](pages/TrainingSessionsListPage.md) | training, teams, clubs | High | Not Started |

### Stories (1 file)

| File | Data Imports | Priority | Status |
|---|---|---|---|
| [TacticDisplay.stories](stories/TacticDisplay.stories.md) | tactics | Low | Not Started |

## Priority Guide

- **High**: Main user-facing pages (profiles, lists, detail views, overview pages) — these directly affect user experience
- **Medium**: Forms, settings pages, and edit workflows — important but secondary to browsing flows
- **Low**: Components receiving data via props (parent responsibility), reference data only (may remain client-side), type-only imports, stories

## Special Considerations

### Reference Data (`referenceData.ts`)
Many files import UI labels, dropdown options, and enum display mappings from `referenceData.ts`. These are **client-side lookup data** (e.g., `coachRoleDisplay`, `kitTypes`, `playerDirections`, `weatherConditions`). In most cases, these should **remain as client-side constants** rather than being fetched from API. Each plan notes this where applicable.

### Formations (`formations.ts`)
Contains 30+ system-standard formations (4v4, 5v5, 7v7, 9v9, 11v11) with position coordinates. These are **reference data** that could remain client-side or be served from a read-only API endpoint. They are distinct from tactics (which are user-created and build on formations).

### Type-Only Imports
`PrinciplePanel.tsx` and `TacticDisplay.tsx` import only the `ResolvedPosition` type from `tactics.ts`. These require moving the type to a shared types file — no API call needed.

### Partially Migrated Pages
`ClubCoachesPage`, `ClubsListPage`, `DrillsListPage`, and `DrillTemplatesListPage` already use API hooks for primary data but still import from `data/` for reference data lookups or secondary data. Plans document the remaining migration work.

### Statistics Computation
`statistics.ts` computes derived statistics from matches and players. This computation should move to the API backend (already partially done — `apiClient.clubs.getStatistics()` and `apiClient.ageGroups.getStatistics()` exist). Team-level statistics endpoints are still needed.

### Current User
`currentUser.ts` provides a hardcoded demo user. `apiClient.users.getCurrentUser()` already exists. Files importing `currentUser` just need to switch to using the API hook/call.

## Database & Reference Data Strategy

### Database Migrations Required

The following database considerations must be addressed:

1. **Existing Enums** - Already in database (verify usage):
   - `CardType`, `CoachRole`, `Direction`, `DrillCategory`, `KitType`, `LinkType`
   - `MatchStatus`, `PlayerPosition`, `SquadSize`, `Severity`, `UserRole`, `Level`
   - `DrillSource`, `KitItemType`, `OrderStatus`, `PlanStatus`, `ObjectiveStatus`, `SessionStatus`, `ScopeType`

2. **Potential New Enums/Lookup Tables** (evaluate if needed):
   - Weather conditions for matches - consider adding `WeatherCondition` enum
   - Team/Age group levels - already exists as `Level` enum
   - Image tags - consider `ImageTag` enum or table

3. **Denormalized Fields for Performance**:
   - API responses should include resolved names to avoid N+1 queries:
     - Team responses: include `clubName`, `ageGroupName`, `clubPrimaryColor`, `clubSecondaryColor`
     - Player responses: include `teamName`, `ageGroupName`
     - Match responses: include `homeTeamName`, `awayTeamName`, `clubName`
     - Performance responses: include `playerName`, `matchOpponent`, `teamName`
   - Use SQL JOINs to resolve these server-side, not multiple API calls

4. **Complex Queries** - Custom SQL allowed for:
   - Statistics calculations (team/age-group/club level)
   - Performance aggregations (recent form, ratings)
   - Tactic inheritance resolution (parent → child overrides)
   - Match report compilation (lineup + events + ratings)

### Reference Data Guidelines

**Keep Client-Side** (as TypeScript constants):
- UI label mappings (e.g., `coachRoleDisplay`, `playerAttributeLabels`)
- Display formatters and helpers
- Color schemes and styling constants
- Icon mappings
- Formation position templates (30+ formations with coordinates)

**Fetch from Database** (via API or seed data):
- All enum values that appear in dropdowns (controlled vocabularies)
- Dynamic reference data that may change (club-specific configurations)
- User-created templates (formations, tactics, drill templates)

**Hybrid Approach**:
- Enum values come from database/DTOs
- Display labels stay client-side for i18n readiness
- Example: `CardType` enum in DB, `cardTypeDisplay` mapping in frontend

### State Management Strategy

**React State/Context for Navigation** (NOT API calls):
- `MobileNavigation` and breadcrumbs should use React Context or Zustand store
- Parent pages populate navigation store when loading entity data
- Avoids redundant API calls since pages already fetch entity details
- Pattern: `useNavigationStore().setEntityName(id, name)` in page components

**Example Navigation Store**:
```typescript
// Zustand store
interface NavigationStore {
  entityNames: Record<string, string>; // { clubId: "Vale FC", playerId: "James Wilson" }
  setEntityName: (key: string, name: string) => void;
  getEntityName: (key: string) => string | undefined;
}
```

**Usage in Pages**:
```typescript
// In PlayerProfilePage
const { data: player } = usePlayer(playerId);
const { setEntityName } = useNavigationStore();

useEffect(() => {
  if (player) {
    setEntityName(`player:${playerId}`, player.name);
    setEntityName(`team:${player.teamId}`, player.teamName); // from denormalized data
  }
}, [player]);
```

## New API Endpoints Needed

Based on analysis of all files, these new endpoints are required:

### Players
- `GET /api/players/{id}` — Player detail (profile, attributes, medical, album)
  - **SQL**: JOIN Team, AgeGroup for denormalized names
  - **Migration**: Verify `PlayerAttribute` table has all 35 EA FC attributes
- `GET /api/players/{id}/abilities` — Player abilities/attributes
  - **SQL**: Query `PlayerAttribute` table, grouped by category
- `GET /api/players/{id}/album` — Player photo album
  - **SQL**: Query `PlayerImage` table with tags
- `GET /api/players/{id}/reports` — Player report cards
  - **SQL**: Query `PlayerReport` with coach names resolved
- `GET /api/players/{id}/development-plans` — Player development plans
  - **SQL**: Query `DevelopmentPlan` + `DevelopmentGoal` + `ProgressNote`
- `GET /api/players/{id}/recent-performances` — Recent match performances
  - **SQL**: Complex query joining Match, MatchLineup, PerformanceRating, Team
  - **Performance**: Consider materialized view or cached aggregation
- `PUT /api/players/{id}` — Update player settings
  - **SQL**: Update Player table + PlayerAttribute records
- `GET /api/teams/{teamId}/players` — Players by team with squad numbers
  - **SQL**: JOIN PlayerTeam for squad numbers, include position and ratings

### Matches
- `GET /api/matches` — Matches list (filterable by team/club/age-group)
  - **SQL**: JOIN Team for home/away team names, filter by status
  - **Migration**: Verify `MatchStatus` enum used (not string field)
- `GET /api/matches/{id}` — Match detail with report
  - **SQL**: Complex query joining MatchReport, MatchLineup, Goal, Card, MatchSubstitution, PerformanceRating
  - **SQL**: Resolve all player names, coach names, team names in single query (avoid N+1)
- `POST /api/matches` — Create match
  - **SQL**: Insert Match, MatchLineup (many), MatchCoach (many) in transaction
  - **Migration**: Verify weather condition field type (enum vs string)
- `PUT /api/matches/{id}` — Update match
  - **SQL**: Update Match + MatchReport + events (Goals, Cards, Subs) in transaction
- `GET /api/teams/{teamId}/matches` — Matches by team
  - **SQL**: Query matches where homeTeamId OR awayTeamId = teamId

### Coaches
- `GET /api/coaches/{id}` — Coach detail profile
  - **SQL**: JOIN Coach with TeamCoach, Team, AgeGroup, AgeGroupCoordinator
  - **SQL**: Include team names, age group names, certifications
- `PUT /api/coaches/{id}` — Update coach settings
  - **SQL**: Update Coach table + certifications
- `GET /api/teams/{teamId}/coaches` — Team coaches
  - **SQL**: Query TeamCoach JOIN Coach, include roles from enum

### Reports & Development Plans
- `GET /api/reports/{id}` — Report card detail
  - **SQL**: Query PlayerReport with resolved player/team/age-group names
  - **SQL**: Include ReportDevelopmentAction items
- `POST /api/reports` — Create report card
  - **SQL**: Insert PlayerReport + development actions in transaction
- `PUT /api/reports/{id}` — Update report card
- `GET /api/development-plans/{id}` — Development plan detail
  - **SQL**: Query DevelopmentPlan + DevelopmentGoal + ProgressNote + TrainingObjective
- `POST /api/development-plans` — Create development plan
  - **SQL**: Insert plan + goals + objectives in transaction
- `PUT /api/development-plans/{id}` — Update development plan
- `GET /api/teams/{teamId}/development-plans` — Team development plans
- `GET /api/teams/{teamId}/reports` — Team report cards

### Training
- `GET /api/training-sessions` — Training sessions list
  - **SQL**: Query TrainingSession with scope filters (club/age-group/team)
- `GET /api/training-sessions/{id}` — Training session detail
  - **SQL**: JOIN SessionDrill, SessionCoach, SessionAttendance
  - **SQL**: Resolve drill names, coach names, player attendance in single query
- `POST /api/training-sessions` — Create training session
  - **SQL**: Insert TrainingSession + drills + coaches + attendance in transaction
- `PUT /api/training-sessions/{id}` — Update training session

### Tactics & Formations
- `GET /api/tactics/{id}` — Tactic detail with resolved positions
  - **SQL**: Complex query resolving tactic inheritance (parent → child overrides)
  - **SQL**: Use recursive CTE or custom logic to compute final positions
  - **Migration**: Verify `TacticPrinciple` and `PositionOverride` tables
- `POST /api/tactics` — Create tactic
- `PUT /api/tactics/{id}` — Update tactic
- `GET /api/formations` — All formations (reference data)
  - **SQL**: Query Formation + FormationPosition for coordinates
  - **Note**: Consider keeping formations as seeded reference data
- `GET /api/formations/{id}` — Formation detail

### Teams
- `PUT /api/teams/{id}` — Update team settings
  - **SQL**: Update Team table
- `POST /api/teams` — Create team
  - **SQL**: Insert Team, assign to AgeGroup
- `GET /api/teams/{teamId}/statistics` — Team statistics
  - **SQL**: Aggregate from Match results, PerformanceRating
  - **Performance**: Consider computed/cached fields

### Age Groups
- `POST /api/age-groups` — Create age group
  - **SQL**: Insert AgeGroup, assign to Club
- `PUT /api/age-groups/{id}` — Update age group settings

### Clubs
- `PUT /api/clubs/{id}` — Update club settings
  - **SQL**: Update Club table (name, colors, logo, location, ethos)

## Migration Order (Recommended)

1. **Phase 1 — Core Entities**: Player pages, Team pages (highest user impact)
2. **Phase 2 — Match Management**: Match list, match report, add/edit match
3. **Phase 3 — Coaches**: Coach profile, coach settings
4. **Phase 4 — Development**: Report cards, development plans
5. **Phase 5 — Training & Drills**: Training sessions, drill forms
6. **Phase 6 — Tactics & Formations**: Tactic detail, add/edit tactic
7. **Phase 7 — Components**: MobileNavigation, TeamCard, RecentPerformanceCard
8. **Phase 8 — Cleanup**: referenceData-only imports, type-only imports, stories
