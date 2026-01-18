# GET /api/matches/{matchId}/lineup - Get Match Lineup

## Endpoint Name
**Get Match Lineup**

## URL Pattern
```
GET /api/matches/{matchId}/lineup
```

## Description
Retrieves the lineup for a match.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "formationId": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "formationName": "4-4-2 Classic",
  "starting": [
    {
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "playerName": "Oliver Thompson",
      "position": "GK",
      "squadNumber": 1
    }
  ],
  "substitutes": []
}
```

## Required SQL Queries

```sql
SELECT m.id as match_id, m.formation_id, f.name as formation_name
FROM matches m
LEFT JOIN formations f ON f.id = m.formation_id
WHERE m.id = @matchId;

SELECT ml.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       ml.position, ml.squad_number, ml.is_substitute
FROM match_lineups ml
INNER JOIN players p ON p.id = ml.player_id
WHERE ml.match_id = @matchId
ORDER BY ml.is_substitute, ml.squad_number;
```

## Database Tables Used
- `matches`, `formations`, `match_lineups`, `players`
