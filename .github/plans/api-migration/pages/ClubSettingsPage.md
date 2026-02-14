# Migration Plan: ClubSettingsPage

## File
`web/src/pages/clubs/ClubSettingsPage.tsx`

## Priority
**Medium** — Club configuration and settings form.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getClubById` | `@/data/clubs` | Fetches club details to pre-populate settings form |

## Proposed API Changes

### Existing/New API Endpoints

1. **Club Detail** (exists)
   `useClubById(clubId)` — already exists and in use on other pages

2. **Update Club**
   ```
   PUT /api/clubs/{clubId}
   ```
   Request: Updated club fields (name, colors, logo, location, ethos, etc.)

### New Addition to API Client
```typescript
apiClient.clubs.updateClub(clubId: string, data: ClubUpdateDto): Promise<ApiResponse<void>>
```

## Implementation Checklist

- [ ] Use existing `useClubById()` hook for pre-populating form
- [ ] Create `PUT /api/clubs/{clubId}` endpoint
- [ ] Create `ClubUpdateDto` request type
- [ ] Add `updateClub()` to API client
- [ ] Replace `getClubById` import with `useClubById()` hook
- [ ] Wire form submit to PUT endpoint
- [ ] Add validation and error handling
- [ ] Test form pre-population and save


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
| `getClubById(clubId)` | `useClubById(clubId)` (exists) | Pre-populate form |
| Form submit | `PUT /api/clubs/{clubId}` | Save changes |

## Dependencies

- `ClubOverviewPage.tsx` — already migrated, uses same `useClubById()`

## Notes
- Read part is already covered by existing hooks — just need the write (PUT) endpoint
- Club settings may include: name, description, colors, logo, location, ethos, principles
- Consider which fields should be editable vs read-only

## Database / API Considerations

**SQL Requirements for `PUT /api/clubs/{id}`**:
```sql
UPDATE Club
SET Name = @name,
    Description = @description,
    PrimaryColor = @primaryColor,
    SecondaryColor = @secondaryColor,
    LogoUrl = @logoUrl,
    Location = @location,
    Ethos = @ethos,
    UpdatedAt = GETUTCDATE()
WHERE Id = @clubId
```

**Migration Check**:
- Verify Club table has all editable fields
- Check if Principles stored as JSON column or separate table
- Verify color format (RGB hex, named colors)?   - Check if logo upload separate endpoint or URL field

**Validation**:
- Club name uniqueness constraint?
- Color format validation
- User authorization (only club admins can edit)

**Navigation Store**:
- After update, refresh club name in store if changed:
```typescript
if (updatedName) {
  setEntityName('club', clubId, updatedName);
}
```

**No reference data needed** - form fields are direct club properties
