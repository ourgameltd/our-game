# GET /api/coaches/{coachId}/specializations - Get Coach Specializations

## Endpoint Name
**Get Coach Specializations**

## URL Pattern
```
GET /api/coaches/{coachId}/specializations
```

## Description
Retrieves specializations for a coach.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": ["Youth Development", "Tactical Training", "Team Building"]
}
```

## Required SQL Queries

```sql
SELECT c.specializations
FROM coaches c
WHERE c.id = @coachId;
```

## Database Tables Used
- `coaches`
