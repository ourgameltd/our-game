# Migration Plan: AddEditTeamPage

## File
`web/src/pages/teams/AddEditTeamPage.tsx`

## Priority
**Medium** — Form for creating/editing teams.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAgeGroupById` | `../../data/ageGroups` | Resolves age group details for the team's parent |
| `getTeamById` | `../../data/teams` | Fetches team details for edit mode |
| `sampleClubs` | `../../data/clubs` | Club context for the team |
| `teamLevels` | `@/data/referenceData` | Dropdown options for team level |
| `TeamLevel` type | `@/data/referenceData` | TypeScript type for level values |

## Proposed API Changes

### New API Endpoints Required

1. **Create Team**
   ```
   POST /api/teams
   ```

2. **Update Team**
   ```
   PUT /api/teams/{teamId}
   ```

3. **Team Detail for Edit** (may reuse existing)
   `useTeamOverview()` already exists — verify it has editable fields.

### Reference Data Note
`teamLevels` and `TeamLevel` type → move to shared constants.

## Implementation Checklist

- [ ] Ensure team detail endpoint returns editable fields
- [ ] Create `POST /api/teams` endpoint
- [ ] Create `PUT /api/teams/{teamId}` endpoint
- [ ] Create request DTOs for create/update
- [ ] Use existing `useAgeGroupById()` hook for age group context
- [ ] Use existing `useClubById()` hook for club context
- [ ] Move `teamLevels` and `TeamLevel` to shared constants
- [ ] Replace all data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Add validation error handling
- [ ] Test create and edit flows


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
| `getTeamById(teamId)` | `useTeamOverview()` or team detail endpoint | Edit mode pre-population |
| `getAgeGroupById(ageGroupId)` | `useAgeGroupById()` (exists) | Context |
| `sampleClubs` | `useClubById()` (exists) | Club context |
| `teamLevels` | Shared constants | No API call |
| Form submit | `POST`/`PUT /api/teams` | Save team |

## Dependencies

- `TeamsListPage.tsx` — already migrated (navigates here for create/edit)
- `TeamSettingsPage.tsx` — also uses team data for editing
- Existing hooks for club and age group context are available

## Notes
- Mix of existing API hooks (club, age group) and new endpoints needed (team CRUD)
- `teamLevels` is a fixed UI option set — stays client-side
- Distinguish create mode (no teamId) from edit mode (teamId present)
