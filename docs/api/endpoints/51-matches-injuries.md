# GET /api/matches/{matchId}/injuries - Get Match Injuries

## Endpoint Name
**Get Match Injuries**

## URL Pattern
```
GET /api/matches/{matchId}/injuries
```

## Description
Retrieves all injuries from a match.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "i1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "playerId": "p15f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "playerName": "Lucas Brown",
      "minute": 42,
      "description": "Ankle sprain",
      "severity": "moderate"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT i.id, i.match_id, i.player_id,
       CONCAT(p.first_name, ' ', p.last_name) as player_name,
       i.minute, i.description, i.severity
FROM injuries i
INNER JOIN players p ON p.id = i.player_id
WHERE i.match_id = @matchId
ORDER BY i.minute;
```

## Database Tables Used
- `injuries`, `players`
