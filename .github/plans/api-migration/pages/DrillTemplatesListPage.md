# Migration Plan: DrillTemplatesListPage

## File
`web/src/pages/drills/DrillTemplatesListPage.tsx`

## Priority
**Low** — Partially migrated; only remaining static import is reference data.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAttributeLabel` | `@/data/referenceData` | Display labels for attributes linked to drill templates |
| `getAttributeCategory` | `@/data/referenceData` | Categorizes attributes for display |
| `drillCategories` | `@/data/referenceData` | Category filter options |
| `getDrillCategoryColors` | `@/data/referenceData` | Color mapping for category badges |

## Already Using API

| Hook/Call | Usage |
|---|---|
| `useDrillTemplatesByScope()` | Fetches drill templates from API |
| `useClubById()` | Club context |

## Proposed API Changes

### No new API endpoint needed
The page already uses API for drill template data. Only reference data remains.

### Recommended Action
Move all 4 reference data items to shared constants module.

## Implementation Checklist

- [ ] Move reference data items to shared constants (coordinated with DrillsListPage)
- [ ] Update import paths
- [ ] Verify template list renders correctly
- [ ] Done — page is fully migrated after this


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

| Current (Static) | Target | Notes |
|---|---|---|
| `getAttributeLabel` | Shared constants | UI label utility |
| `getAttributeCategory` | Shared constants | Attribute categorization |
| `drillCategories` | Shared constants | Category filter |
| `getDrillCategoryColors` | Shared constants | UI color mapping |

## Dependencies

- `DrillsListPage.tsx` — uses exact same reference data items (batch migrate together)

## Notes
- Identical migration as `DrillsListPage.tsx` — exact same 4 reference data items
- Should be done in the same PR as DrillsListPage migration
