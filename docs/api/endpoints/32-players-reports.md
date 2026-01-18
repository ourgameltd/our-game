# GET /api/players/{playerId}/reports - List Player Report Cards

## Endpoint Name
**List Player Report Cards**

## URL Pattern
```
GET /api/players/{playerId}/reports
```

## Description
Retrieves report cards for a player.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `playerId` | string (UUID) | Yes | Unique identifier of the player |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "r1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "createdAt": "2024-12-01",
      "period": "Autumn 2024",
      "overallRating": 8.5,
      "strengths": ["Shot stopping", "Positioning"],
      "areasForImprovement": ["Distribution", "Coming for crosses"]
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT r.id, r.player_id, r.created_at, r.period,
       r.overall_rating, r.strengths, r.areas_for_improvement
FROM player_reports r
WHERE r.player_id = @playerId
ORDER BY r.created_at DESC;
```

## Database Tables Used
- `player_reports`
