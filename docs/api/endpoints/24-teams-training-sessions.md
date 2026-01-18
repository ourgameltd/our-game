# GET /api/teams/{teamId}/training-sessions - List Team Training Sessions

## Endpoint Name
**List Team Training Sessions**

## URL Pattern
```
GET /api/teams/{teamId}/training-sessions
```

## Description
Retrieves training sessions for a team.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | string (UUID) | Yes | Unique identifier of the team |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by status |
| `from` | string | No | - | Start date |
| `to` | string | No | - | End date |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "ts1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "date": "2024-12-15T18:00:00Z",
      "duration": 90,
      "location": "Training Ground",
      "focus": "tactical",
      "status": "completed",
      "attendanceRate": 92.5
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT ts.id, ts.date, ts.duration, ts.location, ts.focus,
       ts.status,
       (COUNT(CASE WHEN ta.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as attendance_rate
FROM training_sessions ts
LEFT JOIN training_attendance ta ON ta.session_id = ts.id
WHERE ts.team_id = @teamId
    AND (@status IS NULL OR ts.status = @status)
    AND (@from IS NULL OR ts.date >= @from)
    AND (@to IS NULL OR ts.date <= @to)
GROUP BY ts.id, ts.date, ts.duration, ts.location, ts.focus, ts.status
ORDER BY ts.date DESC;
```

## Database Tables Used
- `training_sessions`, `training_attendance`
