# GET /api/players/{playerId}/training-plans - Get Training Plans

## Endpoint Name
**Get Player Training Plans**

## URL Pattern
```
GET /api/players/{playerId}/training-plans
```

## Description
Retrieves training plans for a player.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "tp1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "playerId": "p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      "status": "active",
      "period": {
        "start": "2024-12-01",
        "end": "2025-02-28"
      },
      "objectiveCount": 4
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT tp.id, tp.player_id, tp.status,
       tp.period_start, tp.period_end,
       COUNT(o.id) as objective_count
FROM training_plans tp
LEFT JOIN training_plan_objectives o ON o.plan_id = tp.id
WHERE tp.player_id = @playerId
GROUP BY tp.id, tp.player_id, tp.status, tp.period_start, tp.period_end
ORDER BY tp.status, tp.created_at DESC;
```

## Database Tables Used
- `training_plans`, `training_plan_objectives`
