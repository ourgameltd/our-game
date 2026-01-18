# GET /api/teams/{teamId}/statistics - Get Team Statistics

## Endpoint Name
**Get Team Statistics**

## URL Pattern
```
GET /api/teams/{teamId}/statistics
```

## Description
Retrieves comprehensive statistics for a team.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | string (UUID) | Yes | Unique identifier of the team |

## Response Example (Success - 200 OK)
```json
{
  "teamId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "playerCount": 12,
  "matchesPlayed": 14,
  "wins": 8,
  "draws": 4,
  "losses": 2,
  "winRate": 57.1,
  "goalsFor": 42,
  "goalsAgainst": 18,
  "goalDifference": 24,
  "topScorers": [],
  "topAssists": []
}
```

## Required SQL Queries

```sql
SELECT 
    COUNT(DISTINCT pt.player_id) as player_count,
    COUNT(DISTINCT m.id) as matches_played,
    SUM(CASE 
        WHEN (m.is_home = 1 AND m.home_score > m.away_score) 
            OR (m.is_home = 0 AND m.away_score > m.home_score) 
        THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) as draws,
    SUM(CASE 
        WHEN (m.is_home = 1 AND m.home_score < m.away_score) 
            OR (m.is_home = 0 AND m.away_score < m.home_score) 
        THEN 1 ELSE 0 END) as losses,
    SUM(CASE WHEN m.is_home = 1 THEN m.home_score ELSE m.away_score END) as goals_for,
    SUM(CASE WHEN m.is_home = 1 THEN m.away_score ELSE m.home_score END) as goals_against
FROM teams t
LEFT JOIN player_teams pt ON pt.team_id = t.id
LEFT JOIN matches m ON m.team_id = t.id AND m.status = 'completed'
WHERE t.id = @teamId
GROUP BY t.id;
```

## Database Tables Used
- `teams`, `player_teams`, `matches`
