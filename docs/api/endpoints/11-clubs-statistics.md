# GET /api/clubs/{clubId}/statistics - Get Club Statistics

## Endpoint Name
**Get Club Statistics**

## URL Pattern
```
GET /api/clubs/{clubId}/statistics
```

## Description
Retrieves comprehensive statistics for a club, including team counts, player counts, match records, and goal statistics.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- User must have access to the club

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clubId` | string (UUID) | Yes | Unique identifier of the club |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `season` | string | No | current | Filter by season |

## Request Headers
```
api-version: 1.0
Authorization: Bearer <token>
```

## Request Example
```http
GET /api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b/statistics HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer <token>
```

## Response Example (Success - 200 OK)
```json
{
  "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
  "season": "2024/25",
  "ageGroupCount": 6,
  "teamCount": 12,
  "playerCount": 245,
  "coachCount": 18,
  "matchStatistics": {
    "matchesPlayed": 156,
    "wins": 89,
    "draws": 34,
    "losses": 33,
    "winRate": 57.1,
    "goalsFor": 412,
    "goalsAgainst": 278,
    "goalDifference": 134
  },
  "trainingStatistics": {
    "sessionsCompleted": 342,
    "averageAttendance": 87.5
  },
  "playerDevelopment": {
    "activeDevelopmentPlans": 45,
    "activeTrainingPlans": 38,
    "reportCardsIssued": 123
  }
}
```

## Response Schema

### ClubStatistics
```typescript
{
  clubId: string;
  season: string;
  ageGroupCount: number;
  teamCount: number;
  playerCount: number;
  coachCount: number;
  matchStatistics: {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
  };
  trainingStatistics: {
    sessionsCompleted: number;
    averageAttendance: number;
  };
  playerDevelopment: {
    activeDevelopmentPlans: number;
    activeTrainingPlans: number;
    reportCardsIssued: number;
  };
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Required SQL Queries

```sql
-- Counts
SELECT 
    COUNT(DISTINCT ag.id) as age_group_count,
    COUNT(DISTINCT t.id) as team_count,
    COUNT(DISTINCT p.id) as player_count,
    COUNT(DISTINCT co.id) as coach_count
FROM clubs c
LEFT JOIN age_groups ag ON ag.club_id = c.id AND ag.is_archived = 0
LEFT JOIN teams t ON t.club_id = c.id AND t.is_archived = 0
LEFT JOIN players p ON p.club_id = c.id AND p.is_archived = 0
LEFT JOIN coaches co ON co.club_id = c.id AND co.is_archived = 0
WHERE c.id = @clubId
GROUP BY c.id;

-- Match statistics
SELECT 
    COUNT(*) as matches_played,
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
FROM matches m
INNER JOIN teams t ON t.id = m.team_id
WHERE t.club_id = @clubId
    AND m.status = 'completed'
    AND (@season IS NULL OR t.season = @season);

-- Training statistics
SELECT 
    COUNT(*) as sessions_completed,
    AVG(attendance_rate) as average_attendance
FROM training_sessions ts
INNER JOIN teams t ON t.id = ts.team_id
WHERE t.club_id = @clubId
    AND ts.status = 'completed'
    AND (@season IS NULL OR t.season = @season);

-- Development statistics
SELECT 
    COUNT(DISTINCT CASE WHEN dp.status = 'active' THEN dp.id END) as active_development_plans,
    COUNT(DISTINCT CASE WHEN tp.status = 'active' THEN tp.id END) as active_training_plans,
    COUNT(DISTINCT pr.id) as report_cards_issued
FROM players p
LEFT JOIN development_plans dp ON dp.player_id = p.id
LEFT JOIN training_plans tp ON tp.player_id = p.id
LEFT JOIN player_reports pr ON pr.player_id = p.id 
    AND pr.created_at >= DATEADD(year, -1, GETDATE())
WHERE p.club_id = @clubId;
```

## Database Tables Used
- `clubs`
- `age_groups`
- `teams`
- `players`
- `coaches`
- `matches`
- `training_sessions`
- `development_plans`
- `training_plans`
- `player_reports`

## Business Logic
1. Validate clubId
2. Check user authorization
3. Execute multiple aggregation queries
4. Calculate win rate and goal difference
5. Return comprehensive statistics

## Performance Considerations
- Cache statistics (update hourly)
- Use aggregation queries
- Index on foreign keys

## Related Endpoints
- `GET /api/clubs/{clubId}`
- `GET /api/statistics/club/{clubId}`

## Notes
- Statistics recalculated periodically
- Win rate expressed as percentage
- Season-specific filtering available
