# Migration Plan: AddEditAgeGroupPage

## File
`web/src/pages/ageGroups/AddEditAgeGroupPage.tsx`

## Priority
**Medium** — Form for creating/editing age groups.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAgeGroupById` | `../../data/ageGroups` | Fetches age group details for edit mode |
| `sampleClubs` | `../../data/clubs` | Club context for the age group |
| `teamLevels` | `@/data/referenceData` | Team level dropdown options |
| `squadSizes` | `@/data/referenceData` | Squad size dropdown options |
| `AgeGroupLevel` type | `@/data/referenceData` | TypeScript type for level values |

## Proposed API Changes

### New API Endpoints Required

1. **Create Age Group**
   ```
   POST /api/age-groups
   ```

2. **Update Age Group**
   ```
   PUT /api/age-groups/{id}
   ```

### Existing Endpoints
- `apiClient.ageGroups.getById()` / `useAgeGroupById()` — exists for edit mode
- `useClubById()` — exists for club context

### Reference Data Note
`teamLevels`, `squadSizes`, `AgeGroupLevel` → move to shared constants.

## Implementation Checklist

- [ ] Use existing `useAgeGroupById()` hook for edit mode pre-population
- [ ] Use existing `useClubById()` for club context
- [ ] Create `POST /api/age-groups` endpoint
- [ ] Create `PUT /api/age-groups/{id}` endpoint
- [ ] Create request DTOs for create/update
- [ ] Move `teamLevels`, `squadSizes`, `AgeGroupLevel` to shared constants
- [ ] Replace all data imports
- [ ] Wire form to POST/PUT endpoints
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
| `getAgeGroupById(id)` | `useAgeGroupById()` (exists) | Edit mode |
| `sampleClubs` | `useClubById()` (exists) | Club context |
| `teamLevels`, `squadSizes` | Shared constants | No API call |
| Form submit | `POST`/`PUT /api/age-groups` | Save |

## Dependencies

- `AgeGroupOverviewPage.tsx` — already migrated (pattern to follow)
- `AgeGroupSettingsPage.tsx` — similar settings form
- Existing age group hooks available

## Notes
- Most data access is already covered by existing API hooks
- Only new endpoints needed are the CRUD operations (POST/PUT)
- Reference data items are UI dropdown options — stay client-side
