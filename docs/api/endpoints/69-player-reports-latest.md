# GET /api/player-reports/latest - Get Latest Reports

## Endpoint Name
**Get Latest Player Reports**

## URL Pattern
```
GET /api/player-reports/latest
```

## Description
Retrieves the most recent player reports.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | Number of reports to return |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "r1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "playerName": "Oliver Thompson",
      "period": "Autumn 2024",
      "overallRating": 8.5,
      "createdAt": "2024-12-01"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT TOP (@limit) pr.id, pr.player_id,
       CONCAT(p.first_name, ' ', p.last_name) as player_name,
       pr.period, pr.overall_rating, pr.created_at
FROM player_reports pr
INNER JOIN players p ON p.id = pr.player_id
INNER JOIN player_teams pt ON pt.player_id = p.id
INNER JOIN teams t ON t.id = pt.team_id
WHERE EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.club_id AND uc.user_id = @userId)
ORDER BY pr.created_at DESC;
```

## Database Tables Used
- `player_reports`, `players`, `player_teams`, `teams`, `user_clubs`
