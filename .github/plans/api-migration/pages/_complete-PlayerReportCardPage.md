# ✅ COMPLETED - Migration Plan: PlayerReportCardPage

**Completion Date:** February 16, 2026

## Implementation Summary

**Backend:**
- Used existing `GET /v1/reports/{reportId}` endpoint (no new endpoint needed)

**Frontend:**
- Created `useReportCard` hook in `web/src/api/hooks/useReportCard.ts`
- Updated route configuration with `reportId` parameter
- Added skeleton loading states for better UX
- Updated all navigation links to include `reportId` parameter
- Successfully migrated from static data to API integration

---

## File
`web/src/pages/players/PlayerReportCardPage.tsx`

## Priority
**High** — Individual report card detail view; key coaching assessment tool.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getReportsByPlayerId` | `@/data/reports` | Fetches all reports for a player, then filters to find specific report by ID |
| `getPlayerById` | `@data/players` | Fetches player details for context display |

## Proposed API Changes

### New API Endpoints Required

1. **Get Report Card by ID**
   ```
   GET /api/reports/{id}
   ```
   Response: Full report card including player context, assessments, ratings, coach notes.

### New Hook Required
```typescript
useReportCard(reportId: string): UseApiState<ReportCardDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/reports/{id}` endpoint
- [ ] Create `ReportCardDetailDto` with all assessment fields
- [ ] Include player name/position in response (denormalized)
- [ ] Add DTO to API client
- [ ] Create `useReportCard()` hook
- [ ] Replace `getReportsByPlayerId` and `getPlayerById` imports
- [ ] Add loading/error states
- [ ] Test report card display, ratings, coach notes


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
| `getReportsByPlayerId(id)` then filter by reportId | `GET /api/reports/{reportId}` | Direct lookup by report ID |
| `getPlayerById(id)` | Included in report response | Player context denormalized |

## Dependencies

- `PlayerReportCardsPage.tsx` — list view of all reports for a player
- `AddEditReportCardPage.tsx` — create/edit report form
- Report card DTOs already exist: `ClubReportCardDto` — may be extended or a separate detail DTO

## Notes
- Current approach fetches all reports then filters — API should return single report directly
- `ClubReportCardDto` already exists in the API client — verify if it's sufficient or needs extension
- Include assessment categories, individual ratings, and overall grade in the detail response
