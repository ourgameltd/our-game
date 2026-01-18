# GET /api/drill-templates - List Drill Templates

## Endpoint Name
**List Drill Templates**

## URL Pattern
```
GET /api/drill-templates
```

## Description
Retrieves a list of drill templates.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "dt1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "name": "Warm-up Routine",
      "category": "warm-up",
      "drillCount": 3,
      "totalDuration": 20
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT dt.id, dt.name, dt.category,
       COUNT(dtd.drill_id) as drill_count,
       SUM(dtd.duration) as total_duration
FROM drill_templates dt
LEFT JOIN drill_template_drills dtd ON dtd.template_id = dt.id
GROUP BY dt.id, dt.name, dt.category
ORDER BY dt.name;
```

## Database Tables Used
- `drill_templates`, `drill_template_drills`
