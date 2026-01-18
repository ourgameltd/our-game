# GET /api/formations/club/{clubId} - List Club-Specific Formations

## Endpoint Name
**List Club Formations**

## URL Pattern
```
GET /api/formations/club/{clubId}
```

## Description
Retrieves formations created specifically for a club.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "t1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "High Press 4-4-2",
      "system": "4-4-2",
      "squadSize": 11,
      "parentFormationId": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT f.id, f.name, f.system, f.squad_size, f.parent_formation_id
FROM formations f
WHERE f.scope_club_id = @clubId
ORDER BY f.name;
```

## Database Tables Used
- `formations`
