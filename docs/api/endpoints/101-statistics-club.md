# GET /api/statistics/club/{clubId} - Get Club Statistics
## Endpoint Name
**Get Club Statistics**
## URL Pattern
```
GET /api/statistics/club/{clubId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"clubId": "c1", "teamCount": 12, "playerCount": 245, "matchesPlayed": 156, "wins": 89}
```
## Required SQL Queries
```sql
SELECT COUNT(DISTINCT t.id) as team_count, COUNT(DISTINCT p.id) as player_count,
       COUNT(DISTINCT m.id) as matches_played,
       SUM(CASE WHEN m.home_score > m.away_score THEN 1 ELSE 0 END) as wins
FROM clubs c
LEFT JOIN teams t ON t.club_id = c.id
LEFT JOIN players p ON p.club_id = c.id
LEFT JOIN matches m ON m.team_id = t.id
WHERE c.id = @clubId
GROUP BY c.id;
```
## Database Tables Used
- `clubs`, `teams`, `players`, `matches`
