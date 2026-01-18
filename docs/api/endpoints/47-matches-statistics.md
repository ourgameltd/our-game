# GET /api/matches/{matchId}/statistics - Get Match Statistics

## Endpoint Name
**Get Match Statistics**

## URL Pattern
```
GET /api/matches/{matchId}/statistics
```

## Description
Retrieves match statistics.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "possession": {"home": 58, "away": 42},
  "shots": {"home": 12, "away": 8},
  "shotsOnTarget": {"home": 6, "away": 3},
  "corners": {"home": 5, "away": 2},
  "fouls": {"home": 8, "away": 12}
}
```

## Required SQL Queries

```sql
SELECT ms.*
FROM match_statistics ms
WHERE ms.match_id = @matchId;
```

## Database Tables Used
- `match_statistics`
