# GET /api/players - List Players

## Endpoint Name
**List Players**

## URL Pattern
```
GET /api/players
```

## Description
Retrieves a paginated list of players with filtering options.

## Authentication
- **Required**: Yes
- **Roles**: admin, coach, staff

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 30 | Items per page |
| `clubId` | string | No | - | Filter by club |
| `ageGroupId` | string | No | - | Filter by age group |
| `teamId` | string | No | - | Filter by team |
| `search` | string | No | - | Search by name |

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
      "preferredPositions": ["GK"],
      "overallRating": 50
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 30,
    "totalCount": 245
  }
}
```

## Required SQL Queries

```sql
SELECT p.id, p.club_id, p.first_name, p.last_name, p.date_of_birth,
       p.preferred_positions, p.overall_rating
FROM players p
WHERE p.is_archived = 0
    AND (@clubId IS NULL OR p.club_id = @clubId)
    AND (@ageGroupId IS NULL OR EXISTS (
        SELECT 1 FROM player_age_groups pag 
        WHERE pag.player_id = p.id AND pag.age_group_id = @ageGroupId
    ))
    AND (@teamId IS NULL OR EXISTS (
        SELECT 1 FROM player_teams pt 
        WHERE pt.player_id = p.id AND pt.team_id = @teamId
    ))
    AND (@search IS NULL OR p.first_name LIKE '%' + @search + '%' 
         OR p.last_name LIKE '%' + @search + '%')
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = p.club_id AND uc.user_id = @userId)
ORDER BY p.last_name, p.first_name
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `players`, `player_age_groups`, `player_teams`, `user_clubs`
