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


## Backend Implementation Standards

### API Function Structure
- [ ] Create Azure Function in `api/OurGame.Api/Functions/[Area]/[ActionName]Function.cs`
  - Example: `api/OurGame.Api/Functions/Players/GetPlayerAbilitiesFunction.cs`
- [ ] Annotate with OpenAPI attributes for Swagger documentation:
  - `[OpenApiOperation]` with operationId, summary, description
  - `[OpenApiParameter]` for route/query parameters
  - `[OpenApiResponseWithBody]` for success responses (200, 201)
  - `[OpenApiResponseWithoutBody]` for 404, 400 responses
- [ ] Apply `[Function("FunctionName")]` attribute
- [ ] Keep function lean - inject `IMediator` and send command/query

### Handler Implementation  
- [ ] Create handler in `api/OurGame.Application/[Area]/[ActionName]/[ActionName]Handler.cs`
  - Example: `api/OurGame.Application/Players/GetPlayerAbilities/GetPlayerAbilitiesHandler.cs`
- [ ] Implement `IRequestHandler<TRequest, TResponse>` from MediatR
- [ ] Include all query models and DB query classes in same file as handler
- [ ] Execute SQL by sending command strings to DbContext, map results to DTOs
- [ ] Use parameterized queries (`@parametername`) to prevent SQL injection

### DTOs Organization
- [ ] Create DTOs in `api/OurGame.Application/[Area]/[ActionName]/DTOs/[DtoName].cs`
- [ ] All DTOs for an action in single folder
- [ ] Use records for immutable DTOs: `public record PlayerAbilitiesDto(...)`
- [ ] Include XML documentation comments for OpenAPI schema

### Authentication & Authorization
- [ ] Verify function has authentication enabled per project conventions
- [ ] Apply authorization policies if endpoint requires specific roles
- [ ] Check user has access to requested resources (club/team/player)

### Error Handling
- [ ] Do NOT use try-catch unless specific error handling required
- [ ] Let global exception handler manage unhandled exceptions  
- [ ] Return `Results.NotFound()` for missing resources (404)
- [ ] Return `Results.BadRequest()` for validation failures (400)
- [ ] Return `Results.Problem()` for business rule violations

### RESTful Conventions
- [ ] Use appropriate HTTP methods:
  - GET for retrieving data (idempotent, cacheable)
  - POST for creating resources
  - PUT for full updates
  - PATCH for partial updates (if needed)
  - DELETE for removing resources
- [ ] Return correct status codes:
  - 200 OK for successful GET/PUT
  - 201 Created for successful POST (include Location header)
  - 204 No Content for successful DELETE
  - 400 Bad Request for validation errors
  - 404 Not Found for missing resources
  - 401 Unauthorized for auth failures
  - 403 Forbidden for insufficient permissions

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
