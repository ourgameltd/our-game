# GET /api/clubs/{clubId}/age-groups - List Age Groups for Club

## Endpoint Name
**List Club Age Groups**

## URL Pattern
```
GET /api/clubs/{clubId}/age-groups
```

## Description
Retrieves a list of age groups within a specific club, including coordinators and team counts. Age groups represent different age categories (e.g., 2014s, 2013s, Amateur, Senior).

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
| `includeArchived` | boolean | No | false | Include archived age groups |
| `season` | string | No | current | Filter by season (e.g., "2024/25") |

## Request Headers
```
api-version: 1.0
Authorization: Bearer <token>
Content-Type: application/json
```

## Request Example
```http
GET /api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b/age-groups HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer <token>
```

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "name": "2014s",
      "code": "2014",
      "level": "youth",
      "season": "2024/25",
      "seasons": ["2024/25", "2023/24"],
      "defaultSquadSize": 7,
      "description": "Under-11 age group for players born in 2014",
      "coordinators": [
        {
          "id": "staff-1",
          "firstName": "John",
          "lastName": "Smith"
        }
      ],
      "teamCount": 2,
      "playerCount": 24,
      "isArchived": false
    },
    {
      "id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "name": "Amateur",
      "code": "amateur",
      "level": "amateur",
      "season": "2024/25",
      "seasons": ["2024/25"],
      "defaultSquadSize": 11,
      "description": "Adult amateur teams for recreational players",
      "coordinators": [
        {
          "id": "staff-4",
          "firstName": "Mike",
          "lastName": "Anderson"
        }
      ],
      "teamCount": 1,
      "playerCount": 18,
      "isArchived": false
    }
  ]
}
```

## Response Schema

### AgeGroupListItem
```typescript
{
  id: string;
  clubId: string;
  name: string;                  // e.g., "2014s", "Amateur", "Senior"
  code: string;                  // e.g., "2014", "amateur", "senior"
  level: 'youth' | 'amateur' | 'reserve' | 'senior';
  season: string;                // Current season
  seasons: string[];             // All seasons this age group has been active
  defaultSquadSize: number;      // Default squad size (4, 5, 7, 9, or 11)
  description?: string;
  coordinators: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  teamCount: number;
  playerCount: number;
  isArchived: boolean;
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Returns list of age groups |
| 400 | Bad Request - Invalid clubId format |
| 401 | Unauthorized |
| 403 | Forbidden - User doesn't have access to this club |
| 404 | Not Found - Club doesn't exist |
| 500 | Internal Server Error |

## Required SQL Queries

### Main Query
```sql
SELECT 
    ag.id,
    ag.club_id,
    ag.name,
    ag.code,
    ag.level,
    ag.season,
    ag.seasons,
    ag.default_squad_size,
    ag.description,
    ag.is_archived,
    COUNT(DISTINCT t.id) as team_count,
    COUNT(DISTINCT pag.player_id) as player_count
FROM age_groups ag
LEFT JOIN teams t ON t.age_group_id = ag.id AND t.is_archived = 0
LEFT JOIN player_age_groups pag ON pag.age_group_id = ag.id
LEFT JOIN players p ON p.id = pag.player_id AND p.is_archived = 0
WHERE ag.club_id = @clubId
    AND (@includeArchived = 1 OR ag.is_archived = 0)
    AND (@season IS NULL OR ag.season = @season)
GROUP BY ag.id, ag.club_id, ag.name, ag.code, ag.level, ag.season, 
         ag.seasons, ag.default_squad_size, ag.description, ag.is_archived
ORDER BY 
    CASE ag.level
        WHEN 'senior' THEN 1
        WHEN 'reserve' THEN 2
        WHEN 'amateur' THEN 3
        WHEN 'youth' THEN 4
    END,
    ag.code DESC;
```

### Coordinators Query
```sql
SELECT 
    s.id,
    s.first_name,
    s.last_name,
    agc.age_group_id
FROM staff s
INNER JOIN age_group_coordinators agc ON agc.staff_id = s.id
WHERE agc.age_group_id IN (SELECT id FROM age_groups WHERE club_id = @clubId);
```

## Database Tables Used
- `age_groups` - Main age group information
- `teams` - For team count
- `player_age_groups` - Junction table for player assignments
- `players` - For player count
- `staff`, `age_group_coordinators` - For coordinator information
- `user_clubs` - For authorization

## Business Logic
1. Validate clubId format
2. Check user has access to club
3. Fetch age groups with counts
4. Fetch coordinators for each age group
5. Order by level (senior → reserve → amateur → youth) then by code
6. Return list

## Performance Considerations
- Index on `age_groups.club_id`
- Index on `age_groups.season`
- Cache age group lists (they don't change frequently)
- Use LEFT JOINs to include age groups with no teams/players

## Related Endpoints
- `GET /api/clubs/{clubId}` - Get club details
- `GET /api/age-groups/{ageGroupId}` - Get age group details
- `GET /api/age-groups/{ageGroupId}/teams` - Get age group teams
- `GET /api/age-groups/{ageGroupId}/players` - Get age group players

## Notes
- Age groups are organized hierarchically: Club → Age Group → Team
- Youth age groups are typically named by birth year (e.g., "2014s")
- Adult categories include Amateur, Reserve, and Senior
- Each age group can have multiple teams (e.g., Reds, Blues, Whites)
- Squad size determines formation options (4v4, 5v5, 7v7, 9v9, 11v11)
