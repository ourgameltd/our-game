# GET /api/matches/{matchId}/performance-ratings - Get Player Ratings

## Endpoint Name
**Get Player Performance Ratings**

## URL Pattern
```
GET /api/matches/{matchId}/performance-ratings
```

## Description
Retrieves performance ratings for all players in a match.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "playerName": "Oliver Thompson",
      "position": "GK",
      "rating": 8.5,
      "manOfTheMatch": false
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT pr.player_id,
       CONCAT(p.first_name, ' ', p.last_name) as player_name,
       ml.position, pr.rating, pr.is_man_of_match
FROM performance_ratings pr
INNER JOIN players p ON p.id = pr.player_id
INNER JOIN match_lineups ml ON ml.match_id = pr.match_id AND ml.player_id = pr.player_id
WHERE pr.match_id = @matchId
ORDER BY pr.rating DESC;
```

## Database Tables Used
- `performance_ratings`, `players`, `match_lineups`
