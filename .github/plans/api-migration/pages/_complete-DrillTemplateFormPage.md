# Migration Plan: DrillTemplateFormPage

**STATUS: COMPLETED** ✅

## Completion Status
All tasks for this migration have been completed:
- ✅ Backend API endpoints created (GET, POST, PUT)
- ✅ DTOs and handlers implemented
- ✅ Frontend migrated from static data to API integration
- ✅ All static imports removed
- ✅ OpenAPI documentation added
- ✅ Type checking passed

## File
`web/src/pages/drills/DrillTemplateFormPage.tsx`

## Priority
**Medium** — Form for creating/editing drill templates.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleDrillTemplates` | `@/data/training` | Find existing template for edit mode |
| `sampleDrills` | `@/data/training` | Available drills to include in template |
| `sampleClubs` | `@/data/clubs` | Club context for scope selection |
| `sampleAgeGroups` | `@/data/ageGroups` | Age group options for scope |
| `sampleTeams` | `@/data/teams` | Team options for scope |
| `currentUser` | `@/data/currentUser` | Current user for author/ownership |
| `getAttributeLabel` | `@/data/referenceData` | Display labels for attributes |

## Proposed API Changes

### New API Endpoints Required

1. **Get Drill Template for Edit**
   ```
   GET /api/drill-templates/{id}
   ```

2. **Create Drill Template**
   ```
   POST /api/drill-templates
   ```

3. **Update Drill Template**
   ```
   PUT /api/drill-templates/{id}
   ```

### Existing Endpoints
- `apiClient.drillTemplates.getByScope()` — list exists
- `apiClient.drills.getByScope()` — drills for inclusion exist
- Context hooks exist (club, age groups, teams)
- `getCurrentUser()` — exists

### Reference Data Note
`getAttributeLabel` → move to shared constants.

## Implementation Checklist

- [ ] Create `GET /api/drill-templates/{id}` endpoint
- [ ] Create `POST /api/drill-templates` endpoint
- [ ] Create `PUT /api/drill-templates/{id}` endpoint
- [ ] Create template CRUD DTOs
- [ ] Use existing `useDrillsByScope()` for drill selection
- [ ] Replace `currentUser` with `getCurrentUser()` API call
- [ ] Use existing context hooks for scope selection
- [ ] Move `getAttributeLabel` to shared constants
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
| `sampleDrillTemplates.find()` | `GET /api/drill-templates/{id}` | Edit mode |
| `sampleDrills` | `useDrillsByScope()` (exists) | Drill selection |
| `sampleClubs` | `useClubById()` (exists) | Scope |
| `sampleAgeGroups` | `useAgeGroupsByClubId()` (exists) | Scope |
| `sampleTeams` | `useClubTeams()` (exists) | Scope |
| `currentUser` | `getCurrentUser()` (exists) | Author |
| `getAttributeLabel` | Shared constants | UI label |
| Form submit | `POST`/`PUT /api/drill-templates` | Save |

## Dependencies

- `DrillTemplatesListPage.tsx` — partially migrated (uses `useDrillTemplatesByScope()`)
- `DrillFormPage.tsx` — similar form pattern
- Drill templates may reference multiple drills — complex nested form

## Notes
- Similar structure to `DrillFormPage.tsx` — shared migration approach
- Several existing hooks reduce new API work
- `currentUser` is the last remaining user of `currentUser.ts` data (with HomePage and ClubsListPage)
