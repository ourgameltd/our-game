# GET /api/players/{playerId}/evaluations - Get Player Evaluations

## Endpoint Name
**Get Player Evaluations**

## URL Pattern
```
GET /api/players/{playerId}/evaluations
```

## Description
Retrieves coach evaluations for a player.

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
      "id": "eval-1",
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "coachId": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "coachName": "Michael Robertson",
      "date": "2024-12-01",
      "rating": 8.5,
      "strengths": ["Shot stopping", "Communication"],
      "areasForImprovement": ["Distribution", "Coming for crosses"],
      "comments": "Excellent progress in positioning."
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT e.id, e.player_id, e.coach_id, 
       CONCAT(c.first_name, ' ', c.last_name) as coach_name,
       e.date, e.rating, e.strengths, e.areas_for_improvement, e.comments
FROM player_evaluations e
INNER JOIN coaches c ON c.id = e.coach_id
WHERE e.player_id = @playerId
ORDER BY e.date DESC;
```

## Database Tables Used
- `player_evaluations`, `coaches`
