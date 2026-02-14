# Migration Plan: AddEditTrainingSessionPage

## File
`web/src/pages/teams/AddEditTrainingSessionPage.tsx`

## Priority
**High** — Complex form with 8 data imports for creating/editing training sessions.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleTrainingSessions` | `@/data/training` | Find existing session for edit mode |
| `sampleDrills` | `@/data/training` | Available drills to add to session |
| `sampleDrillTemplates` | `@/data/training` | Drill templates for quick-add |
| `sampleTeams` | `@/data/teams` | Team context |
| `sampleClubs` | `@/data/clubs` | Club context |
| `samplePlayers` | `@/data/players` | Player attendance tracking |
| `getAgeGroupById` | `@/data/ageGroups` | Age group context |
| `sampleCoaches` | `@/data/coaches` | Coach assignment for session |
| `getCoachesByTeam` | `@/data/coaches` | Filter coaches by team |
| `getCoachesByAgeGroup` | `@/data/coaches` | Filter coaches by age group |
| `coachRoleDisplay` | `@/data/referenceData` | Coach role labels |
| `sessionDurations` | `@/data/referenceData` | Duration dropdown options |
| `drillCategories` | `@/data/referenceData` | Drill category labels |
| `getDrillCategoryColors` | `@/data/referenceData` | Category color mapping |

## Proposed API Changes

### New API Endpoints Required

1. **Get Training Session for Edit**
   ```
   GET /api/training-sessions/{id}
   ```

2. **Create Training Session**
   ```
   POST /api/training-sessions
   ```

3. **Update Training Session**
   ```
   PUT /api/training-sessions/{id}
   ```

4. **Team Players** (shared)
   ```
   GET /api/teams/{teamId}/players
   ```

5. **Team Coaches** (shared)
   ```
   GET /api/teams/{teamId}/coaches
   ```

### Existing Endpoints
- `apiClient.drills.getByScope()` — available drills (exists)
- `apiClient.drillTemplates.getByScope()` — drill templates (exists)
- Club/team/age group context hooks exist

### Reference Data Note
`coachRoleDisplay`, `sessionDurations`, `drillCategories`, `getDrillCategoryColors` → move to shared constants.

## Implementation Checklist

- [ ] Create `GET /api/training-sessions/{id}` endpoint
- [ ] Create `POST /api/training-sessions` endpoint
- [ ] Create `PUT /api/training-sessions/{id}` endpoint
- [ ] Create training session DTOs (detail, create, update)
- [ ] Use existing `useDrillsByScope()` for drill selection
- [ ] Use existing `useDrillTemplatesByScope()` for template selection
- [ ] Create `useTeamPlayers()` and `useTeamCoaches()` hooks (shared)
- [ ] Move reference data items to shared constants
- [ ] Replace all data imports
- [ ] Wire form to POST/PUT endpoints
- [ ] Add validation and error handling
- [ ] Test session creation with drills, attendance, coach assignment


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
| `sampleTrainingSessions.find()` | `GET /api/training-sessions/{id}` | Edit mode |
| `sampleDrills` | `useDrillsByScope()` (exists) | Drill selection |
| `sampleDrillTemplates` | `useDrillTemplatesByScope()` (exists) | Template selection |
| `samplePlayers` | `GET /api/teams/{teamId}/players` | Attendance |
| `sampleCoaches`/`getCoachesByTeam` | `GET /api/teams/{teamId}/coaches` | Staff assignment |
| Reference data items | Shared constants | UI labels |
| Form submit | `POST`/`PUT /api/training-sessions` | Save session |

## Dependencies

- `TrainingSessionsListPage.tsx` — navigates here
- `ClubTrainingSessionsPage.tsx` — already migrated (pattern to follow)
- Drills and drill templates APIs already exist

## Notes
- Second most complex form after `AddEditMatchPage` (8 data file imports)
- Several needed APIs already exist (drills, drill templates, club context)
- Training session creation involves nested data (drills with order, player attendance)
- Reference data items should all become shared constants

## Database / API Considerations

**SQL Requirements for `POST /api/training-sessions`**:
```sql
BEGIN TRANSACTION

-- Insert session
INSERT INTO TrainingSession (Id, TeamId, Date, Location, Duration, Focus, Status)
VALUES (@id, @teamId, @date, @location, @duration, @focus, @status)

-- Insert drills in session
INSERT INTO SessionDrill (SessionId, DrillId, OrderIndex, Duration)
SELECT @sessionId, DrillId, OrderIndex, Duration
FROM @drillsTable

-- Insert coaches
INSERT INTO SessionCoach (SessionId, CoachId)
SELECT @sessionId, CoachId
FROM @coachesTable

-- Insert attendance
INSERT INTO SessionAttendance (SessionId, PlayerId, Status, Notes)
SELECT @sessionId, PlayerId, AttendanceStatus, Notes
FROM @attendanceTable

COMMIT TRANSACTION
```

**Migration Check**:
- Verify TrainingSession table has Duration, Focus, Status columns
- Verify SessionStatus enum (Scheduled, Completed, Cancelled)
- Verify SessionDrill has OrderIndex for drill sequence
- Verify SessionAttendance with attendance status (Present, Absent, Injured, etc.)
- Check if attendance status is enum or VARCHAR

**Reference Data Strategy**:
- `sessionDurations` → keep **client-side constant** (UI helpers: 60, 90, 120 minutes)
- `drillCategories` → use DrillCategory enum from database (already exists)
- `getDrillCategoryColors` → client-side mapping for UI styling
- `coachRoleDisplay` → client-side constant

**Navigation Store Population**:
```typescript
if (session) {
  setEntityName('session', sessionId, session.focus || 'Training Session');
  setEntityName('team', session.teamId, session.teamName);
}
```
