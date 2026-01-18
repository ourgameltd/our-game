# GET /api/statistics/player/{playerId} - Get Player Statistics
## Endpoint Name
**Get Player Statistics**
## URL Pattern
```
GET /api/statistics/player/{playerId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"playerId": "p1", "matchesPlayed": 8, "goals": 0, "assists": 0, "averageRating": 8.1}
```
## Required SQL Queries
```sql
SELECT COUNT(DISTINCT ml.match_id) as matches_played,
       COUNT(DISTINCT g.id) as goals,
       COUNT(DISTINCT a.id) as assists,
       AVG(pr.rating) as average_rating
FROM players p
LEFT JOIN match_lineups ml ON ml.player_id = p.id
LEFT JOIN goals g ON g.player_id = p.id
LEFT JOIN assists a ON a.player_id = p.id
LEFT JOIN performance_ratings pr ON pr.player_id = p.id
WHERE p.id = @playerId
GROUP BY p.id;
```
## Database Tables Used
- `players`, `match_lineups`, `goals`, `assists`, `performance_ratings`
