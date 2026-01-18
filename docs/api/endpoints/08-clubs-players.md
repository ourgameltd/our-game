# GET /api/clubs/{clubId}/players - List Club Players

## Endpoint Name
**List Club Players**

## URL Pattern
```
GET /api/clubs/{clubId}/players
```

## Description
Retrieves a paginated list of all players within a club with filtering options.

## Authentication
- **Required**: Yes
- **Roles**: admin, coach, staff

## Authorization
- User must have access to the club

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clubId` | string (UUID) | Yes | Unique identifier of the club |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 30 | Items per page (max: 100) |
| `ageGroupId` | string | No | - | Filter by age group |
| `teamId` | string | No | - | Filter by team |
| `position` | string | No | - | Filter by position |
| `search` | string | No | - | Search by name |
| `includeArchived` | boolean | No | false | Include archived players |

## Request Headers
```
api-version: 1.0
Authorization: Bearer <token>
```

## Request Example
```http
GET /api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b/players?page=1&pageSize=20 HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer <token>
```

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "firstName": "Oliver",
      "lastName": "Thompson",
      "dateOfBirth": "2014-03-15",
      "age": 10,
      "photo": "https://storage.ourgame.com/players/oliver-thompson.jpg",
      "preferredPositions": ["GK"],
      "ageGroups": ["2014s"],
      "teams": ["Reds"],
      "overallRating": 50,
      "isArchived": false
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Response Schema

### PlayerListItem
```typescript
{
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  photo?: string;
  preferredPositions: string[];
  ageGroups: string[];
  teams: string[];
  overallRating: number;
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
    p.id,
    p.club_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.photo_url,
    p.preferred_positions,
    p.overall_rating,
    p.is_archived
FROM players p
WHERE p.club_id = @clubId
    AND (@ageGroupId IS NULL OR EXISTS (
        SELECT 1 FROM player_age_groups pag 
        WHERE pag.player_id = p.id AND pag.age_group_id = @ageGroupId
    ))
    AND (@teamId IS NULL OR EXISTS (
        SELECT 1 FROM player_teams pt 
        WHERE pt.player_id = p.id AND pt.team_id = @teamId
    ))
    AND (@position IS NULL OR p.preferred_positions LIKE '%' + @position + '%')
    AND (@search IS NULL OR p.first_name LIKE '%' + @search + '%' 
         OR p.last_name LIKE '%' + @search + '%')
    AND (@includeArchived = 1 OR p.is_archived = 0)
ORDER BY p.last_name, p.first_name
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

-- Count query
SELECT COUNT(*)
FROM players p
WHERE p.club_id = @clubId
    AND (@ageGroupId IS NULL OR EXISTS (...))
    AND (@includeArchived = 1 OR p.is_archived = 0);
```

## Database Tables Used
- `players`
- `player_age_groups`
- `player_teams`

## Business Logic
1. Validate clubId and parameters
2. Check user authorization
3. Build filtered query
4. Execute with pagination
5. Get age groups and teams for each player
6. Calculate ages
7. Return paginated results

## Performance Considerations
- Index on `players.club_id`
- Index on `players.first_name`, `players.last_name`
- Cache player lists with short TTL

## Related Endpoints
- `GET /api/players/{playerId}`
- `GET /api/teams/{teamId}/players`

## Notes
- Age calculated from date of birth
- Players can belong to multiple age groups/teams
- Overall rating calculated from attributes
