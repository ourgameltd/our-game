# GET /api/players/{playerId}/development-plans - Get Development Plans

## Endpoint Name
**Get Player Development Plans**

## URL Pattern
```
GET /api/players/{playerId}/development-plans
```

## Description
Retrieves development plans for a player.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "devplan-1",
      "playerId": "p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      "title": "Complete Forward Development - Q1 2025",
      "status": "active",
      "progress": 45,
      "period": {
        "start": "2024-12-01",
        "end": "2025-02-28"
      }
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT dp.id, dp.player_id, dp.title, dp.status, dp.progress,
       dp.period_start, dp.period_end
FROM development_plans dp
WHERE dp.player_id = @playerId
ORDER BY dp.status, dp.created_at DESC;
```

## Database Tables Used
- `development_plans`
