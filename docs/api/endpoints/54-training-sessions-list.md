# GET /api/training-sessions - List Training Sessions

## Endpoint Name
**List Training Sessions**

## URL Pattern
```
GET /api/training-sessions
```

## Description
Retrieves a paginated list of training sessions with filtering.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 20 | Items per page |
| `teamId` | string | No | - | Filter by team |
| `status` | string | No | - | Filter by status |
| `from` | string | No | - | Start date |
| `to` | string | No | - | End date |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "ts1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "teamId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "teamName": "Reds",
      "date": "2024-12-15T18:00:00Z",
      "duration": 90,
      "location": "Training Ground",
      "focus": "tactical",
      "status": "completed"
    }
  ],
  "pagination": {"page": 1, "pageSize": 20, "totalCount": 342}
}
```

## Required SQL Queries

```sql
SELECT ts.id, ts.team_id, t.name as team_name, ts.date,
       ts.duration, ts.location, ts.focus, ts.status
FROM training_sessions ts
INNER JOIN teams t ON t.id = ts.team_id
WHERE (@teamId IS NULL OR ts.team_id = @teamId)
    AND (@status IS NULL OR ts.status = @status)
    AND (@from IS NULL OR ts.date >= @from)
    AND (@to IS NULL OR ts.date <= @to)
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.club_id AND uc.user_id = @userId)
ORDER BY ts.date DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `training_sessions`, `teams`, `user_clubs`
