# GET /api/age-groups/{ageGroupId}/statistics - Get Age Group Statistics

## Endpoint Name
**Get Age Group Statistics**

## URL Pattern
```
GET /api/age-groups/{ageGroupId}/statistics
```

## Description
Retrieves comprehensive statistics for an age group including match records and performance metrics.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ageGroupId` | string (UUID) | Yes | Unique identifier of the age group |

## Response Example (Success - 200 OK)
```json
{
  "ageGroupId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "teamCount": 2,
  "playerCount": 24,
  "matchesPlayed": 28,
  "wins": 16,
  "draws": 7,
  "losses": 5,
  "winRate": 57.1,
  "goalsFor": 89,
  "goalsAgainst": 52,
  "goalDifference": 37,
  "upcomingMatches": [],
  "previousResults": [],
  "topPerformers": [],
  "underperforming": []
}
```

## Required SQL Queries

```sql
SELECT 
    COUNT(DISTINCT t.id) as team_count,
    COUNT(DISTINCT pag.player_id) as player_count,
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
FROM age_groups ag
LEFT JOIN teams t ON t.age_group_id = ag.id AND t.is_archived = 0
LEFT JOIN player_age_groups pag ON pag.age_group_id = ag.id
LEFT JOIN matches m ON m.team_id = t.id AND m.status = 'completed'
WHERE ag.id = @ageGroupId
GROUP BY ag.id;
```

## Database Tables Used
- `age_groups`, `teams`, `player_age_groups`, `matches`
