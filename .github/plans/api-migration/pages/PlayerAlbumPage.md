# Migration Plan: PlayerAlbumPage

## File
`web/src/pages/players/PlayerAlbumPage.tsx`

## Priority
**Medium** — Player photo gallery; secondary feature.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player with `album` array containing photo URLs, captions, dates, tags |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/players/{id}/album
```

Response:
```json
{
  "playerId": "...",
  "playerName": "James Wilson",
  "photos": [
    {
      "id": "...",
      "url": "https://...",
      "thumbnail": "https://...",
      "caption": "Match Day vs Renton",
      "date": "2024-01-15",
      "tags": ["match"]
    }
  ]
}
```

### New Hook Required
```typescript
usePlayerAlbum(playerId: string): UseApiState<PlayerAlbumDto>
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}/album` endpoint
- [ ] Create `PlayerAlbumDto` and `PlayerPhotoDto` types
- [ ] Add DTO to API client
- [ ] Create `usePlayerAlbum()` hook
- [ ] Replace `getPlayerById` import with API hook
- [ ] Add loading skeleton for photo grid
- [ ] Handle empty album state
- [ ] Test photo display, filtering by tags, lightbox/modal view


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
| `player.album` array | `GET /api/players/{id}/album` | Photo array with metadata |
| `player.name` | Included in album response or separate player detail call | For page title |

## Dependencies

- `ImageAlbum.tsx` component — receives album data via props, uses `imageTags` from referenceData
- Player detail API should be designed alongside this endpoint

## Notes
- Photo storage will eventually need Azure Blob Storage integration
- Image tags (`imageTags` in referenceData) are UI filter labels — stay client-side
- Consider pagination for players with many photos
- Thumbnail support important for grid performance
