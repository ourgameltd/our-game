# GET /api/player-reports/{reportId}/development-actions - Get Development Actions

## Endpoint Name
**Get Report Development Actions**

## URL Pattern
```
GET /api/player-reports/{reportId}/development-actions
```

## Description
Retrieves recommended development actions from a report.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "da1",
      "reportId": "r1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "action": "Practice distribution with both feet",
      "priority": "high",
      "category": "technical"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT da.id, da.report_id, da.action, da.priority, da.category
FROM development_actions da
WHERE da.report_id = @reportId
ORDER BY 
    CASE da.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
    END;
```

## Database Tables Used
- `development_actions`
