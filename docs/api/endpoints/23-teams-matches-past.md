# GET /api/teams/{teamId}/matches/past - Get Past Matches

## Endpoint Name
**Get Past Team Matches**

## URL Pattern
```
GET /api/teams/{teamId}/matches/past
```

## Description
Retrieves completed matches for a team.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | string (UUID) | Yes | Unique identifier of the team |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 5 | Number of matches to return |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "date": "2024-12-13T15:00:00Z",
      "opposition": "Riverside United",
      "isHome": true,
      "score": { "home": 2, "away": 1 },
      "result": "W"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT TOP (@limit) m.id, m.date, m.opposition, m.is_home,
       m.home_score, m.away_score,
       CASE 
           WHEN (m.is_home = 1 AND m.home_score > m.away_score) OR 
                (m.is_home = 0 AND m.away_score > m.home_score) THEN 'W'
           WHEN m.home_score = m.away_score THEN 'D'
           ELSE 'L'
       END as result
FROM matches m
WHERE m.team_id = @teamId
    AND m.status = 'completed'
ORDER BY m.date DESC;
```

## Database Tables Used
- `matches`
