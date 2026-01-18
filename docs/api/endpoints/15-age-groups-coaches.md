# GET /api/age-groups/{ageGroupId}/coaches - List Age Group Coaches

## Endpoint Name
**List Age Group Coaches**

## URL Pattern
```
GET /api/age-groups/{ageGroupId}/coaches
```

## Description
Retrieves all coaches working with teams in an age group.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ageGroupId` | string (UUID) | Yes | Unique identifier of the age group |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "firstName": "Michael",
      "lastName": "Robertson",
      "role": "head-coach",
      "teams": ["Reds", "Blues"]
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT DISTINCT c.id, c.first_name, c.last_name, c.role
FROM coaches c
INNER JOIN team_coaches tc ON tc.coach_id = c.id
INNER JOIN teams t ON t.id = tc.team_id
WHERE t.age_group_id = @ageGroupId AND c.is_archived = 0
ORDER BY c.last_name, c.first_name;
```

## Database Tables Used
- `coaches`, `team_coaches`, `teams`
