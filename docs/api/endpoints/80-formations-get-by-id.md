# GET /api/formations/{formationId} - Get Formation Details

## Endpoint Name
**Get Formation Details**

## URL Pattern
```
GET /api/formations/{formationId}
```

## Description
Retrieves detailed information for a specific formation including positions.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "id": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "name": "4-4-2 Classic",
  "system": "4-4-2",
  "squadSize": 11,
  "isSystemFormation": true,
  "summary": "Traditional 4-4-2 formation with two strikers",
  "positions": [
    {"position": "GK", "x": 50, "y": 5},
    {"position": "RB", "x": 80, "y": 25},
    {"position": "CB", "x": 60, "y": 20},
    {"position": "CB", "x": 40, "y": 20},
    {"position": "LB", "x": 20, "y": 25}
  ]
}
```

## Required SQL Queries

```sql
SELECT f.id, f.name, f.system, f.squad_size, f.is_system_formation, f.summary
FROM formations f
WHERE f.id = @formationId;

SELECT fp.position, fp.x, fp.y
FROM formation_positions fp
WHERE fp.formation_id = @formationId
ORDER BY fp.order_index;
```

## Database Tables Used
- `formations`, `formation_positions`
