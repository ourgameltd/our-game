# GET /api/matches/{matchId}/goals - Get Match Goals

## Endpoint Name
**Get Match Goals**

## URL Pattern
```
GET /api/matches/{matchId}/goals
```

## Description
Retrieves all goals scored in a match.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "g1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "playerId": "p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
      "playerName": "Noah Anderson",
      "minute": 23,
      "assistId": "p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
      "assistName": "Ethan Davies",
      "type": "open-play"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT g.id, g.match_id, g.player_id,
       CONCAT(p1.first_name, ' ', p1.last_name) as player_name,
       g.minute, g.assist_player_id,
       CONCAT(p2.first_name, ' ', p2.last_name) as assist_name,
       g.type
FROM goals g
INNER JOIN players p1 ON p1.id = g.player_id
LEFT JOIN players p2 ON p2.id = g.assist_player_id
WHERE g.match_id = @matchId
ORDER BY g.minute;
```

## Database Tables Used
- `goals`, `players`
