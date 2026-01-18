# GET /api/training-plans/{planId}/objectives - Get Plan Objectives

## Endpoint Name
**Get Training Plan Objectives**

## URL Pattern
```
GET /api/training-plans/{planId}/objectives
```

## Description
Retrieves all objectives for a training plan.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "obj1",
      "planId": "tp1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "title": "Improve Aerial Ability",
      "description": "Increase heading accuracy...",
      "startDate": "2024-12-01",
      "targetDate": "2025-02-28",
      "status": "in-progress",
      "progress": 25
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT tpo.id, tpo.plan_id, tpo.title, tpo.description,
       tpo.start_date, tpo.target_date, tpo.status, tpo.progress
FROM training_plan_objectives tpo
WHERE tpo.plan_id = @planId
ORDER BY tpo.order_index;
```

## Database Tables Used
- `training_plan_objectives`
