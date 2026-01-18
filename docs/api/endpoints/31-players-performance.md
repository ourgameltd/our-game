# GET /api/players/{playerId}/performance - Get Player Performance Stats

## Endpoint Name
**Get Player Performance Stats**

## URL Pattern
```
GET /api/players/{playerId}/performance
```

## Description
Retrieves aggregate performance statistics for a player.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `playerId` | string (UUID) | Yes | Unique identifier of the player |

## Response Example (Success - 200 OK)
```json
{
  "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
  "matchesPlayed": 8,
  "averageRating": 8.1,
  "goals": 0,
  "assists": 0,
  "cleanSheets": 4,
  "yellowCards": 0,
  "redCards": 0,
  "minutesPlayed": 720
}
```

## Required SQL Queries

```sql
SELECT 
    COUNT(DISTINCT m.id) as matches_played,
    AVG(pr.rating) as average_rating,
    COUNT(DISTINCT g.id) as goals,
    COUNT(DISTINCT a.id) as assists,
    SUM(CASE WHEN m.home_score = 0 AND ml.position = 'GK' THEN 1 ELSE 0 END) as clean_sheets,
    COUNT(DISTINCT CASE WHEN c.type = 'yellow' THEN c.id END) as yellow_cards,
    COUNT(DISTINCT CASE WHEN c.type = 'red' THEN c.id END) as red_cards,
    SUM(ml.minutes_played) as minutes_played
FROM match_lineups ml
INNER JOIN matches m ON m.id = ml.match_id
LEFT JOIN performance_ratings pr ON pr.match_id = m.id AND pr.player_id = ml.player_id
LEFT JOIN goals g ON g.match_id = m.id AND g.player_id = ml.player_id
LEFT JOIN assists a ON a.match_id = m.id AND a.player_id = ml.player_id
LEFT JOIN cards c ON c.match_id = m.id AND c.player_id = ml.player_id
WHERE ml.player_id = @playerId AND m.status = 'completed';
```

## Database Tables Used
- `matches`, `match_lineups`, `performance_ratings`, `goals`, `assists`, `cards`
