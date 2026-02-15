# Migration Plan: PlayerAbilitiesPage

**Status: ✅ COMPLETED**

## File
`web/src/pages/players/PlayerAbilitiesPage.tsx`

## Priority
**High** — Key page for player development tracking; displays EA FC-style ability ratings.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getPlayerById` | `@data/players` | Fetches player with full attributes (35 abilities across pace, shooting, passing, dribbling, defending, physical, mental, technical) |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/players/{id}/abilities
```

Response:
```json
{
  "playerId": "...",
  "playerName": "James Wilson",
  "overallRating": 72,
  "categories": {
    "pace": { "acceleration": 75, "sprintSpeed": 78 },
    "shooting": { "positioning": 70, "finishing": 68, "shotPower": 72, "longShots": 65, "volleys": 60, "penalties": 70 },
    "passing": { ... },
    "dribbling": { ... },
    "defending": { ... },
    "physical": { ... },
    "mental": { ... },
    "technical": { ... }
  },
  "history": [
    { "date": "2024-01-01", "overallRating": 68 },
    { "date": "2024-06-01", "overallRating": 72 }
  ]
}
```

### Or Use Player Detail
Could be part of `GET /api/players/{id}` with an `?include=abilities` query parameter.

### New Hook Required
```typescript
usePlayerAbilities(playerId: string): UseApiState<PlayerAbilitiesDto>
```

## Implementation Checklist

- [ ] Create `GET /api/players/{id}/abilities` endpoint (or include in player detail)
- [ ] Create `PlayerAbilitiesDto` with all 35 attribute categories
- [ ] Add DTO to API client
- [ ] Create `usePlayerAbilities()` hook
- [ ] Replace `getPlayerById` import with API hook
- [ ] Add loading state for ability radar charts
- [ ] Handle error state for player not found
- [ ] Test attribute display, charts, and category breakdowns
- [ ] Verify attribute labels still resolve correctly (from referenceData `playerAttributes`)


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
| `player.attributes.pace` | `abilities.categories.pace` | All 35 attributes |
| `player.attributes.shooting` | `abilities.categories.shooting` | Each with sub-attributes |
| Player overall rating | Computed server-side | Weighted average of all attributes |

## Dependencies

- `referenceData.ts` `playerAttributes` may still be used for label display — that's OK (see referenceData notes)
- Player detail API (`GET /api/players/{id}`) may include abilities — coordinate design

## Notes
- EA FC-style attributes are a core feature — the schema must match the 35-attribute structure
- Consider including ability history for growth tracking charts
- Attribute labels (e.g., "Sprint Speed", "Finishing") should remain in referenceData as client-side constants
- Heavy chart rendering — loading state is important

## Database / API Considerations

**SQL Requirements for `GET /api/players/{id}/abilities`**:
```sql
SELECT pa.AttributeName, pa.Value, pa.LastUpdated
FROM PlayerAttribute pa
WHERE pa.PlayerId = @playerId
ORDER BY pa.AttributeName

-- For history/growth tracking
SELECT h.RecordedDate, AVG(h.Value) as OverallRating
FROM PlayerAttributeHistory h
WHERE h.PlayerId = @playerId
GROUP BY h.RecordedDate
ORDER BY h.RecordedDate DESC
LIMIT 12  -- Last 12 recordings
```

**Migration Check**:
- Verify PlayerAttribute table has: PlayerId, AttributeName, Value (0-99), LastUpdated
- Check if AttributeName is VARCHAR or foreign key to AttributeDefinition table
- Verify all 35 EA FC attributes are seeded/supported:
  - Pace: Acceleration, SprintSpeed
  - Shooting: Positioning, Finishing, ShotPower, LongShots, Volleys, Penalties
  - Passing: ShortPassing, Vision, Crossing, LongPassing, Curve, FreeKickAccuracy
  - Dribbling: BallControl, Dribbling, Agility, Balance, Reactions, Composure
  - Defending: Interceptions, HeadingAccuracy, DefensiveAwareness, StandingTackle, SlidingTackle
  - Physical: Jumping, Stamina, Strength, Aggression
  - Mental: Positioning, Vision, Composure, Reactions
  - Technical: BallControl, Technique
- Consider PlayerAttributeHistory table for growth tracking (optional)

**Overall Rating Calculation**:
- Computed server-side as weighted average based on position
- Example: ST = (Shooting * 0.3 + Pace * 0.25 + Dribbling * 0.25 + Physical * 0.2)
- Store formula or compute dynamically

**Navigation Store Population**:
```typescript
if (abilities) {
  setEntityName('player', playerId, abilities.playerName);
}
```

**Reference Data**:
- `playerAttributes` labels — client-side constants for i18n
- Attribute category colors — client-side for chart rendering
