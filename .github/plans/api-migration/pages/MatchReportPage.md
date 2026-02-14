# Migration Plan: MatchReportPage

## File
`web/src/pages/matches/MatchReportPage.tsx`

## Priority
**High** — Match report detail view; key post-match review page showing goals, cards, ratings, etc.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleMatches` | `@/data/matches` | Find match by ID to display report (lineup, events, ratings) |
| `samplePlayers` | `@/data/players` | Resolve player names for goal scorers, assists, bookings, subs, ratings |
| `sampleCoaches` | `@/data/coaches` | Resolve coach names for staff on match day |
| `sampleTeams` | `@/data/teams` | Resolve team names for match header |
| `sampleClubs` | `@/data/clubs` | Resolve club details for match context |
| `coachRoleDisplay` | `@/data/referenceData` | Display labels for coach roles in match staff section |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/matches/{id}/report
```

Response: Complete match report with all names resolved:
```json
{
  "matchId": "...",
  "date": "2024-01-15",
  "homeTeam": { "id": "...", "name": "Vale FC Blues", "clubName": "Vale FC" },
  "awayTeam": { "id": "...", "name": "Renton United" },
  "score": { "home": 3, "away": 1 },
  "lineup": [
    { "playerId": "...", "playerName": "James Wilson", "position": "ST", "squadNumber": 9, "rating": 8.0 }
  ],
  "goalScorers": [
    { "playerId": "...", "playerName": "James Wilson", "minute": 23, "type": "open_play" }
  ],
  "cards": [...],
  "substitutions": [...],
  "coaches": [
    { "coachId": "...", "coachName": "Mike Smith", "role": "Head Coach" }
  ],
  "manOfMatch": { "playerId": "...", "playerName": "James Wilson" }
}
```

### Reference Data Note
`coachRoleDisplay` is a UI label mapping → move to shared constants.

### New Hook Required
```typescript
useMatchReport(matchId: string): UseApiState<MatchReportDto>
```

## Implementation Checklist

- [ ] Create `GET /api/matches/{id}/report` endpoint (or include report in match detail)
- [ ] Create `MatchReportDto` with all report sections (lineup, events, ratings, staff)
- [ ] Ensure all names are resolved server-side (players, coaches, teams)
- [ ] Move `coachRoleDisplay` to shared constants
- [ ] Add DTO to API client
- [ ] Create `useMatchReport()` hook
- [ ] Replace all 6 data imports
- [ ] Add loading state for report sections
- [ ] Handle "no report yet" state (match scheduled but not played)
- [ ] Test all report sections: lineup, goals, cards, subs, ratings, man of match

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `sampleMatches.find(m => m.id === matchId)` | `GET /api/matches/{id}/report` | Full report |
| `samplePlayers` for name resolution | Resolved in API response | All player names inline |
| `sampleCoaches` for name resolution | Resolved in API response | Coach names inline |
| `sampleTeams` for team names | Resolved in API response | Team context inline |
| `sampleClubs` for club context | Resolved in API response | Club names inline |
| `coachRoleDisplay` | Shared constants | UI label mapping |

## Dependencies

- `AddEditMatchPage.tsx` — shares match detail endpoint
- `MatchesListPage.tsx` — navigates here
- Player, coach, team endpoints are shared with many other pages

## Notes
- This page has 6 data imports resolving names from multiple entity types — the API MUST return denormalized data
- Server-side name resolution is critical to avoid N+1 frontend lookups
- Match report is one of the richest data views — design DTO carefully
- Consider separating the match header (date, teams, score) from the full report (events, ratings) if the report is large
- `coachRoleDisplay` can be resolved server-side or kept as client-side constant
