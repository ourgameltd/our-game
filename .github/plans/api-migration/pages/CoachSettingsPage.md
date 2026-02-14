# Migration Plan: CoachSettingsPage

## File
`web/src/pages/coaches/CoachSettingsPage.tsx`

## Priority
**Medium** — Coach profile settings/edit form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getCoachById` | `@data/coaches` | Fetches coach details to pre-populate form |
| `getClubById` | `@data/clubs` | Club context for role/team assignment options |
| `getTeamsByClubId` | `@data/teams` | Available teams for coach team assignment dropdown |
| `getAgeGroupById` | `@data/ageGroups` | Age group context |
| `coachRoles` | `@data/referenceData` | Coach role dropdown options |

## Proposed API Changes

### New API Endpoints Required

1. **Coach Detail** (shared with CoachProfilePage)
   ```
   GET /api/coaches/{id}
   ```

2. **Update Coach**
   ```
   PUT /api/coaches/{id}
   ```

### Existing Endpoints
- `useClubById()` — exists
- `useClubTeams()` — exists (for team assignment dropdown)
- `useAgeGroupById()` — exists

### Reference Data Note
`coachRoles` → move to shared constants.

## Implementation Checklist

- [ ] Reuse `GET /api/coaches/{id}` (shared with CoachProfilePage)
- [ ] Create `PUT /api/coaches/{id}` endpoint
- [ ] Create `CoachUpdateDto` request type
- [ ] Add to API client
- [ ] Use existing hooks for club, teams, age group context
- [ ] Move `coachRoles` to shared constants
- [ ] Replace all 5 data imports
- [ ] Wire form submit to PUT endpoint
- [ ] Add validation and error handling
- [ ] Test settings form pre-population and save


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

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getCoachById(id)` | `GET /api/coaches/{id}` | Pre-populate form |
| `getClubById(clubId)` | `useClubById()` (exists) | Club context |
| `getTeamsByClubId(clubId)` | `useClubTeams()` (exists) | Team dropdown |
| `getAgeGroupById(ageGroupId)` | `useAgeGroupById()` (exists) | Age group context |
| `coachRoles` | Shared constants | No API call |
| Form submit | `PUT /api/coaches/{id}` | Save changes |

## Dependencies

- `CoachProfilePage.tsx` — shares coach detail endpoint
- Several existing hooks reusable here

## Notes
- Mix of new (coach CRUD) and existing (club/team/age-group) API integrations
- `coachRoles` is a fixed set of role options — stays client-side
- Settings may include: name, role, certifications, team assignments, specializations
