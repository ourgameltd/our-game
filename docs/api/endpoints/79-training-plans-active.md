# GET /api/training-plans/active - Get Active Training Plans

## Endpoint Name
**Get Active Training Plans**

## URL Pattern
```
GET /api/training-plans/active
```

## Description
Retrieves all active training plans for accessible players.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "tp1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "playerId": "p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      "playerName": "Carlos Fernandez",
      "period": {"start": "2024-12-01", "end": "2025-02-28"},
      "objectiveCount": 4
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT tp.id, tp.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       tp.period_start, tp.period_end,
       COUNT(tpo.id) as objective_count
FROM training_plans tp
INNER JOIN players p ON p.id = tp.player_id
LEFT JOIN training_plan_objectives tpo ON tpo.plan_id = tp.id
INNER JOIN player_teams pt ON pt.player_id = p.id
INNER JOIN teams t ON t.id = pt.team_id
WHERE tp.status = 'active'
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.club_id AND uc.user_id = @userId)
GROUP BY tp.id, tp.player_id, p.first_name, p.last_name, tp.period_start, tp.period_end
ORDER BY tp.created_at DESC;
```

## Database Tables Used
- `training_plans`, `players`, `training_plan_objectives`, `player_teams`, `teams`, `user_clubs`
