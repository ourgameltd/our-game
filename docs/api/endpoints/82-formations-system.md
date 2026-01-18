# GET /api/formations/system - List System Formations Only

## Endpoint Name
**List System Formations**

## URL Pattern
```
GET /api/formations/system
```

## Description
Retrieves all built-in system formations.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `squadSize` | integer | No | - | Filter by squad size |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "4-4-2 Classic",
      "system": "4-4-2",
      "squadSize": 11
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT f.id, f.name, f.system, f.squad_size
FROM formations f
WHERE f.is_system_formation = 1
    AND (@squadSize IS NULL OR f.squad_size = @squadSize)
ORDER BY f.squad_size, f.name;
```

## Database Tables Used
- `formations`
