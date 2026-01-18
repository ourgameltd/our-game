# GET /api/matches/{matchId}/attendance - Get Attendance List

## Endpoint Name
**Get Match Attendance**

## URL Pattern
```
GET /api/matches/{matchId}/attendance
```

## Description
Retrieves attendance status for all players.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "playerName": "Oliver Thompson",
      "status": "confirmed",
      "respondedAt": "2024-12-10T14:30:00Z"
    }
  ],
  "summary": {
    "confirmed": 8,
    "pending": 2,
    "declined": 1,
    "total": 11
  }
}
```

## Required SQL Queries

```sql
SELECT ma.player_id,
       CONCAT(p.first_name, ' ', p.last_name) as player_name,
       ma.status, ma.responded_at
FROM match_attendance ma
INNER JOIN players p ON p.id = ma.player_id
WHERE ma.match_id = @matchId
ORDER BY ma.status, p.last_name;

SELECT 
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined,
    COUNT(*) as total
FROM match_attendance
WHERE match_id = @matchId;
```

## Database Tables Used
- `match_attendance`, `players`
