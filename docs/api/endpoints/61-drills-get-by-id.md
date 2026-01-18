# GET /api/drills/{drillId} - Get Drill Details

## Endpoint Name
**Get Drill Details**

## URL Pattern
```
GET /api/drills/{drillId}
```

## Description
Retrieves detailed information for a specific drill.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "id": "d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "name": "Passing Triangles",
  "category": "passing",
  "intensity": "medium",
  "duration": 15,
  "minPlayers": 6,
  "maxPlayers": 12,
  "description": "Triangle passing drill to improve accuracy and movement",
  "equipment": ["Cones", "Balls"],
  "instructions": "Set up triangles..."
}
```

## Required SQL Queries

```sql
SELECT d.*
FROM drills d
WHERE d.id = @drillId;
```

## Database Tables Used
- `drills`
