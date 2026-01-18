# GET /api/clubs/{clubId}/kits - List Club Kits

## Endpoint Name
**List Club Kits**

## URL Pattern
```
GET /api/clubs/{clubId}/kits
```

## Description
Retrieves a list of all kits (uniforms) available for a club, including home, away, third, goalkeeper, and training kits.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- User must have access to the club

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clubId` | string (UUID) | Yes | Unique identifier of the club |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | No | - | Filter by type (home, away, third, goalkeeper, training) |
| `activeOnly` | boolean | No | true | Show only active kits |

## Request Headers
```
api-version: 1.0
Authorization: Bearer <token>
```

## Request Example
```http
GET /api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b/kits HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer <token>
```

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "name": "Vale Home Kit",
      "type": "home",
      "shirtColor": "#000080",
      "shortsColor": "#000080",
      "socksColor": "#000080",
      "pattern": "solid",
      "isActive": true,
      "season": "2024/25"
    },
    {
      "id": "9b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "name": "Vale Away Kit",
      "type": "away",
      "shirtColor": "#87CEEB",
      "shortsColor": "#000080",
      "socksColor": "#000080",
      "pattern": "solid",
      "isActive": true,
      "season": "2024/25"
    }
  ]
}
```

## Response Schema

### KitListItem
```typescript
{
  id: string;
  clubId: string;
  name: string;
  type: 'home' | 'away' | 'third' | 'goalkeeper' | 'training';
  shirtColor: string;              // Hex color
  shortsColor: string;             // Hex color
  socksColor: string;              // Hex color
  pattern?: string;                // e.g., "solid", "stripes", "hoops"
  isActive: boolean;
  season: string;
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Required SQL Queries

```sql
SELECT 
    k.id,
    k.club_id,
    k.name,
    k.type,
    k.shirt_color,
    k.shorts_color,
    k.socks_color,
    k.pattern,
    k.is_active,
    k.season
FROM kits k
WHERE k.club_id = @clubId
    AND (@type IS NULL OR k.type = @type)
    AND (@activeOnly = 0 OR k.is_active = 1)
ORDER BY 
    CASE k.type
        WHEN 'home' THEN 1
        WHEN 'away' THEN 2
        WHEN 'third' THEN 3
        WHEN 'goalkeeper' THEN 4
        WHEN 'training' THEN 5
    END,
    k.season DESC;
```

## Database Tables Used
- `kits`

## Business Logic
1. Validate clubId
2. Check user authorization
3. Fetch kits with filters
4. Order by type priority
5. Return list

## Performance Considerations
- Index on `kits.club_id`
- Index on `kits.type`
- Cache active kits

## Related Endpoints
- `GET /api/kits/{kitId}`
- `GET /api/teams/{teamId}/kits`

## Notes
- Kits define team uniforms
- Each club typically has 3-5 active kits per season
- Pattern field describes shirt design
