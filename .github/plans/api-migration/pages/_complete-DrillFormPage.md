# ✅ COMPLETED - February 15, 2026

## Implementation Summary

This migration has been successfully completed. All static data imports have been replaced with API calls, and the DrillFormPage now uses real backend endpoints.

### Backend Implementation
- ✅ GET /api/v1/drills/{id} - Fetch drill detail for editing
- ✅ POST /api/v1/drills - Create new drill with transaction support
- ✅ PUT /api/v1/drills/{id} - Update drill with authorization (createdBy coach only)
- ✅ Comprehensive MediatR handlers with raw SQL queries
- ✅ Full OpenAPI documentation for Swagger

### Frontend Implementation
- ✅ API client extended with drill CRUD operations
- ✅ React hooks: useDrill, useCreateDrill, useUpdateDrill
- ✅ DrillFormPage migrated from static data to API calls
- ✅ Loading states with skeleton placeholders (not full-page loaders)
- ✅ Error handling with inline banners and validation mapping
- ✅ Inherited drill detection and read-only mode
- ✅ Reference data (playerAttributes, linkTypes) moved to shared constants

### Key Features
- Full transaction support for multi-table inserts
- Authorization enforcement (only creating coach can edit)
- TypeScript types aligned with C# DTOs
- Consistent error handling and validation
- No compilation errors

---

# Migration Plan: DrillFormPage

## File
`web/src/pages/drills/DrillFormPage.tsx`

## Priority
**Medium** — Form for creating/editing drills.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleDrills` | `@/data/training` | Find existing drill for edit mode |
| `sampleClubs` | `@/data/clubs` | Club context for scope selection |
| `sampleAgeGroups` | `@/data/ageGroups` | Age group options for scope selection |
| `sampleTeams` | `@/data/teams` | Team options for scope selection |
| `currentUser` | `@/data/currentUser` | Current user for author/ownership |
| `getAttributeCategory` | `@/data/referenceData` | Categorizes player attributes for drill focus areas |
| `playerAttributes` | `@/data/referenceData` | Full list of player attributes for focus area selection |
| `linkTypes` | `@/data/referenceData` | External link type options (video, article, etc.) |

## Proposed API Changes

### New API Endpoints Required

1. **Get Drill for Edit**
   ```
   GET /api/drills/{id}
   ```

2. **Create Drill**
   ```
   POST /api/drills
   ```

3. **Update Drill**
   ```
   PUT /api/drills/{id}
   ```

### Existing Endpoints
- `apiClient.drills.getByScope()` — drill list exists
- `useClubById()`, `useAgeGroupsByClubId()`, `useClubTeams()` — context hooks exist
- `getCurrentUser()` — exists in API

### Reference Data Note
`getAttributeCategory`, `playerAttributes`, `linkTypes` → move to shared constants.

## Implementation Checklist

- [x] Create `GET /api/drills/{id}` endpoint for edit mode
- [x] Create `POST /api/drills` endpoint
- [x] Create `PUT /api/drills/{id}` endpoint
- [x] Create drill CRUD DTOs
- [x] Replace `currentUser` with `getCurrentUser()` API call
- [x] Use existing hooks for club/team/age-group scope selection
- [x] Move reference data items to shared constants
- [x] Replace all data imports
- [x] Wire form to POST/PUT endpoints
- [x] Add validation and error handling
- [x] Test create and edit flows with scope selection


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

| Current (Static) | Target (API/Constants) | Notes |
|---|---|---|
| `sampleDrills.find()` | `GET /api/drills/{id}` | Edit mode |
| `sampleClubs` | `useClubById()` (exists) | Scope selection |
| `sampleAgeGroups` | `useAgeGroupsByClubId()` (exists) | Scope selection |
| `sampleTeams` | `useClubTeams()` (exists) | Scope selection |
| `currentUser` | `getCurrentUser()` (exists) | Author |
| `playerAttributes`, `getAttributeCategory`, `linkTypes` | Shared constants | UI reference |
| Form submit | `POST`/`PUT /api/drills` | Save drill |

## Dependencies

- `DrillsListPage.tsx` — partially migrated (uses `useDrillsByScope()`)
- `DrillTemplateFormPage.tsx` — similar form pattern
- `AddEditTrainingSessionPage.tsx` — uses drills for session building

## Notes
- Six data file imports but several are covered by existing API hooks
- `playerAttributes` is a large reference data set (35 attributes) — should remain client-side
- Scope selection (club/age-group/team) determines where the drill is available
- Drills API already exists for listing — CRUD endpoints are the new addition

## Database / API Considerations

**SQL Requirements for `POST /api/drills`**:
```sql
BEGIN TRANSACTION

-- Insert drill
INSERT INTO Drill (Id, Name, Description, Duration, Category, 
                   Complexity, MinPlayers, MaxPlayers, CreatedBy, ScopeType)
VALUES (@id, @name, @description, @duration, @category,
        @complexity, @minPlayers, @maxPlayers, @userId, @scopeType)

-- Insert scope links based on ScopeType
IF @scopeType = 'Club'
  INSERT INTO DrillClub (DrillId, ClubId) VALUES (@drillId, @clubId)
ELSE IF @scopeType = 'AgeGroup'
  INSERT INTO DrillAgeGroup (DrillId, AgeGroupId) VALUES (@drillId, @ageGroupId)
ELSE IF @scopeType = 'Team'
  INSERT INTO DrillTeam (DrillId, TeamId) VALUES (@drillId, @teamId)
ELSE IF @scopeType = 'User'
  INSERT INTO DrillUser (DrillId, UserId) VALUES (@drillId, @userId)

-- Insert external links
INSERT INTO DrillLink (DrillId, Url, LinkType, Title)
SELECT @drillId, Url, LinkType, Title
FROM @linksTable

COMMIT TRANSACTION
```

**Migration Check**:
- Verify Drill table has all fields (Category, Complexity, MinPlayers, MaxPlayers)
- Verify DrillCategory enum used (not VARCHAR)
- Verify scope junction tables exist: DrillClub, DrillAgeGroup, DrillTeam, DrillUser
- Verify ScopeType enum (Global, Club, AgeGroup, Team, User)
- Verify DrillLink table with LinkType enum
- Verify DrillSource enum (if tracking drill origin)

**Reference Data Strategy**:
- `playerAttributes` (35 EA FC attributes) → keep **client-side constant** for focus area selection
- `getAttributeCategory` → client-side helper function
- `linkTypes` → use LinkType enum from database (already exists) OR client-side if just UI labels
- DrillCategory enum from database

**Navigation Store Population**:
```typescript
if (drill) {
  setEntityName('drill', drillId, drill.name);
}
```
