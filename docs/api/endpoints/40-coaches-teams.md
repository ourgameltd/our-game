# GET /api/coaches/{coachId}/teams - List Coach Teams

## Endpoint Name
**List Coach Teams**

## URL Pattern
```
GET /api/coaches/{coachId}/teams
```

## Description
Retrieves all teams coached by a specific coach.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "teamId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "teamName": "Reds",
      "ageGroupName": "2014s",
      "role": "head-coach"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT t.id as team_id, t.name as team_name, ag.name as age_group_name, tc.role
FROM teams t
INNER JOIN age_groups ag ON ag.id = t.age_group_id
INNER JOIN team_coaches tc ON tc.team_id = t.id
WHERE tc.coach_id = @coachId AND t.is_archived = 0
ORDER BY ag.code DESC, t.name;
```

## Database Tables Used
- `teams`, `age_groups`, `team_coaches`
