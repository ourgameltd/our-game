# Migration Plan: AddEditAgeGroupPage

## Status
✅ **COMPLETE** — Migrated on February 14, 2026

Both GET and POST/PUT operations fully implemented with validation, error handling, and form submission.

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
   POST /api/v1/clubs/{clubId}/age-groups
   ```

2. **Update Age Group**
   ```
   PUT /api/v1/age-groups/{ageGroupId}
   ```

### Existing Endpoints
- `apiClient.ageGroups.getById()` — exists for edit mode
- `apiClient.clubs.getClubById()` — exists for club context

### Reference Data Note
`teamLevels`, `squadSizes`, `AgeGroupLevel` → Keep in `referenceData.ts` (no move needed).

## Implementation Checklist

- [x] Use `apiClient.ageGroups.getById()` directly for edit mode pre-population
- [x] Use `apiClient.clubs.getClubById()` directly for club context
- [x] Create `POST /api/v1/clubs/{clubId}/age-groups` endpoint
- [x] Create `PUT /api/v1/age-groups/{id}` endpoint
- [x] Create request DTOs for create/update
- [x] Keep `teamLevels`, `squadSizes`, `AgeGroupLevel` in referenceData.ts (no move needed)
- [x] Replace all data imports
- [x] Wire form to POST/PUT endpoints
- [x] Test create and edit flows


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

## Implementation Summary

### Backend Components Created

**Commands & Handlers:**
- `api/OurGame.Application/UseCases/AgeGroups/Commands/CreateAgeGroup/CreateAgeGroupCommand.cs`
- `api/OurGame.Application/UseCases/AgeGroups/Commands/UpdateAgeGroup/UpdateAgeGroupCommand.cs`

**DTOs:**
- `api/OurGame.Application/UseCases/AgeGroups/Commands/CreateAgeGroup/DTOs/CreateAgeGroupDto.cs`
- `api/OurGame.Application/UseCases/AgeGroups/Commands/UpdateAgeGroup/DTOs/UpdateAgeGroupDto.cs`

**Azure Functions:**
- Added `CreateAgeGroup` and `UpdateAgeGroup` methods to `api/OurGame.Api/Functions/AgeGroupFunctions.cs`

### Frontend Components Updated

**API Client:**
- Extended `web/src/api/client.ts` with `create()` and `update()` methods
- Added validation error support to `ApiResponse` type

**Page:**
- Updated `web/src/pages/ageGroups/AddEditAgeGroupPage.tsx` with:
  - API data fetching for club and age group (replacing static imports)
  - Skeleton loading states
  - Error handling UI
  - Form submission with loading states
  - Validation error mapping
  - Navigation on success

### Key Features
- ✅ Validates level enum (youth/amateur/reserve/senior)
- ✅ Validates squad size (4/5/7/9/11)
- ✅ Checks club existence
- ✅ Prevents editing archived age groups
- ✅ Parameterized SQL queries (injection-safe)
- ✅ Field-level validation errors
- ✅ OpenAPI documentation
- ✅ Authentication required

### API Endpoints
- `POST /api/v1/clubs/{clubId}/age-groups` → 201 Created
- `PUT /api/v1/age-groups/{ageGroupId}` → 200 OK

## Data Mapping

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `getAgeGroupById(id)` | `apiClient.ageGroups.getById()` | Edit mode |
| `sampleClubs` | `apiClient.clubs.getClubById()` | Club context |
| `teamLevels`, `squadSizes` | Kept in referenceData.ts | No API call |
| Form submit | `POST`/`PUT /api/v1/age-groups` | Save |

## Dependencies

- `AgeGroupOverviewPage.tsx` — already migrated (pattern to follow)
- `AgeGroupSettingsPage.tsx` — similar settings form
- Existing age group hooks available

## Notes
- ✅ GET operations replaced static data with `apiClient` calls
- ✅ POST/PUT operations implemented with full validation
- ✅ Reference data (`teamLevels`, `squadSizes`) kept in `referenceData.ts` as UI constants
- ✅ Follows same patterns as other migrated pages (AgeGroupOverviewPage, ClubOverviewPage)
- ✅ First write endpoints (POST/PUT) in the codebase
