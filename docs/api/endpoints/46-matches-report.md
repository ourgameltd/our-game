# GET /api/matches/{matchId}/report - Get Match Report

## Endpoint Name
**Get Match Report**

## URL Pattern
```
GET /api/matches/{matchId}/report
```

## Description
Retrieves the match report.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "summary": "Dominant performance from the Reds...",
  "captainId": "p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
  "captainName": "James Wilson",
  "playerOfTheMatch": {
    "playerId": "p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
    "playerName": "Noah Anderson"
  }
}
```

## Required SQL Queries

```sql
SELECT mr.match_id, mr.summary, mr.captain_id,
       CONCAT(p1.first_name, ' ', p1.last_name) as captain_name,
       mr.player_of_match_id,
       CONCAT(p2.first_name, ' ', p2.last_name) as player_of_match_name
FROM match_reports mr
LEFT JOIN players p1 ON p1.id = mr.captain_id
LEFT JOIN players p2 ON p2.id = mr.player_of_match_id
WHERE mr.match_id = @matchId;
```

## Database Tables Used
- `match_reports`, `players`
