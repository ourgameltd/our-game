# GET /api/player-reports/{reportId} - Get Player Report Details

## Endpoint Name
**Get Player Report Details**

## URL Pattern
```
GET /api/player-reports/{reportId}
```

## Description
Retrieves detailed information for a player report card.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "id": "r1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
  "playerName": "Oliver Thompson",
  "period": "Autumn 2024",
  "overallRating": 8.5,
  "strengths": ["Shot stopping", "Positioning", "Communication"],
  "areasForImprovement": ["Distribution", "Coming for crosses"],
  "coachComments": "Excellent progress throughout the term.",
  "createdAt": "2024-12-01",
  "createdBy": "Michael Robertson"
}
```

## Required SQL Queries

```sql
SELECT pr.id, pr.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       pr.period, pr.overall_rating, pr.strengths, pr.areas_for_improvement,
       pr.coach_comments, pr.created_at,
       CONCAT(c.first_name, ' ', c.last_name) as created_by
FROM player_reports pr
INNER JOIN players p ON p.id = pr.player_id
LEFT JOIN coaches c ON c.id = pr.created_by_id
WHERE pr.id = @reportId;
```

## Database Tables Used
- `player_reports`, `players`, `coaches`
