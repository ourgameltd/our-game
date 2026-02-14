# Migration Plan: AddEditDevelopmentPlanPage

## File
`web/src/pages/players/AddEditDevelopmentPlanPage.tsx`

## Priority
**Medium** — Form page for creating/editing player development plans.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player details for form context header |
| `getDevelopmentPlansByPlayerId` | `@data/developmentPlans` | Fetches existing plans to find the one being edited |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation |
| `getTeamById` | `@data/teams` | Resolves team name for navigation |
| `developmentPlanStatuses` | `@data/referenceData` | Dropdown options for plan status (Active, Completed, Paused, etc.) |
| `DevelopmentPlanStatus` type | `@data/referenceData` | TypeScript type for status values |

## Proposed API Changes

### New API Endpoints Required

1. **Get Development Plan for Edit**
   ```
   GET /api/development-plans/{id}
   ```

2. **Create Development Plan**
   ```
   POST /api/development-plans
   ```

3. **Update Development Plan**
   ```
   PUT /api/development-plans/{id}
   ```

4. **Player Detail** (shared)
   ```
   GET /api/players/{id}
   ```

### Reference Data Note
`developmentPlanStatuses` and `DevelopmentPlanStatus` type — these are static dropdown options and should move to a shared constants module, not an API.

## Implementation Checklist

- [ ] Create `GET /api/development-plans/{id}` endpoint (if not already done for detail page)
- [ ] Create `POST /api/development-plans` endpoint
- [ ] Create `PUT /api/development-plans/{id}` endpoint
- [ ] Create request/response DTOs
- [ ] Reuse `GET /api/players/{id}` for player context
- [ ] Move `developmentPlanStatuses` to shared constants
- [ ] Create `useDevelopmentPlan()` hook for edit mode
- [ ] Replace all data imports
- [ ] Wire form submit to POST/PUT endpoints
- [ ] Add validation error handling from API
- [ ] Add save success/error feedback
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
| `getDevelopmentPlansByPlayerId(id)` filter | `GET /api/development-plans/{planId}` | Direct plan fetch |
| `getPlayerById(id)` | `GET /api/players/{id}` | Player context |
| `getTeamById(teamId)` | Included in player detail | Denormalized |
| `getAgeGroupById(ageGroupId)` | Included in player detail | Denormalized |
| `developmentPlanStatuses` | Shared constants | No API call |
| Form submit | `POST` or `PUT /api/development-plans` | Save to API |

## Dependencies

- `PlayerDevelopmentPlansPage.tsx` — list page navigates here
- `PlayerDevelopmentPlanPage.tsx` — detail page may link to edit
- Player detail API needed first

## Notes
- Form needs both read (pre-populate) and write (save) operations
- Distinguish between create (no planId in URL) and edit (planId present) modes
- `developmentPlanStatuses` is a fixed set of options — stays client-side as constants
- Validation should happen both client-side and server-side
