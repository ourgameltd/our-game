# Migration Plan: ClubsListPage

## Status: ✅ COMPLETED

**Completion Date**: February 14, 2026

All tasks completed:
- ✅ Created backend endpoint: `GET /api/v1/users/me/clubs`
- ✅ Created MediatR handler with SQL query for club access (coach/player/parent paths)
- ✅ Created DTO: MyClubListItemDto
- ✅ Added API client methods and TypeScript types
- ✅ Added React hooks: useCurrentUser(), useMyClubs()
- ✅ Updated ClubsListPage.tsx to use API data instead of static imports
- ✅ Removed static data imports: currentUser, samplePlayers
- ✅ Implemented skeleton loading states for all sections
- ✅ Added error handling for API failures

## File
`web/src/pages/clubs/ClubsListPage.tsx`

## Priority
**High** — Primary landing page for clubs; partially migrated.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `samplePlayers` | `@data/players` | Player count or summaries for club cards |
| `currentUser` | `@data/currentUser` | Determine which clubs the user has access to |

## Already Using API

| Hook/Call | Usage |
|---|---|
| `useMyTeams()` | Fetches teams the current user has access to |
| `useMyChildren()` | Fetches child players for parent users |

## Proposed API Changes

### Replace `currentUser`
Use existing `apiClient.users.getCurrentUser()` or create `useCurrentUser()` hook.

### Replace `samplePlayers`
Player data should come from the API. If player counts per club are needed, either:
- Include in club list response
- Use existing club detail endpoints
- Create `GET /api/clubs?includePlayerCounts=true`

### New Hook Needed
```typescript
useCurrentUser(): UseApiState<UserProfile>
```

## Implementation Checklist

- [x] Replace `currentUser` import with API call (`getCurrentUser()`)
- [x] Determine what `samplePlayers` is used for — likely player count display
- [x] If player counts: include in club list API response or use `apiClient.clubs.getPlayers()`
- [x] Create `useCurrentUser()` hook if not already existing
- [x] Remove both data imports
- [x] Test club grid renders correctly with API data
- [x] Verify role-based filtering (only show clubs user has access to)


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
| `currentUser` | `getCurrentUser()` API call | User profile with club access |
| `samplePlayers` | Included in club list or separate call | Player counts per club |

## Dependencies

- `HomePage.tsx` — also imports `currentUser`
- `DrillFormPage.tsx`, `DrillTemplateFormPage.tsx` — also import `currentUser`
- `useMyTeams()` and `useMyChildren()` hooks already handle team/child data

## Notes
- This page is **partially migrated** — already uses `useMyTeams()` and `useMyChildren()`
- The remaining migration is relatively small: just replace `currentUser` and `samplePlayers`
- `currentUser` replacement is critical — it controls what clubs the user can see
- Player data may just be used for displaying counts — verify the actual usage

## Database / API Considerations

**SQL Requirements**:
- `GET /api/users/me/clubs` should query user's club access with player counts:
```sql
SELECT c.Id, c.Name, c.PrimaryColor, c.SecondaryColor, c.LogoUrl,
       COUNT(DISTINCT p.Id) as PlayerCount,
       COUNT(DISTINCT t.Id) as TeamCount
FROM Club c
JOIN UserClub uc ON c.Id = uc.ClubId
LEFT JOIN Team t ON t.ClubId = c.Id
LEFT JOIN PlayerTeam pt ON pt.TeamId = t.Id
LEFT JOIN Player p ON p.Id = pt.PlayerId
WHERE uc.UserId = @userId
GROUP BY c.Id
```

**Migration Check**:
- Verify UserClub join table exists for user-club access control
- Verify counts can be efficiently computed (consider indexed views)

**Navigation Store**:
- This is a list page, does NOT populate navigation store
- Individual club pages will populate club names

**No client-side reference data needed**
