# Migration Plan: AddEditReportCardPage

## File
`web/src/pages/players/AddEditReportCardPage.tsx`

## Priority
**Medium** — Form page for creating/editing player report cards.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player details for form context |
| `getReportsByPlayerId` | `@data/reports` | Fetches existing reports to find the one being edited |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation |
| `getTeamById` | `@data/teams` | Resolves team name for navigation |

## Proposed API Changes

### New API Endpoints Required

1. **Get Report Card for Edit**
   ```
   GET /api/reports/{id}
   ```

2. **Create Report Card**
   ```
   POST /api/reports
   ```

3. **Update Report Card**
   ```
   PUT /api/reports/{id}
   ```

4. **Player Detail** (shared)
   ```
   GET /api/players/{id}
   ```

## Implementation Checklist

- [ ] Create `GET /api/reports/{id}` endpoint (shared with detail page)
- [ ] Create `POST /api/reports` endpoint
- [ ] Create `PUT /api/reports/{id}` endpoint
- [ ] Create request/response DTOs for report card CRUD
- [ ] Reuse `GET /api/players/{id}` for player context
- [ ] Create hooks as needed
- [ ] Replace all 4 data imports
- [ ] Wire form submit to POST/PUT endpoints
- [ ] Add validation and error handling
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

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getReportsByPlayerId(id)` filter by report ID | `GET /api/reports/{reportId}` | Direct report fetch |
| `getPlayerById(id)` | `GET /api/players/{id}` | Player context |
| `getTeamById(teamId)` | Included in player detail | Denormalized |
| `getAgeGroupById(ageGroupId)` | Included in player detail | Denormalized |
| Form submit | `POST` or `PUT /api/reports` | Save to API |

## Dependencies

- `PlayerReportCardsPage.tsx` — list page navigates here
- `PlayerReportCardPage.tsx` — detail page may link to edit
- Report card DTOs (`ClubReportCardDto`) already exist — may need extension

## Notes
- Form has create and edit modes (determined by URL param)
- Report card assessments include multiple categories and ratings — complex form
- Assessment categories may overlap with player attributes from referenceData
- Consider including assessment template/schema in the API response for dynamic form generation

## Database / API Considerations

**SQL Requirements for `POST /api/reports`**:
```sql
BEGIN TRANSACTION

-- Insert report card
INSERT INTO PlayerReport (Id, PlayerId, ReportDate, CoachId, OverallRating, Summary)
VALUES (@id, @playerId, @reportDate, @coachId, @overallRating, @summary)

-- Insert attribute evaluations
INSERT INTO AttributeEvaluation (ReportId, AttributeName, Rating, Comments)
SELECT @reportId, AttributeName, Rating, Comments
FROM @evaluationsTable

-- Insert development actions
INSERT INTO ReportDevelopmentAction (ReportId, ActionDescription, Priority, Status)
SELECT @reportId, ActionDescription, Priority, Status
FROM @actionsTable

COMMIT TRANSACTION
```

**Migration Check**:
- Verify PlayerReport table structure
- Verify AttributeEvaluation table for storing ratings per attribute
- Verify ReportDevelopmentAction table
- Check if attributes are enum/lookup table or free text
- Verify if similar to EvaluationAttribute table (model exists)

**Reference Data Strategy**:
- Player attributes (35 EA FC attributes) used for assessment categories
- Could be sourced from PlayerAttribute table or kept as client-side template
- Consider assessment template endpoint: `GET /api/report-templates` for dynamic forms

**Navigation Store Population**:
```typescript
if (report) {
  setEntityName('report', reportId, `Report - ${report.reportDate}`);
  setEntityName('player', report.playerId, report.playerName);
}
```
