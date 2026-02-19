# Migration Plan: TeamReportCardsPage

## File
`web/src/pages/teams/TeamReportCardsPage.tsx`

## Priority
**High** — Lists report cards at team scope; key coaching review view.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleClubs` | `@/data/clubs` | Resolves club name for page context |
| `sampleAgeGroups` | `@/data/ageGroups` | Resolves age group name for navigation |
| `sampleTeams` | `@/data/teams` | Resolves team name for page header |
| `samplePlayers` | `@/data/players` | Resolves player names for report card display |
| `getReportsByTeamId` | `@/data/reports` | Fetches all report cards for the team |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/teams/{teamId}/reports
```

Response: Array of report card summaries with player names resolved:
```json
[
  {
    "reportId": "...",
    "date": "2024-01-15",
    "playerName": "James Wilson",
    "playerId": "...",
    "overallGrade": "B+",
    "coachName": "Mike Smith",
    "status": "published"
  }
]
```

### Existing Endpoints for Context
- Use existing `useTeamOverview()` or team detail for team/club/age-group context

### New Hook Required
```typescript
useTeamReportCards(teamId: string): UseApiState<TeamReportCardDto[]>
```

## Implementation Checklist

- [x] Create `GET /api/teams/{teamId}/reports` endpoint
- [x] Create `TeamReportCardDto` with player/coach names resolved
- [x] Reuse team detail hooks for page context (team name, club, age group)
- [x] Add DTO to API client
- [x] Create `useTeamReportCards()` hook
- [x] Replace all 5 data imports
- [x] Add loading/empty/error states
- [ ] Test report card list, filtering, navigation to individual reports


## Backend Implementation Standards

### API Function Structure
- [x] Create Azure Function in `api/OurGame.Api/Functions/TeamFunctions.cs` (GetTeamReportCards)
- [x] Annotate with OpenAPI attributes for Swagger documentation:
  - `[OpenApiOperation]` with operationId, summary, description
  - `[OpenApiParameter]` for route/query parameters
  - `[OpenApiResponseWithBody]` for success responses (200, 201)
  - `[OpenApiResponseWithoutBody]` for 404, 400 responses
- [x] Apply `[Function("GetTeamReportCards")]` attribute
- [x] Keep function lean - inject `IMediator` and send command/query

### Handler Implementation  
- [x] Create handler in `api/OurGame.Application/UseCases/Teams/Queries/GetReportCardsByTeamId/GetReportCardsByTeamIdHandler.cs`
- [x] Implement `IRequestHandler<TRequest, TResponse>` from MediatR
- [x] Include all query models and DB query classes in same file as handler
- [x] Execute SQL by sending command strings to DbContext, map results to DTOs
- [x] Use parameterized queries (`@parametername`) to prevent SQL injection

### DTOs Organization
- [x] Reusing existing `ClubReportCardDto` from `api/OurGame.Application/UseCases/Clubs/Queries/GetReportCardsByClubId/DTOs/`
- [x] All DTOs already organized in shared folder
- [x] Include XML documentation comments for OpenAPI schema

### Authentication & Authorization
- [x] Verify function has authentication enabled per project conventions
- [x] Apply authorization policies if endpoint requires specific roles
- [x] Check user has access to requested resources (club/team/player)

### Error Handling
- [x] Do NOT use try-catch unless specific error handling required
- [x] Let global exception handler manage unhandled exceptions  
- [x] Return BadRequest for invalid team ID format (400)
- [x] Return Unauthorized for missing user identity (401)

### RESTful Conventions
- [x] Use appropriate HTTP methods: GET for retrieving report cards
- [x] Return correct status codes: 200 OK, 400 Bad Request, 401 Unauthorized

## Data Mapping

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getReportsByTeamId(teamId)` | `GET /api/teams/{teamId}/reports` | Report list |
| `samplePlayers` for name resolution | Resolved in API response | Player names inline |
| `sampleTeams` | Via team detail hooks | Team context |
| `sampleAgeGroups` | Via team detail (includes age group) | Age group context |
| `sampleClubs` | Via team detail (includes club) | Club context |

## Dependencies

- `AgeGroupReportCardsPage.tsx` — already migrated (`useAgeGroupReportCards()`)
- `ClubReportCardsPage.tsx` — already migrated (`useClubReportCards()`)
- Follow the pattern from those pages

## Notes
- Five data imports resolving names from different entities — API must return denormalized data
- Both `AgeGroupReportCardsPage` and `ClubReportCardsPage` are already migrated — follow their DTOs and patterns
- `ClubReportCardDto` already exists — `TeamReportCardDto` may be the same or similar
