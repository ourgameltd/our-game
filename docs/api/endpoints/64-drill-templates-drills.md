# GET /api/drill-templates/{templateId}/drills - Get Template Drills

## Endpoint Name
**Get Drill Template Drills**

## URL Pattern
```
GET /api/drill-templates/{templateId}/drills
```

## Description
Retrieves all drills in a drill template.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "drillId": "d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "Passing Triangles",
      "duration": 10,
      "orderIndex": 1
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT dtd.drill_id, d.name, dtd.duration, dtd.order_index
FROM drill_template_drills dtd
INNER JOIN drills d ON d.id = dtd.drill_id
WHERE dtd.template_id = @templateId
ORDER BY dtd.order_index;
```

## Database Tables Used
- `drill_template_drills`, `drills`
