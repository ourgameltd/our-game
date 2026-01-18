# GET /api/training-plans/{planId}/sessions - Get Planned Sessions

## Endpoint Name
**Get Training Plan Sessions**

## URL Pattern
```
GET /api/training-plans/{planId}/sessions
```

## Description
Retrieves all planned sessions for a training plan.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "ps1",
      "planId": "tp1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "title": "Heading Practice & Finishing",
      "date": "2024-12-09T18:00:00Z",
      "focusAreas": ["Heading", "Finishing", "Positioning"],
      "completed": false
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT tps.id, tps.plan_id, tps.title, tps.date,
       tps.focus_areas, tps.completed
FROM training_plan_sessions tps
WHERE tps.plan_id = @planId
ORDER BY tps.date;
```

## Database Tables Used
- `training_plan_sessions`
