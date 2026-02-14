# Migration Plan: TacticDetailPage

## File
`web/src/pages/tactics/TacticDetailPage.tsx`

## Priority
**High** — Tactic detail view showing formation, positions, directions, inheritance.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getTacticById` | `@/data/tactics` | Fetches tactic by ID (name, formation reference, position overrides, inheritance) |
| `getResolvedPositions` | `@/data/tactics` | Resolves final positions by applying inheritance chain (club → team overrides) |
| `getFormationById` | `@/data/formations` | Fetches the base formation for the tactic |

## Proposed API Changes

### New API Endpoint Required

```
GET /api/tactics/{id}
```

Response: Full tactic detail with resolved positions computed server-side:
```json
{
  "tacticId": "...",
  "name": "High Press 4-4-2",
  "scope": "club",
  "formationId": "...",
  "formationName": "4-4-2",
  "squadSize": 11,
  "resolvedPositions": [
    {
      "x": 50,
      "y": 15,
      "role": "ST",
      "direction": "forward",
      "isOverridden": false
    }
  ],
  "parentTacticId": "...",
  "overriddenFields": ["positions[0].direction", "positions[3].role"],
  "tacticStyle": "attacking"
}
```

### Position Resolution
The `getResolvedPositions()` function applies tactic inheritance (parent → child overrides). This logic should move to the API so the frontend receives pre-resolved positions.

### Formations Note
`getFormationById` fetches the base formation. If formations become an API resource, use `GET /api/formations/{id}`. Otherwise, include formation details in the tactic response.

### New Hook Required
```typescript
useTactic(tacticId: string): UseApiState<TacticDetailDto>
```

## Implementation Checklist

- [ ] Create `GET /api/tactics/{id}` endpoint
- [ ] Implement position resolution logic server-side (inheritance chain)
- [ ] Include formation details in response
- [ ] Create `TacticDetailDto` with resolved positions
- [ ] Add DTO to API client
- [ ] Create `useTactic()` hook
- [ ] Replace all 3 data imports
- [ ] Add loading/error states
- [ ] Test tactic display with pitch rendering, position dots, direction arrows
- [ ] Test inheritance indicators (which fields are overridden)


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
| `getTacticById(id)` | `GET /api/tactics/{id}` | Full tactic detail |
| `getResolvedPositions(tactic)` | `resolvedPositions` in response | Computed server-side |
| `getFormationById(formationId)` | Included in tactic response | Formation context |

## Dependencies

- `AddEditTacticPage.tsx` — shares tactic detail endpoint
- `TacticsListPage.tsx` — already migrated (uses `useTacticsByScope()`)
- `TacticDisplay.tsx` component — receives resolved positions via props
- `PrinciplePanel.tsx` component — receives resolved positions via props

## Notes
- Tactic inheritance is the most complex data logic in the static data layer
- Moving position resolution to the server simplifies the frontend significantly
- The `ResolvedPosition` type should become part of the API DTOs
- Formation data (position coordinates) may be embedded in the tactic response or kept client-side

## Database / API Considerations

**SQL Requirements for `GET /api/tactics/{id}` with Inheritance Resolution**:
```sql
-- Recursive CTE to resolve tactic inheritance chain
WITH TacticHierarchy AS (
  -- Base tactic
  SELECT Id, Name, FormationId, ParentTacticId, ScopeType, 1 as Level
  FROM Tactic
  WHERE Id = @tacticId
  
  UNION ALL
  
  -- Parent tactics
  SELECT t.Id, t.Name, t.FormationId, t.ParentTacticId, t.ScopeType, th.Level + 1
  FROM Tactic t
  INNER JOIN TacticHierarchy th ON t.Id = th.ParentTacticId
)
SELECT 
  t.Id as TacticId,
  t.Name,
  t.ScopeType,
  f.Id as FormationId,
  f.Name as FormationName,
  f.SquadSize,
  -- Get base formation positions
  fp.X, fp.Y, fp.Role as BaseRole,
  -- Apply position overrides from child → parent chain
  COALESCE(po.Role, fp.Role) as FinalRole,
  COALESCE(po.Direction, 'Neutral') as Direction,
  CASE WHEN po.Id IS NOT NULL THEN 1 ELSE 0 END as IsOverridden
FROM Tactic t
JOIN Formation f ON t.FormationId = f.Id
JOIN FormationPosition fp ON f.Id = fp.FormationId
LEFT JOIN PositionOverride po ON po.TacticId = t.Id AND po.PositionIndex = fp.PositionIndex
WHERE t.Id = @tacticId
ORDER BY fp.PositionIndex
```

**Migration Check**:
- Verify `TacticPrinciple` table structure
- Verify `PositionOverride` table has TacticId, PositionIndex, Role, Direction columns
- Verify `Direction` enum exists (Forward, Backward, Neutral, etc.)
- Check if principles stored as JSON or separate rows

**Complex Logic - Server-Side**:
1. Fetch tactic hierarchy (parent chain)
2. Get base formation positions
3. Apply overrides from most specific (child) to least (parent)
4. Return resolved positions with override flags

**Navigation Store Population**:
```typescript
if (tactic) {
  setEntityName('tactic', tacticId, tactic.name);
  setEntityName('formation', tactic.formationId, tactic.formationName);
}
```

**Reference Data**:
- Formation base data could be seeded reference data
- Direction enum values from database
- PlayerPosition enum values from database
