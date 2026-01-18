# GET /api/statistics/team/{teamId} - Get Team Statistics
## Endpoint Name
**Get Team Statistics**
## URL Pattern
```
GET /api/statistics/team/{teamId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"teamId": "t1", "playerCount": 12, "matchesPlayed": 14, "wins": 8}
```
## Required SQL Queries
```sql
SELECT COUNT(DISTINCT pt.player_id) as player_count,
       COUNT(DISTINCT m.id) as matches_played,
       SUM(CASE WHEN m.home_score > m.away_score THEN 1 ELSE 0 END) as wins
FROM teams t
LEFT JOIN player_teams pt ON pt.team_id = t.id
LEFT JOIN matches m ON m.team_id = t.id
WHERE t.id = @teamId
GROUP BY t.id;
```
## Database Tables Used
- `teams`, `player_teams`, `matches`
