# GET /api/matches/{matchId}/substitutions - Get Match Substitutions

## Endpoint Name
**Get Match Substitutions**

## URL Pattern
```
GET /api/matches/{matchId}/substitutions
```

## Description
Retrieves all substitutions from a match.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "s1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "minute": 75,
      "playerOut": {"id": "p12d4e5f", "name": "Ethan Davies"},
      "playerIn": {"id": "p29f6a7b", "name": "Charlie Roberts"}
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT s.id, s.match_id, s.minute, s.player_out_id,
       CONCAT(p1.first_name, ' ', p1.last_name) as player_out_name,
       s.player_in_id,
       CONCAT(p2.first_name, ' ', p2.last_name) as player_in_name
FROM substitutions s
INNER JOIN players p1 ON p1.id = s.player_out_id
INNER JOIN players p2 ON p2.id = s.player_in_id
WHERE s.match_id = @matchId
ORDER BY s.minute;
```

## Database Tables Used
- `substitutions`, `players`
