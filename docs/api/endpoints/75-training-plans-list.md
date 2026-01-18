# GET /api/training-plans - List Training Plans

## Endpoint Name
**List Training Plans**

## URL Pattern
```
GET /api/training-plans
```

## Description
Retrieves a paginated list of training plans with filtering.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 20 | Items per page |
| `playerId` | string | No | - | Filter by player |
| `status` | string | No | - | Filter by status |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "tp1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "playerId": "p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      "playerName": "Carlos Fernandez",
      "status": "active",
      "period": {"start": "2024-12-01", "end": "2025-02-28"},
      "objectiveCount": 4
    }
  ],
  "pagination": {"page": 1, "pageSize": 20, "totalCount": 38}
}
```

## Required SQL Queries

```sql
SELECT tp.id, tp.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       tp.status, tp.period_start, tp.period_end,
       COUNT(tpo.id) as objective_count
FROM training_plans tp
INNER JOIN players p ON p.id = tp.player_id
LEFT JOIN training_plan_objectives tpo ON tpo.plan_id = tp.id
WHERE (@playerId IS NULL OR tp.player_id = @playerId)
    AND (@status IS NULL OR tp.status = @status)
GROUP BY tp.id, tp.player_id, p.first_name, p.last_name, tp.status, tp.period_start, tp.period_end
ORDER BY tp.status, tp.created_at DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `training_plans`, `players`, `training_plan_objectives`
