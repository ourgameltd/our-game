# GET /api/teams/{teamId}/coaches - List Team Coaches

## Endpoint Name
**List Team Coaches**

## URL Pattern
```
GET /api/teams/{teamId}/coaches
```

## Description
Retrieves all coaches assigned to a specific team.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | string (UUID) | Yes | Unique identifier of the team |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "firstName": "Michael",
      "lastName": "Robertson",
      "role": "head-coach",
      "specializations": ["Youth Development", "Tactical Training"]
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT c.id, c.first_name, c.last_name, tc.role, c.specializations
FROM coaches c
INNER JOIN team_coaches tc ON tc.coach_id = c.id
WHERE tc.team_id = @teamId AND c.is_archived = 0
ORDER BY 
    CASE tc.role
        WHEN 'head-coach' THEN 1
        WHEN 'assistant-coach' THEN 2
        ELSE 3
    END,
    c.last_name;
```

## Database Tables Used
- `coaches`, `team_coaches`
