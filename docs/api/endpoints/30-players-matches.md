# GET /api/players/{playerId}/matches - List Player Matches

## Endpoint Name
**List Player Matches**

## URL Pattern
```
GET /api/players/{playerId}/matches
```

## Description
Retrieves all matches a player has participated in.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `playerId` | string (UUID) | Yes | Unique identifier of the player |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "date": "2024-12-13",
      "opposition": "Riverside United",
      "result": "W 2-1",
      "minutesPlayed": 90,
      "position": "GK",
      "rating": 8.5
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT m.id as match_id, m.date, m.opposition,
       CASE 
           WHEN (m.is_home = 1 AND m.home_score > m.away_score) OR 
                (m.is_home = 0 AND m.away_score > m.home_score) THEN 'W'
           WHEN m.home_score = m.away_score THEN 'D'
           ELSE 'L'
       END + ' ' + CAST(CASE WHEN m.is_home = 1 THEN m.home_score ELSE m.away_score END AS VARCHAR) + '-' +
       CAST(CASE WHEN m.is_home = 1 THEN m.away_score ELSE m.home_score END AS VARCHAR) as result,
       ml.minutes_played, ml.position, pr.rating
FROM matches m
INNER JOIN match_lineups ml ON ml.match_id = m.id
LEFT JOIN performance_ratings pr ON pr.match_id = m.id AND pr.player_id = ml.player_id
WHERE ml.player_id = @playerId AND m.status = 'completed'
ORDER BY m.date DESC;
```

## Database Tables Used
- `matches`, `match_lineups`, `performance_ratings`
