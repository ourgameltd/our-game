# Migration Plan: AddEditMatchPage

## File
`web/src/pages/matches/AddEditMatchPage.tsx`

## Priority
**High** — Most complex form in the application; 10 data imports across 9 data files.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleMatches` | `@/data/matches` | Find existing match for edit mode |
| `sampleTeams` | `@/data/teams` | Team selection dropdown, squad roster |
| `sampleClubs` | `@/data/clubs` | Club context for the match |
| `samplePlayers` | `@/data/players` | Player selection for lineup, scorers, cards, substitutions |
| `sampleFormations` | `@/data/formations` | Formation selection dropdown |
| `getFormationsBySquadSize` | `@/data/formations` | Filter formations by team's squad size |
| `sampleTactics` | `@/data/tactics` | Tactic selection for the match |
| `getResolvedPositions` | `@/data/tactics` | Resolve tactic positions for lineup display |
| `getAgeGroupById` | `@/data/ageGroups` | Age group context |
| `sampleAgeGroups` | `@/data/ageGroups` | Age group list |
| `sampleCoaches` | `@/data/coaches` | Coach selection for match staff |
| `getCoachesByTeam` | `@/data/coaches` | Filter coaches by team |
| `getCoachesByAgeGroup` | `@/data/coaches` | Filter coaches by age group |
| `getPlayerSquadNumber` | `@/data/teams` | Get player's squad number for lineup |
| `weatherConditions` | `@/data/referenceData` | Weather dropdown options |
| `squadSizes` | `@/data/referenceData` | Squad size reference |
| `cardTypes` | `@/data/referenceData` | Card type options (yellow, red) |
| `injurySeverities` | `@/data/referenceData` | Injury severity dropdown |
| `coachRoleDisplay` | `@/data/referenceData` | Coach role labels |

## Proposed API Changes

### New API Endpoints Required

1. **Get Match for Edit**
   ```
   GET /api/matches/{id}
   ```

2. **Create Match**
   ```
   POST /api/matches
   ```

3. **Update Match**
   ```
   PUT /api/matches/{id}
   ```

4. **Team Players with Squad Numbers**
   ```
   GET /api/teams/{teamId}/players?includeSquadNumbers=true
   ```

5. **Team Coaches**
   ```
   GET /api/teams/{teamId}/coaches
   ```

6. **Formations by Squad Size**
   ```
   GET /api/formations?squadSize=11
   ```
   or keep client-side (formation data is reference data)

7. **Tactics by Scope**
   Already exists: `apiClient.tactics.getByScope()`

### Reference Data (keep client-side)
- `weatherConditions`, `squadSizes`, `cardTypes`, `injurySeverities`, `coachRoleDisplay` → move to shared constants

### New Hooks Required
```typescript
useMatch(matchId: string): UseApiState<MatchDetailDto>
useTeamPlayers(teamId: string): UseApiState<TeamPlayerDto[]>
useTeamCoaches(teamId: string): UseApiState<CoachSummaryDto[]>
useFormations(squadSize?: number): UseApiState<FormationDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/matches/{id}` endpoint with full match detail
- [ ] Create `POST /api/matches` endpoint
- [ ] Create `PUT /api/matches/{id}` endpoint
- [ ] Create match detail/create/update DTOs
- [ ] Create `GET /api/teams/{teamId}/players` endpoint (with squad numbers)
- [ ] Create `GET /api/teams/{teamId}/coaches` endpoint
- [ ] Decide if formations stay client-side or become an API endpoint
- [ ] Use existing `useTacticsByScope()` for tactic selection
- [ ] Move reference data items to shared constants
- [ ] Create necessary hooks
- [ ] Replace all 10+ data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Handle lineup builder with API data
- [ ] Handle match event recording (goals, cards, subs) with API data
- [ ] Test create/edit flows end-to-end
- [ ] Add loading states for all dependent data dropdowns

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `sampleMatches.find()` | `GET /api/matches/{id}` | Match detail for edit |
| `sampleTeams` | Via club/age-group API or existing hooks | Team dropdown |
| `samplePlayers` | `GET /api/teams/{teamId}/players` | Lineup selection |
| `sampleCoaches`/`getCoachesByTeam` | `GET /api/teams/{teamId}/coaches` | Staff selection |
| `sampleFormations`/`getFormationsBySquadSize` | Client-side or `GET /api/formations` | Formation dropdown |
| `sampleTactics` | `useTacticsByScope()` | Already has API |
| `getResolvedPositions` | Server-side or keep client-side | Position resolution logic |
| `getPlayerSquadNumber` | Included in team players response | Squad numbers |
| `weatherConditions` etc. | Shared constants | Move from referenceData |
| Form submit | `POST`/`PUT /api/matches/{id}` | Save match |

## Dependencies

- `MatchReportPage.tsx` — shares match detail endpoint
- `MatchesListPage.tsx` — shares match list endpoint
- Team players and coaches endpoints used by other pages too
- Tactics API already exists

## Notes
- This is the **most complex page** in the application with the most data dependencies
- Consider a dedicated "match form data" endpoint that returns all needed dropdown data in one call
- Lineup builder needs real-time squad number resolution
- Formation/tactic resolution may stay client-side for responsiveness
- Match events (goals, cards, subs) are complex nested data — design API DTOs carefully
- This page should be one of the last to migrate due to its complexity
