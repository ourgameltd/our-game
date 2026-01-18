# GET /api/training-plans/{planId} - Get Training Plan Details

## Endpoint Name
**Get Training Plan Details**

## URL Pattern
```
GET /api/training-plans/{planId}
```

## Description
Retrieves detailed information for a training plan.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "id": "tp1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "playerId": "p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
  "playerName": "Carlos Fernandez",
  "status": "active",
  "period": {"start": "2024-12-01", "end": "2025-02-28"},
  "createdBy": "Michael Robertson",
  "createdAt": "2024-12-01"
}
```

## Required SQL Queries

```sql
SELECT tp.id, tp.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       tp.status, tp.period_start, tp.period_end,
       CONCAT(c.first_name, ' ', c.last_name) as created_by,
       tp.created_at
FROM training_plans tp
INNER JOIN players p ON p.id = tp.player_id
LEFT JOIN coaches c ON c.id = tp.created_by_id
WHERE tp.id = @planId;
```

## Database Tables Used
- `training_plans`, `players`, `coaches`
