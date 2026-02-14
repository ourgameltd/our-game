# Migration Plan: PlayerReportCardPage

## File
`web/src/pages/players/PlayerReportCardPage.tsx`

## Priority
**High** — Individual report card detail view; key coaching assessment tool.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getReportsByPlayerId` | `@/data/reports` | Fetches all reports for a player, then filters to find specific report by ID |
| `getPlayerById` | `@data/players` | Fetches player details for context display |

## Proposed API Changes

### New API Endpoints Required

1. **Get Report Card by ID**
   ```
   GET /api/reports/{id}
   ```
   Response: Full report card including player context, assessments, ratings, coach notes.

### New Hook Required
```typescript
useReportCard(reportId: string): UseApiState<ReportCardDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/reports/{id}` endpoint
- [ ] Create `ReportCardDetailDto` with all assessment fields
- [ ] Include player name/position in response (denormalized)
- [ ] Add DTO to API client
- [ ] Create `useReportCard()` hook
- [ ] Replace `getReportsByPlayerId` and `getPlayerById` imports
- [ ] Add loading/error states
- [ ] Test report card display, ratings, coach notes

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getReportsByPlayerId(id)` then filter by reportId | `GET /api/reports/{reportId}` | Direct lookup by report ID |
| `getPlayerById(id)` | Included in report response | Player context denormalized |

## Dependencies

- `PlayerReportCardsPage.tsx` — list view of all reports for a player
- `AddEditReportCardPage.tsx` — create/edit report form
- Report card DTOs already exist: `ClubReportCardDto` — may be extended or a separate detail DTO

## Notes
- Current approach fetches all reports then filters — API should return single report directly
- `ClubReportCardDto` already exists in the API client — verify if it's sufficient or needs extension
- Include assessment categories, individual ratings, and overall grade in the detail response
