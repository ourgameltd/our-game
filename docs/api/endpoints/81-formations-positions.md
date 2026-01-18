# GET /api/formations/{formationId}/positions - Get Formation Positions

## Endpoint Name
**Get Formation Positions**

## URL Pattern
```
GET /api/formations/{formationId}/positions
```

## Description
Retrieves all positions for a formation.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {"position": "GK", "x": 50, "y": 5, "label": "Goalkeeper"},
    {"position": "RB", "x": 80, "y": 25, "label": "Right Back"}
  ]
}
```

## Required SQL Queries

```sql
SELECT fp.position, fp.x, fp.y, fp.label
FROM formation_positions fp
WHERE fp.formation_id = @formationId
ORDER BY fp.order_index;
```

## Database Tables Used
- `formation_positions`
