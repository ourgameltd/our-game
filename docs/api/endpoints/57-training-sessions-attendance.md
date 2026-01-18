# GET /api/training-sessions/{sessionId}/attendance - Get Session Attendance

## Endpoint Name
**Get Training Session Attendance**

## URL Pattern
```
GET /api/training-sessions/{sessionId}/attendance
```

## Description
Retrieves attendance for a training session.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "playerName": "Oliver Thompson",
      "status": "present",
      "notes": ""
    }
  ],
  "summary": {"present": 11, "absent": 1, "excused": 0, "total": 12}
}
```

## Required SQL Queries

```sql
SELECT ta.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       ta.status, ta.notes
FROM training_attendance ta
INNER JOIN players p ON p.id = ta.player_id
WHERE ta.session_id = @sessionId
ORDER BY p.last_name;

SELECT 
    COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
    COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
    COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused,
    COUNT(*) as total
FROM training_attendance
WHERE session_id = @sessionId;
```

## Database Tables Used
- `training_attendance`, `players`
