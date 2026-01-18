# GET /api/training-sessions/upcoming - Get Upcoming Training Sessions

## Endpoint Name
**Get Upcoming Training Sessions**

## URL Pattern
```
GET /api/training-sessions/upcoming
```

## Description
Retrieves upcoming training sessions.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | Number of sessions to return |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "ts1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "teamId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "teamName": "Reds",
      "date": "2024-12-20T18:00:00Z",
      "location": "Training Ground",
      "focus": "tactical"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT TOP (@limit) ts.id, ts.team_id, t.name as team_name,
       ts.date, ts.location, ts.focus
FROM training_sessions ts
INNER JOIN teams t ON t.id = ts.team_id
WHERE ts.status = 'scheduled'
    AND ts.date >= GETDATE()
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.club_id AND uc.user_id = @userId)
ORDER BY ts.date ASC;
```

## Database Tables Used
- `training_sessions`, `teams`, `user_clubs`
