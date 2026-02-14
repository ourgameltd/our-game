# Migration Plan: TeamCoachesPage

## File
`web/src/pages/teams/TeamCoachesPage.tsx`

## Priority
**High** — Team coaching staff page.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getTeamById` | `@data/teams` | Fetches team details for page context |
| `getCoachesByTeamId` | `@data/coaches` | Fetches coaches assigned to the team |
| `getCoachesByClubId` | `@data/coaches` | Fetches all club coaches (for "available coaches" display or comparison) |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/teams/{teamId}/coaches
```

Response:
```json
[
  {
    "coachId": "...",
    "name": "Mike Smith",
    "role": "Head Coach",
    "certifications": [...],
    "photo": "..."
  }
]
```

### Existing Endpoints
- `apiClient.clubs.getCoaches(clubId)` — already exists for club-level coaches
- `apiClient.ageGroups.getCoachesByAgeGroupId()` — already exists

### New Hook Required
```typescript
useTeamCoaches(teamId: string): UseApiState<CoachSummaryDto[]>
```

## Implementation Checklist

- [ ] Create `GET /api/teams/{teamId}/coaches` endpoint
- [ ] Create `CoachSummaryDto` for list display
- [ ] Add DTO to API client
- [ ] Create `useTeamCoaches()` hook
- [ ] Replace all 3 data imports
- [ ] Add loading/empty states
- [ ] Test coach list display, role badges, certifications


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
| `getTeamById(teamId)` | Via existing team detail hooks or include in coach response | Team context |
| `getCoachesByTeamId(teamId)` | `GET /api/teams/{teamId}/coaches` | Team coaches |
| `getCoachesByClubId(clubId)` | `apiClient.clubs.getCoaches()` (exists) | All club coaches |

## Dependencies

- `AgeGroupCoachesPage.tsx` — already migrated (pattern to follow)
- `ClubCoachesPage.tsx` — partially migrated (uses API + referenceData)
- `CoachProfilePage.tsx` — coach detail page

## Notes
- Follow the pattern established by `AgeGroupCoachesPage.tsx` which is already using `apiClient.ageGroups.getCoachesByAgeGroupId()`
- `coachRoleDisplay` may still be needed for role labels — that stays as a shared constant

## Database / API Considerations

**SQL Requirements for `GET /api/teams/{teamId}/coaches`**:
```sql
SELECT c.Id as CoachId,
       c.FirstName + ' ' + c.LastName as Name,
       c.Email,
       c.PhotoUrl,
       tc.Role,
       c.Qualifications
FROM TeamCoach tc
JOIN Coach c ON tc.CoachId = c.Id
WHERE tc.TeamId = @teamId
ORDER BY tc.Role, c.LastName
```

**Additional Endpoints for Management**:
- `POST /api/teams/{teamId}/coaches` — Assign coach to team with role
- `DELETE /api/teams/{teamId}/coaches/{coachId}` — Remove coach from team
- `PUT /api/teams/{teamId}/coaches/{coachId}/role` — Update coach role

**Migration Check**:
- Verify TeamCoach join table with TeamId, CoachId, Role columns
- Verify CoachRole enum used (HeadCoach, Assistant, GoalkeeperCoach, etc.)
- Verify Coach table has Qualifications column (JSON or separate table?)

**Navigation Store**:
- Team name already set by parent team pages

**Reference Data**:
- `coachRoleDisplay` → client-side mapping for CoachRole enum
