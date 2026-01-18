# GET /api/drills - List All Drills

## Endpoint Name
**List All Drills**

## URL Pattern
```
GET /api/drills
```

## Description
Retrieves a list of all drills available in the system.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | - | Filter by category |
| `intensity` | string | No | - | Filter by intensity |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "Passing Triangles",
      "category": "passing",
      "intensity": "medium",
      "duration": 15,
      "minPlayers": 6,
      "maxPlayers": 12,
      "description": "Triangle passing drill to improve accuracy"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT d.id, d.name, d.category, d.intensity, d.duration,
       d.min_players, d.max_players, d.description
FROM drills d
WHERE (@category IS NULL OR d.category = @category)
    AND (@intensity IS NULL OR d.intensity = @intensity)
ORDER BY d.name;
```

## Database Tables Used
- `drills`
