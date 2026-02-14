# Migration Plan: ClubPlayerSettingsPage

> **Status: ✅ COMPLETED** — Migration finished 2026-02-14

## File
`web/src/pages/clubs/ClubPlayerSettingsPage.tsx`

## Priority
**Medium** — Player settings within club context.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@/data/players` | Fetches player details for settings form |
| `getTeamsByClubId` | `@/data/teams` | Fetches club teams for team assignment dropdown |
| `getClubById` | `@/data/clubs` | Club context for the page |
| `getAgeGroupById` | `@/data/ageGroups` | Age group context |

## Proposed API Changes

### New API Endpoints Required

1. **Player Detail** (shared)
   ```
   GET /api/v1/players/{id}
   ```

2. **Update Player** (shared)
   ```
   PUT /api/v1/players/{id}
   ```

### Existing Endpoints
- `useClubById()` — exists
- `useClubTeams()` — exists (for team dropdown)

## Implementation Checklist

- [x] Reuse `GET /api/v1/players/{id}` (shared with player pages) — extended with settings fields
- [x] Reuse `PUT /api/v1/players/{id}` for saving changes — full CRUD implemented
- [x] Use existing `useClubById()` for club context
- [x] Use existing `useClubTeams()` for team assignment dropdown
- [x] Use existing `useAgeGroupById()` for age group context
- [x] Replace all 4 data imports
- [x] Wire form submit to PUT endpoint
- [x] Test settings form and save functionality


## Backend Implementation Standards

### API Function Structure
- [x] Create Azure Function in `api/OurGame.Api/Functions/[Area]/[ActionName]Function.cs`
- [x] Annotate with OpenAPI attributes for Swagger documentation:
  - `[OpenApiOperation]` with operationId, summary, description
  - `[OpenApiParameter]` for route/query parameters
  - `[OpenApiResponseWithBody]` for success responses (200, 201)
  - `[OpenApiResponseWithoutBody]` for 404, 400 responses
- [x] Apply `[Function("FunctionName")]` attribute
- [x] Keep function lean - inject `IMediator` and send command/query

### Handler Implementation  
- [x] Create handler in `api/OurGame.Application/[Area]/[ActionName]/[ActionName]Handler.cs`
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
| `getPlayerById(id)` | `GET /api/v1/players/{id}` | Player detail |
| `getTeamsByClubId(clubId)` | `useClubTeams()` (exists) | Team dropdown |
| `getClubById(clubId)` | `useClubById()` (exists) | Club context |
| `getAgeGroupById(ageGroupId)` | `useAgeGroupById()` (exists) | Age group context |

## Dependencies

- `PlayerSettingsPage.tsx` — player-context settings page
- Many existing hooks are reusable here

## Notes
- Several existing hooks already cover the needed data
- Main new requirement is the player detail and update endpoints
- This page is a club-context wrapper around player settings

---

## Completion Notes

**Completed:** 2026-02-14

### Summary of Implementation
- **GET /api/v1/players/{id}** extended to include player settings fields (preferred positions, team assignments, archived status)
- **PUT /api/v1/players/{id}** implemented with full CRUD support for updating player settings
- All 4 static data imports (`getPlayerById`, `getTeamsByClubId`, `getClubById`, `getAgeGroupById`) replaced with API hooks
- Frontend form wired to PUT endpoint with proper save flow

### Frontend Details
- Static data imports fully removed
- API hooks used: `usePlayer`, `useClubById`, `useClubTeams`, `useUpdatePlayer`
- Form initialized from API response data
- Save flow wired to PUT endpoint via `useUpdatePlayer` mutation
- Error handling implemented with banner display for API failures
- Loading states implemented with skeleton placeholders
- Validation errors surfaced and displayed inline

### Edge Cases Handled
- **Player not found (404)**: Handled with appropriate error display
- **Invalid player ID**: Validated and handled gracefully
- **Archived players**: Form fields disabled when player is archived
- **Team assignments**: Grouped by age group in the assignment dropdown
- **Preferred positions**: Full array support for multiple position selections

### Notable Decisions
- Reused shared `GET /api/v1/players/{id}` endpoint rather than creating a settings-specific endpoint, keeping the API surface minimal
- GET response is backward-compatible — settings fields are additive
- Used parameterized SQL queries in handlers following established codebase patterns
- Skeleton loading states match the form layout for a smooth loading experience
