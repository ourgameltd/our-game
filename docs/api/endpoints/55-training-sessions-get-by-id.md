# GET /api/training-sessions/{sessionId} - Get Training Session Details

## Endpoint Name
**Get Training Session Details**

## URL Pattern
```
GET /api/training-sessions/{sessionId}
```

## Description
Retrieves detailed information for a training session.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "id": "ts1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "teamId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "teamName": "Reds",
  "date": "2024-12-15T18:00:00Z",
  "duration": 90,
  "location": "Training Ground",
  "focus": "tactical",
  "status": "completed",
  "notes": "Focus on pressing triggers and defensive shape",
  "weather": {"condition": "Clear", "temperature": 8}
}
```

## Required SQL Queries

```sql
SELECT ts.id, ts.team_id, t.name as team_name, ts.date, ts.duration,
       ts.location, ts.focus, ts.status, ts.notes,
       ts.weather_condition, ts.weather_temperature
FROM training_sessions ts
INNER JOIN teams t ON t.id = ts.team_id
WHERE ts.id = @sessionId;
```

## Database Tables Used
- `training_sessions`, `teams`
