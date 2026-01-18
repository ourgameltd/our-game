# GET /api/development-plans/{planId} - Get Development Plan Details

## Endpoint Name
**Get Development Plan Details**

## URL Pattern
```
GET /api/development-plans/{planId}
```

## Description
Retrieves detailed information for a development plan.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "id": "devplan-1",
  "playerId": "p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
  "playerName": "Carlos Fernandez",
  "title": "Complete Forward Development - Q1 2025",
  "description": "Focus on aerial ability and defensive work rate",
  "status": "active",
  "progress": 45,
  "period": {"start": "2024-12-01", "end": "2025-02-28"},
  "createdBy": "Michael Robertson",
  "createdAt": "2024-12-01"
}
```

## Required SQL Queries

```sql
SELECT dp.id, dp.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       dp.title, dp.description, dp.status, dp.progress,
       dp.period_start, dp.period_end,
       CONCAT(c.first_name, ' ', c.last_name) as created_by,
       dp.created_at
FROM development_plans dp
INNER JOIN players p ON p.id = dp.player_id
LEFT JOIN coaches c ON c.id = dp.created_by_id
WHERE dp.id = @planId;
```

## Database Tables Used
- `development_plans`, `players`, `coaches`
