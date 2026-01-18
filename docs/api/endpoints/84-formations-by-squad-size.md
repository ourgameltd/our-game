# GET /api/formations/{squadSize} - List Formations for Squad Size

## Endpoint Name
**List Formations by Squad Size**

## URL Pattern
```
GET /api/formations/{squadSize}
```

## Description
Retrieves all formations for a specific squad size (4, 5, 7, 9, or 11).

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `squadSize` | integer | Yes | Squad size (4, 5, 7, 9, or 11) |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "4-4-2 Classic",
      "system": "4-4-2",
      "isSystemFormation": true
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT f.id, f.name, f.system, f.is_system_formation
FROM formations f
WHERE f.squad_size = @squadSize
ORDER BY f.is_system_formation DESC, f.name;
```

## Database Tables Used
- `formations`
