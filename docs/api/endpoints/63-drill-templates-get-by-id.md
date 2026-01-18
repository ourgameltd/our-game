# GET /api/drill-templates/{templateId} - Get Drill Template Details

## Endpoint Name
**Get Drill Template Details**

## URL Pattern
```
GET /api/drill-templates/{templateId}
```

## Description
Retrieves detailed information for a drill template.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "id": "dt1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "name": "Warm-up Routine",
  "category": "warm-up",
  "description": "Standard warm-up sequence",
  "createdBy": "John Smith",
  "createdAt": "2024-01-15"
}
```

## Required SQL Queries

```sql
SELECT dt.id, dt.name, dt.category, dt.description,
       CONCAT(u.first_name, ' ', u.last_name) as created_by,
       dt.created_at
FROM drill_templates dt
LEFT JOIN users u ON u.id = dt.created_by_id
WHERE dt.id = @templateId;
```

## Database Tables Used
- `drill_templates`, `users`
