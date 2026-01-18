# GET /api/statistics/age-group/{ageGroupId} - Get Age Group Statistics
## Endpoint Name
**Get Age Group Statistics**
## URL Pattern
```
GET /api/statistics/age-group/{ageGroupId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"ageGroupId": "ag1", "teamCount": 2, "playerCount": 24, "matchesPlayed": 28}
```
## Required SQL Queries
```sql
SELECT COUNT(DISTINCT t.id) as team_count, COUNT(DISTINCT pag.player_id) as player_count,
       COUNT(DISTINCT m.id) as matches_played
FROM age_groups ag
LEFT JOIN teams t ON t.age_group_id = ag.id
LEFT JOIN player_age_groups pag ON pag.age_group_id = ag.id
LEFT JOIN matches m ON m.team_id = t.id
WHERE ag.id = @ageGroupId
GROUP BY ag.id;
```
## Database Tables Used
- `age_groups`, `teams`, `player_age_groups`, `matches`
