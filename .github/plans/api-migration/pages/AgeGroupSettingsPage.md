# Migration Plan: AgeGroupSettingsPage

## File
`web/src/pages/ageGroups/AgeGroupSettingsPage.tsx`

## Priority
**Medium** — Age group settings/edit form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAgeGroupById` | `@/data/ageGroups` | Fetches age group details to pre-populate settings form |
| `teamLevels` | `@/data/referenceData` | Team level dropdown options |
| `squadSizes` | `@/data/referenceData` | Squad size dropdown options |

## Proposed API Changes

### Existing Endpoints
- `useAgeGroupById()` — already exists, returns `AgeGroupDetailDto`

### New API Endpoint Required
```
PUT /api/age-groups/{id}
```

### Reference Data Note
`teamLevels`, `squadSizes` → move to shared constants.

## Implementation Checklist

- [ ] Use existing `useAgeGroupById()` hook for pre-populating form
- [ ] Create `PUT /api/age-groups/{id}` endpoint (shared with AddEditAgeGroupPage)
- [ ] Move `teamLevels`, `squadSizes` to shared constants
- [ ] Replace data imports
- [ ] Wire form submit to PUT endpoint
- [ ] Add validation and error handling
- [ ] Test settings form


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
| `getAgeGroupById(id)` | `useAgeGroupById()` (exists) | Pre-populate form |
| `teamLevels` | Shared constants | No API call |
| `squadSizes` | Shared constants | No API call |
| Form submit | `PUT /api/age-groups/{id}` | Save changes |

## Dependencies

- `AddEditAgeGroupPage.tsx` — shares the PUT endpoint
- `AgeGroupOverviewPage.tsx` — already migrated (context)

## Notes
- Read access is already covered by existing hooks
- Only the PUT endpoint needs creation
- Reference data items are fixed option sets — stay client-side
