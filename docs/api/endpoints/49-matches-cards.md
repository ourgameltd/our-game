# GET /api/matches/{matchId}/cards - Get Match Cards

## Endpoint Name
**Get Match Cards**

## URL Pattern
```
GET /api/matches/{matchId}/cards
```

## Description
Retrieves all cards (yellow/red) from a match.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "playerId": "p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
      "playerName": "Ethan Davies",
      "type": "yellow",
      "minute": 55,
      "reason": "Tactical foul"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT c.id, c.match_id, c.player_id,
       CONCAT(p.first_name, ' ', p.last_name) as player_name,
       c.type, c.minute, c.reason
FROM cards c
INNER JOIN players p ON p.id = c.player_id
WHERE c.match_id = @matchId
ORDER BY c.minute;
```

## Database Tables Used
- `cards`, `players`
