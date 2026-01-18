# GET /api/coaches/{coachId}/biography - Get Coach Biography

## Endpoint Name
**Get Coach Biography**

## URL Pattern
```
GET /api/coaches/{coachId}/biography
```

## Description
Retrieves biography for a coach.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "coachId": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "biography": "Experienced youth coach with over 15 years developing young talent..."
}
```

## Required SQL Queries

```sql
SELECT c.id as coach_id, c.biography
FROM coaches c
WHERE c.id = @coachId;
```

## Database Tables Used
- `coaches`
