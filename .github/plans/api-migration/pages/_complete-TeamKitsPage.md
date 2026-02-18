# Migration Plan: TeamKitsPage

## Status: COMPLETED ✅

**Completion Date:** February 18, 2026

### Implementation Summary
- Created GET /v1/teams/{teamId}/kits endpoint with full CRUD (POST, PUT, DELETE)
- Backend: Query handler (GetKitsByTeamId) and Command handlers (Create, Update, Delete)
- Backend: Azure Functions endpoints in TeamFunctions.cs with OpenAPI documentation
- Frontend: API client methods (getKits, createKit, updateKit, deleteKit)
- Frontend: React hooks (useTeamKits, useCreateTeamKit, useUpdateTeamKit, useDeleteTeamKit)
- Frontend: TeamKitsPage migrated from static data to API with skeleton loading states
- All CRUD operations fully functional

---

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

- [x] Create `GET /api/teams/{teamId}/kits` endpoint (or extend team detail to include kits)
- [x] Create DTOs (may reuse `ClubKitDto` structure)
- [x] Add to API client
- [x] Create hook
- [x] Replace data imports
- [x] Add loading/error states
- [x] Test kit display with correct colors and patterns


## Backend Implementation Standards

### API Function Structure
- [x] Create Azure Function in `api/OurGame.Api/Functions/[Area]/[ActionName]Function.cs`
  - Example: `api/OurGame.Api/Functions/Players/GetPlayerAbilitiesFunction.cs`
- [x] Annotate with OpenAPI attributes for Swagger documentation:
  - `[OpenApiOperation]` with operationId, summary, description
  - `[OpenApiParameter]` for route/query parameters
  - `[OpenApiResponseWithBody]` for success responses (200, 201)
  - `[OpenApiResponseWithoutBody]` for 404, 400 responses
- [x] Apply `[Function("FunctionName")]` attribute
- [x] Keep function lean - inject `IMediator` and send command/query

### Handler Implementation  
- [x] Create handler in `api/OurGame.Application/[Area]/[ActionName]/[ActionName]Handler.cs`
  - Example: `api/OurGame.Application/Players/GetPlayerAbilities/GetPlayerAbilitiesHandler.cs`
- [x] Implement `IRequestHandler<TRequest, TResponse>` from MediatR
- [x] Include all query models and DB query classes in same file as handler
- [x] Execute SQL by sending command strings to DbContext, map results to DTOs
- [x] Use parameterized queries (`@parametername`) to prevent SQL injection

### DTOs Organization
- [x] Create DTOs in `api/OurGame.Application/[Area]/[ActionName]/DTOs/[DtoName].cs`
- [x] All DTOs for an action in single folder
- [x] Use records for immutable DTOs: `public record PlayerAbilitiesDto(...)`
- [x] Include XML documentation comments for OpenAPI schema

### Authentication & Authorization
- [x] Verify function has authentication enabled per project conventions
- [x] Apply authorization policies if endpoint requires specific roles
- [x] Check user has access to requested resources (club/team/player)

### Error Handling
- [x] Do NOT use try-catch unless specific error handling required
- [x] Let global exception handler manage unhandled exceptions  
- [x] Return `Results.NotFound()` for missing resources (404)
- [x] Return `Results.BadRequest()` for validation failures (400)
- [x] Return `Results.Problem()` for business rule violations

### RESTful Conventions
- [x] Use appropriate HTTP methods:
  - GET for retrieving data (idempotent, cacheable)
  - POST for creating resources
  - PUT for full updates
  - PATCH for partial updates (if needed)
  - DELETE for removing resources
- [x] Return correct status codes:
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
