# GET /api/clubs/{clubId}/teams - List Club Teams

## Endpoint Name
**List Club Teams**

## URL Pattern
```
GET /api/clubs/{clubId}/teams
```

## Description
Retrieves a list of all teams within a club, organized by age groups. Includes team details, coach information, and player counts.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- User must have access to the specified club

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clubId` | string (UUID) | Yes | Unique identifier of the club |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `ageGroupId` | string (UUID) | No | - | Filter by age group |
| `includeArchived` | boolean | No | false | Include archived teams |
| `season` | string | No | current | Filter by season |

## Request Headers
```
api-version: 1.0
Authorization: Bearer <token>
```

## Request Example
```http
GET /api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b/teams HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer <token>
```

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "ageGroupId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "ageGroupName": "2014s",
      "name": "Reds",
      "colors": {
        "primary": "#dc2626",
        "secondary": "#ffffff"
      },
      "season": "2024/25",
      "squadSize": 7,
      "coaches": [
        {
          "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
          "firstName": "Michael",
          "lastName": "Robertson",
          "role": "head-coach"
        }
      ],
      "playerCount": 12,
      "isArchived": false
    }
  ]
}
```

## Response Schema

### TeamListItem
```typescript
{
  id: string;
  clubId: string;
  ageGroupId: string;
  ageGroupName: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
  season: string;
  squadSize: number;
  coaches: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  }[];
  playerCount: number;
  isArchived: boolean;
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Required SQL Queries

```sql
SELECT 
    t.id,
    t.club_id,
    t.age_group_id,
    ag.name as age_group_name,
    t.name,
    t.primary_color,
    t.secondary_color,
    t.season,
    t.squad_size,
    t.is_archived,
    COUNT(DISTINCT pt.player_id) as player_count
FROM teams t
INNER JOIN age_groups ag ON ag.id = t.age_group_id
LEFT JOIN player_teams pt ON pt.team_id = t.id
LEFT JOIN players p ON p.id = pt.player_id AND p.is_archived = 0
WHERE t.club_id = @clubId
    AND (@ageGroupId IS NULL OR t.age_group_id = @ageGroupId)
    AND (@includeArchived = 1 OR t.is_archived = 0)
    AND (@season IS NULL OR t.season = @season)
GROUP BY t.id, t.club_id, t.age_group_id, ag.name, t.name, 
         t.primary_color, t.secondary_color, t.season, t.squad_size, t.is_archived
ORDER BY ag.code DESC, t.name;

-- Coaches query
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    tc.role,
    tc.team_id
FROM coaches c
INNER JOIN team_coaches tc ON tc.coach_id = c.id
WHERE tc.team_id IN (SELECT id FROM teams WHERE club_id = @clubId);
```

## Database Tables Used
- `teams`
- `age_groups`
- `player_teams`
- `players`
- `coaches`
- `team_coaches`

## Business Logic
1. Validate clubId
2. Check user access
3. Fetch teams with filters
4. Fetch coaches for teams
5. Group by age group
6. Return organized list

## Performance Considerations
- Index on `teams.club_id`, `teams.age_group_id`
- Cache team lists per club

## Related Endpoints
- `GET /api/teams/{teamId}`
- `GET /api/age-groups/{ageGroupId}/teams`

## Notes
- Teams are organized by age group
- Each team has unique colors within age group
- Squad size determines match format
