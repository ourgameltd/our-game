# Migration Plan: DrillsListPage

**STATUS: COMPLETED ✅** — February 15, 2026

## File
`web/src/pages/drills/DrillsListPage.tsx`

## Priority
**Low** — Partially migrated; only remaining static import is reference data.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getAttributeLabel` | `@/data/referenceData` | Display label for player attributes linked to drills |
| `getAttributeCategory` | `@/data/referenceData` | Categorizes attributes for visual grouping |
| `drillCategories` | `@/data/referenceData` | Drill category options for filtering |
| `getDrillCategoryColors` | `@/data/referenceData` | Color mapping for category badges |

## Already Using API

| Hook/Call | Usage |
|---|---|
| `useDrillsByScope()` | Fetches drills from API by scope |
| `useClubById()` | Club context |

## Proposed API Changes

### No new API endpoint needed
The page already uses API for drill data. Only reference data items remain.

### Recommended Action
Move all 4 reference data items to shared constants module.

## Implementation Checklist

- [x] Move `getAttributeLabel`, `getAttributeCategory`, `drillCategories`, `getDrillCategoryColors` to shared constants
- [x] Update import paths
- [x] Verify drill list renders correctly with all category badges and attribute labels
- [x] Done — page is fully migrated after this


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

| Current (Static) | Target | Notes |
|---|---|---|
| `getAttributeLabel` | Shared constants | UI label utility |
| `getAttributeCategory` | Shared constants | Attribute categorization |
| `drillCategories` | Shared constants | Category filter options |
| `getDrillCategoryColors` | Shared constants | UI color mapping |

## Dependencies

- `DrillTemplatesListPage.tsx` — uses same reference data items
- `DrillFormPage.tsx` — uses some of these items
- `AddEditTrainingSessionPage.tsx` — uses `drillCategories` and colors

## Notes
- This is a simple import path migration — no logic changes needed
- All four items are UI label/color utilities, not dynamic data
- Should be batch-migrated with other referenceData consumers
