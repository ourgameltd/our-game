# GET /api/teams/{teamId}/matches/upcoming - Get Upcoming Matches

## Endpoint Name
**Get Upcoming Team Matches**

## URL Pattern
```
GET /api/teams/{teamId}/matches/upcoming
```

## Description
Retrieves upcoming scheduled matches for a team.

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
      "date": "2024-12-20T15:00:00Z",
      "opposition": "Parkside Rangers",
      "location": "Community Sports Ground",
      "isHome": true,
      "kickOffTime": "2024-12-20T15:00:00Z",
      "meetTime": "2024-12-20T14:15:00Z"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT TOP (@limit) m.id, m.date, m.opposition, m.location, m.is_home,
       m.kick_off_time, m.meet_time
FROM matches m
WHERE m.team_id = @teamId
    AND m.status = 'scheduled'
    AND m.date >= GETDATE()
ORDER BY m.date ASC;
```

## Database Tables Used
- `matches`
