# Migration Plan: HomePage

## File
`web/src/pages/HomePage.tsx`

## Priority
**High** — Landing page after login; primary entry point for the application.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `currentUser` | `../data/currentUser` | Hardcoded demo user object for displaying welcome message, user name, role, and personalized dashboard content |

## Proposed API Changes

### Use Existing API
`apiClient.users.getCurrentUser()` already exists and returns a `UserProfile` with name, email, roles, and permissions.

### Existing Hook/Endpoint
- `getCurrentUser()` in `web/src/api/users.ts`
- Already used by `ProfilePage.tsx`

## Implementation Checklist

- [ ] Replace `currentUser` import with `getCurrentUser()` API call or create `useCurrentUser()` hook
- [ ] Add loading state while user profile fetches
- [ ] Add error handling for auth failures (redirect to login)
- [ ] Update any references to `currentUser.clubs`, `currentUser.roles` to match API response shape
- [ ] Remove import of `currentUser` from `@data/currentUser`
- [ ] Test welcome message displays correctly with API data
- [ ] Verify role-based dashboard content works with API user profile


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
| `currentUser.name` | `UserProfile.displayName` | May need field name mapping |
| `currentUser.email` | `UserProfile.email` | Direct mapping |
| `currentUser.roles` | `UserProfile.roles` | Verify role format matches |
| `currentUser.clubs` | Separate API call or included in profile | May need `apiClient.clubs.getMyClubs()` |

## Dependencies

- `ProfilePage.tsx` already uses `getCurrentUser()` — same pattern applies
- `ClubsListPage.tsx` also imports `currentUser` — coordinate migration

## Notes
- The `currentUser` import is the demo/seed data user — in production this comes from authentication
- The `UserProfile` type from the API client may have different field names than the static `User` type
- Consider creating a `useCurrentUser()` hook that caches the result to avoid re-fetching on every page
- Dashboard widgets may need additional API calls for club summaries, upcoming matches, etc.

## Database / API Considerations

**SQL Requirements**:
- User authentication handled by Azure Functions auth middleware
- `GET /api/users/me` should query User table with roles, permissions
- May need JOINs to UserRole, Club access tables

**Migration Check**:
- Verify User table has DisplayName, Email, Roles columns
- Verify UserRole enum matches frontend role checks
- Check if user-club associations stored in separate table

**Navigation Store**:
- HomePage should NOT populate navigation store (no specific entity context)
- Dashboard shows aggregated data from multiple entities

**No reference data needed** - all data from User API
