# GET /api/player-reports - List Player Reports

## Endpoint Name
**List Player Reports**

## URL Pattern
```
GET /api/player-reports
```

## Description
Retrieves a paginated list of player report cards with filtering.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 20 | Items per page |
| `playerId` | string | No | - | Filter by player |
| `teamId` | string | No | - | Filter by team |

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
  ],
  "pagination": {"page": 1, "pageSize": 20, "totalCount": 123}
}
```

## Required SQL Queries

```sql
SELECT pr.id, pr.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       pr.period, pr.overall_rating, pr.created_at
FROM player_reports pr
INNER JOIN players p ON p.id = pr.player_id
WHERE (@playerId IS NULL OR pr.player_id = @playerId)
    AND (@teamId IS NULL OR EXISTS (
        SELECT 1 FROM player_teams pt WHERE pt.player_id = pr.player_id AND pt.team_id = @teamId
    ))
ORDER BY pr.created_at DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `player_reports`, `players`, `player_teams`
