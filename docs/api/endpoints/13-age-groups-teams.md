# GET /api/age-groups/{ageGroupId}/teams - List Age Group Teams

## Endpoint Name
**List Age Group Teams**

## URL Pattern
```
GET /api/age-groups/{ageGroupId}/teams
```

## Description
Retrieves all teams within a specific age group.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- User must have access to the club

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ageGroupId` | string (UUID) | Yes | Unique identifier of the age group |

## Request Headers
```
api-version: 1.0
Authorization: Bearer <token>
```

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Reds",
      "colors": {
        "primary": "#dc2626",
        "secondary": "#ffffff"
      },
      "playerCount": 12,
      "coachCount": 2
    }
  ]
}
```

## Response Schema

```typescript
{
  id: string;
  name: string;
  colors: { primary: string; secondary: string; };
  playerCount: number;
  coachCount: number;
}
```

## Required SQL Queries

```sql
SELECT t.id, t.name, t.primary_color, t.secondary_color,
       COUNT(DISTINCT pt.player_id) as player_count,
       COUNT(DISTINCT tc.coach_id) as coach_count
FROM teams t
LEFT JOIN player_teams pt ON pt.team_id = t.id
LEFT JOIN team_coaches tc ON tc.team_id = t.id
WHERE t.age_group_id = @ageGroupId AND t.is_archived = 0
GROUP BY t.id, t.name, t.primary_color, t.secondary_color
ORDER BY t.name;
```

## Database Tables Used
- `teams`, `player_teams`, `team_coaches`

## Related Endpoints
- `GET /api/age-groups/{ageGroupId}`
- `GET /api/teams/{teamId}`
