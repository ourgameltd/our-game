# Migration Plan: TeamKitsPage

## File
`web/src/pages/teams/TeamKitsPage.tsx`

## Priority
**Medium** — Team kit management; secondary feature.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleTeams` | `@/data/teams` | Find team by ID for page context and kit details |
| `sampleClubs` | `@/data/clubs` | Resolve club details for kit colors/branding |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/teams/{teamId}/kits
```

Response: Team kit configurations with club branding:
```json
{
  "teamId": "...",
  "teamName": "Blues",
  "clubName": "Vale FC",
  "kits": [
    {
      "type": "home",
      "pattern": "stripes",
      "primaryColor": "#FF0000",
      "secondaryColor": "#FFFFFF",
      "crest": "..."
    }
  ]
}
```

### Existing Pattern
`apiClient.clubs.getKits(clubId)` exists for club-level kits — team kits may follow same DTO structure.

### New Hook Required
```typescript
useTeamKits(teamId: string): UseApiState<TeamKitsDto>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/kits` endpoint (or extend team detail to include kits)
- [ ] Create DTOs (may reuse `ClubKitDto` structure)
- [ ] Add to API client
- [ ] Create hook
- [ ] Replace data imports
- [ ] Add loading/error states
- [ ] Test kit display with correct colors and patterns

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `sampleTeams.find(t => t.id === teamId)` | `GET /api/teams/{teamId}/kits` | Team kit data |
| `sampleClubs.find(c => c.id === clubId)` | Included in kit response | Club branding context |

## Dependencies

- `ClubKitsPage.tsx` — already migrated (uses `apiClient.clubs.getKits()`)
- `KitBuilder.tsx` component — uses `kitTypes` from referenceData (stays client-side)

## Notes
- Follow `ClubKitsPage.tsx` pattern which is already fully migrated
- Kit patterns and types should remain client-side constants
- Team kits may inherit from club kits with overrides
