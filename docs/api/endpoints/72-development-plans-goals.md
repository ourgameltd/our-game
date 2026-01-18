# GET /api/development-plans/{planId}/goals - Get Plan Goals

## Endpoint Name
**Get Development Plan Goals**

## URL Pattern
```
GET /api/development-plans/{planId}/goals
```

## Description
Retrieves all goals for a development plan.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "goal-1",
      "planId": "devplan-1",
      "title": "Improve Aerial Ability",
      "description": "Increase heading accuracy and aerial duel success rate",
      "targetValue": "60% aerial duel success",
      "currentValue": "45%",
      "status": "in-progress",
      "progress": 25
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT dg.id, dg.plan_id, dg.title, dg.description,
       dg.target_value, dg.current_value, dg.status, dg.progress
FROM development_plan_goals dg
WHERE dg.plan_id = @planId
ORDER BY dg.order_index;
```

## Database Tables Used
- `development_plan_goals`
