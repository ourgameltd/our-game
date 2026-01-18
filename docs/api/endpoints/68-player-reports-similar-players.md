# GET /api/player-reports/{reportId}/similar-players - Get Similar Professional Players

## Endpoint Name
**Get Similar Professional Players**

## URL Pattern
```
GET /api/player-reports/{reportId}/similar-players
```

## Description
Retrieves similar professional players for modeling and development.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "sp1",
      "reportId": "r1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "Alisson Becker",
      "position": "GK",
      "club": "Liverpool",
      "league": "Premier League",
      "similarityReason": "Excellent distribution and command of penalty area"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT sp.id, sp.report_id, sp.name, sp.position, sp.club, sp.league, sp.similarity_reason
FROM similar_players sp
WHERE sp.report_id = @reportId
ORDER BY sp.order_index;
```

## Database Tables Used
- `similar_players`
