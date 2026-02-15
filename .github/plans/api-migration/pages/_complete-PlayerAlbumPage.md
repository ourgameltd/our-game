**STATUS: COMPLETED** ✅
**Completed Date**: February 15, 2026
**Implementation Summary**: Successfully migrated PlayerAlbumPage from static data to API. Created GET /api/players/{id}/album endpoint with handler, DTOs, Azure Function, API client method, React hook, and updated page component with loading states and error handling.

---

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

- [x] Create `GET /api/players/{id}/album` endpoint
- [x] Create `PlayerAlbumDto` and `PlayerPhotoDto` types
- [x] Add DTO to API client
- [x] Create `usePlayerAlbum()` hook
- [x] Replace `getPlayerById` import with API hook
- [x] Add loading skeleton for photo grid
- [x] Handle empty album state
- [x] Test photo display, filtering by tags, lightbox/modal view


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
