> **Status: COMPLETED on 2026-02-14**

# Migration Plan: CoachProfilePage

## File
`web/src/pages/coaches/CoachProfilePage.tsx`

## Priority
**High** — Primary coach detail page.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getCoachById` | `@data/coaches` | Fetches full coach profile (name, role, certifications, specializations, photo) |
| `getTeamsByIds` | `@data/teams` | Resolves team names for coaches' team assignments |
| `getAgeGroupById` | `@data/ageGroups` | Resolves age group name for navigation |
| `getClubById` | `@data/clubs` | Resolves club name for navigation |
| `coachRoleDisplay` | `@/data/referenceData` | Display labels for coach roles |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/v1/coaches/{coachId}
```

Response: Full coach profile with resolved team/club/age-group names:
```json
{
  "coachId": "...",
  "name": "Mike Smith",
  "role": "Head Coach",
  "photo": "...",
  "specializations": [...],
  "teams": [
    { "teamId": "...", "teamName": "Blues", "ageGroupName": "2015" }
  ],
  "clubName": "Vale FC",
  "clubId": "..."
}
```

### Reference Data Note
`coachRoleDisplay` → move to shared constants (or optionally resolve server-side).

### New Hook Required
```typescript
useCoach(coachId: string): UseApiState<CoachDetailDto>
```

## Implementation Checklist

- [x] Create `GET /api/v1/coaches/{coachId}` endpoint
- [x] Create `CoachDetailDto` with resolved names
- [x] Add DTO to API client
- [x] Create `useCoach()` hook
- [x] Move `coachRoleDisplay` to shared constants
- [x] Replace all 5 data imports
- [x] Add loading/error states (skeleton placeholders for all sections)
- [x] Test profile display, team assignments, error/404 handling


## Backend Implementation Standards

### API Function Structure
- [x] Create Azure Function in `api/OurGame.Api/Functions/Coaches/GetCoachByIdFunction.cs`
- [x] Annotate with OpenAPI attributes for Swagger documentation:
  - `[OpenApiOperation]` with operationId, summary, description
  - `[OpenApiParameter]` for route/query parameters
  - `[OpenApiResponseWithBody]` for success responses (200, 201)
  - `[OpenApiResponseWithoutBody]` for 404, 400 responses
- [x] Apply `[Function("FunctionName")]` attribute
- [x] Keep function lean - inject `IMediator` and send command/query

### Handler Implementation  
- [x] Create handler in `api/OurGame.Application/Coaches/GetCoachById/GetCoachByIdHandler.cs`
- [x] Implement `IRequestHandler<TRequest, TResponse>` from MediatR
- [x] Include all query models and DB query classes in same file as handler
- [x] Execute SQL by sending command strings to DbContext, map results to DTOs
- [x] Use parameterized queries (`@parametername`) to prevent SQL injection

### DTOs Organization
- [x] Create DTOs in `api/OurGame.Application/Coaches/GetCoachById/DTOs/`
- [x] All DTOs for an action in single folder
- [x] Use records for immutable DTOs
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
| `getCoachById(id)` | `GET /api/coaches/{id}` | Full profile |
| `getTeamsByIds(teamIds)` | Included in coach response | Team names resolved |
| `getAgeGroupById(ageGroupId)` | Included in coach response | Age group context |
| `getClubById(clubId)` | Included in coach response | Club context |
| `coachRoleDisplay` | Shared constants | UI label mapping |

## Dependencies

- `CoachSettingsPage.tsx` — shares coach detail endpoint
- `TeamCoachesPage.tsx`, `ClubCoachesPage.tsx`, `AgeGroupCoachesPage.tsx` — coach lists

## Notes
- Five data imports replaced with single API call returning comprehensive response with resolved names
- Certifications not implemented in this iteration (no certifications table in current schema)
- Team role uses the coach's global role from the Coach table (`TeamCoach` table has no role column)
- Loading states use skeleton placeholders for all sections
- Proper 404 and error state displays implemented

## Database / API Considerations

**SQL Requirements for `GET /api/coaches/{id}`**:
```sql
SELECT c.Id as CoachId,
       c.FirstName + ' ' + c.LastName as Name,
       c.Email,
       c.PhotoUrl,
       c.PhoneNumber,
       c.Qualifications,
       c.Specializations,
       c.YearsExperience,
       cl.Id as ClubId,
       cl.Name as ClubName
FROM Coach c
LEFT JOIN TeamCoach tc ON c.Id = tc.CoachId
LEFT JOIN Team t ON tc.TeamId = t.Id
LEFT JOIN AgeGroup ag ON t.AgeGroupId = ag.Id
LEFT JOIN Club cl ON ag.ClubId = cl.Id
WHERE c.Id = @coachId
GROUP BY c.Id, cl.Id

-- Get team assignments
SELECT t.Id as TeamId,
       t.Name as TeamName,
       tc.Role,
       ag.Name as AgeGroupName
FROM TeamCoach tc
JOIN Team t ON tc.TeamId = t.Id
JOIN AgeGroup ag ON t.AgeGroupId = ag.Id
WHERE tc.CoachId = @coachId

-- Get age group coordinator roles (if applicable)
SELECT agc.AgeGroupId,
       ag.Name as AgeGroupName
FROM AgeGroupCoordinator agc
JOIN AgeGroup ag ON agc.AgeGroupId = ag.Id
WHERE agc.CoachId = @coachId
```

**Migration Check**:
- Verify Coach table has: FirstName, LastName, Email, PhotoUrl, PhoneNumber
- Check Qualifications column type (JSON array or separate table?)
- Check Specializations column type (JSON array or separate table?)
- Verify TeamCoach join table with Role column (CoachRole enum)
- Verify AgeGroupCoordinator table exists (for coordinator assignments)

**Certifications/Qualifications Schema**:
```json
[
  {
    "name": "UEFA B License",
    "issuer": "UEFA",
    "dateObtained": "2020-06-15",
    "expiryDate": "2025-06-15"
  }
]
```

**Navigation Store Population**:
```typescript
if (coach) {
  setEntityName('coach', coachId, coach.name);
  setEntityName('club', coach.clubId, coach.clubName);
  // Teams set when viewing team-specific coach info
}
```

**Reference Data**:
- `coachRoleDisplay` — client-side mapping for CoachRole enum
- OR include `roleDisplay` in API response for each team assignment
