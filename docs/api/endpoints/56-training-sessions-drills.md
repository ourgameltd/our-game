# GET /api/training-sessions/{sessionId}/drills - Get Session Drills

## Endpoint Name
**Get Training Session Drills**

## URL Pattern
```
GET /api/training-sessions/{sessionId}/drills
```

## Description
Retrieves all drills in a training session.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "drillId": "d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "Passing Triangles",
      "duration": 15,
      "intensity": "medium",
      "orderIndex": 1
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT sd.drill_id, d.name, sd.duration, sd.intensity, sd.order_index
FROM session_drills sd
INNER JOIN drills d ON d.id = sd.drill_id
WHERE sd.session_id = @sessionId
ORDER BY sd.order_index;
```

## Database Tables Used
- `session_drills`, `drills`
