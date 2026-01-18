# GET /api/training-sessions/past - Get Past Training Sessions

## Endpoint Name
**Get Past Training Sessions**

## URL Pattern
```
GET /api/training-sessions/past
```

## Description
Retrieves past completed training sessions.

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
      "date": "2024-12-15T18:00:00Z",
      "focus": "tactical",
      "attendanceRate": 91.7
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT TOP (@limit) ts.id, ts.team_id, t.name as team_name,
       ts.date, ts.focus,
       (COUNT(CASE WHEN ta.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as attendance_rate
FROM training_sessions ts
INNER JOIN teams t ON t.id = ts.team_id
LEFT JOIN training_attendance ta ON ta.session_id = ts.id
WHERE ts.status = 'completed'
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.club_id AND uc.user_id = @userId)
GROUP BY ts.id, ts.team_id, t.name, ts.date, ts.focus
ORDER BY ts.date DESC;
```

## Database Tables Used
- `training_sessions`, `teams`, `training_attendance`, `user_clubs`
