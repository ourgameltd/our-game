# Migration Plan: PlayerDevelopmentPlanPage

## File
`web/src/pages/players/PlayerDevelopmentPlanPage.tsx`

## Priority
**High** — Individual development plan detail view; key coaching tool.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `samplePlayers` | `@/data/players` | Used to find and display player name/details alongside development plan |
| `getDevelopmentPlansByPlayerId` | `@/data/developmentPlans` | Fetches all development plans for a player, then finds the specific one by ID |

## Proposed API Changes

### New API Endpoints Required

1. **Get Development Plan by ID**
   ```
   GET /api/development-plans/{id}
   ```
   Response: Full plan detail including player info, goals, milestones, progress, target areas.

### New Hook Required
```typescript
useDevelopmentPlan(planId: string): UseApiState<DevelopmentPlanDetailDto>
```

## Implementation Checklist

- [x] Create `GET /api/development-plans/{id}` endpoint
- [x] Create `DevelopmentPlanDetailDto` with all plan fields
- [x] Include player name/details in the response (denormalized)
- [x] Add DTO to API client
- [x] Create `useDevelopmentPlan()` hook
- [x] Replace `samplePlayers` and `getDevelopmentPlansByPlayerId` imports
- [x] Add loading/error states
- [x] Test plan detail display, progress indicators, milestone tracking


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

| Current (Static) | Target (API) | Notes |
|---|---|---|
| `getDevelopmentPlansByPlayerId(id)` then filter | `GET /api/development-plans/{planId}` | Direct lookup by plan ID |
| `samplePlayers.find(p => ...)` | Included in plan response | Player info denormalized |

## Dependencies

- `PlayerDevelopmentPlansPage.tsx` — lists all plans for a player
- `AddEditDevelopmentPlanPage.tsx` — create/edit form
- Development plans by team/age-group/club also need endpoints

## Notes
- The current approach fetches all plans then filters — the API should return a single plan by ID directly
- Include player context (name, position, team) in the response for breadcrumb/header display
- Progress tracking and milestone completion should be updateable via API

## Database / API Considerations

**SQL Requirements for `GET /api/development-plans/{id}`**:
```sql
SELECT dp.Id, dp.PlayerId, dp.Title, dp.Description, dp.StartDate, dp.EndDate, dp.Status,
       p.FirstName + ' ' + p.LastName as PlayerName,
       p.Position,
       t.Id as TeamId, t.Name as TeamName,
       ag.Id as AgeGroupId, ag.Name as AgeGroupName,
       c.Id as ClubId, c.Name as ClubName
FROM DevelopmentPlan dp
JOIN Player p ON dp.PlayerId = p.Id
JOIN PlayerTeam pt ON p.Id = pt.PlayerId
JOIN Team t ON pt.TeamId = t.Id
JOIN AgeGroup ag ON t.AgeGroupId = ag.Id
JOIN Club c ON ag.ClubId = c.Id
WHERE dp.Id = @planId

-- Get goals/milestones
SELECT dg.Id, dg.Title, dg.Description, dg.TargetDate, dg.CompletionDate, dg.Status
FROM DevelopmentGoal dg
WHERE dg.PlanId = @planId
ORDER BY dg.TargetDate

-- Get progress notes
SELECT pn.Id, pn.Date, pn.Note, pn.CoachId,
       c.FirstName + ' ' + c.LastName as CoachName
FROM ProgressNote pn
JOIN Coach c ON pn.CoachId = c.Id
WHERE pn.PlanId = @planId
ORDER BY pn.Date DESC

-- Get training objectives
SELECT to.Id, to.Objective, to.Status, to.CompletionDate
FROM TrainingObjective to
WHERE to.PlanId = @planId
```

**Migration Check**:
- Verify DevelopmentPlan table has Status, StartDate, EndDate columns
- Verify PlanStatus enum (Active, Completed, On Hold, etc.)
- Verify DevelopmentGoal table structure
- Verify ProgressNote table with CoachId foreign key
- Verify TrainingObjective table with ObjectiveStatus enum

**Navigation Store Population**:
```typescript
if (plan) {
  setEntityName('developmentPlan', planId, plan.title);
  setEntityName('player', plan.playerId, plan.playerName);
  setEntityName('team', plan.teamId, plan.teamName);
  setEntityName('ageGroup', plan.ageGroupId, plan.ageGroupName);
  setEntityName('club', plan.clubId, plan.clubName);
}
```

**No client-side reference data needed** - statuses from enums
