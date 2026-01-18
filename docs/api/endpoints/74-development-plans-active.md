# GET /api/development-plans/active - Get Active Development Plans

## Endpoint Name
**Get Active Development Plans**

## URL Pattern
```
GET /api/development-plans/active
```

## Description
Retrieves all active development plans for accessible players.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "devplan-1",
      "playerId": "p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      "playerName": "Carlos Fernandez",
      "title": "Complete Forward Development - Q1 2025",
      "progress": 45,
      "period": {"start": "2024-12-01", "end": "2025-02-28"}
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT dp.id, dp.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       dp.title, dp.progress, dp.period_start, dp.period_end
FROM development_plans dp
INNER JOIN players p ON p.id = dp.player_id
INNER JOIN player_teams pt ON pt.player_id = p.id
INNER JOIN teams t ON t.id = pt.team_id
WHERE dp.status = 'active'
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.club_id AND uc.user_id = @userId)
ORDER BY dp.created_at DESC;
```

## Database Tables Used
- `development_plans`, `players`, `player_teams`, `teams`, `user_clubs`
