# GET /api/age-groups/{ageGroupId}/players - List Age Group Players

## Endpoint Name
**List Age Group Players**

## URL Pattern
```
GET /api/age-groups/{ageGroupId}/players
```

## Description
Retrieves paginated list of players in an age group.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ageGroupId` | string (UUID) | Yes | Unique identifier of the age group |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 30 | Items per page |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "firstName": "Oliver",
      "lastName": "Thompson",
      "dateOfBirth": "2014-03-15",
      "preferredPositions": ["GK"],
      "teams": ["Reds"],
      "overallRating": 50
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 30,
    "totalCount": 24,
    "totalPages": 1
  }
}
```

## Required SQL Queries

```sql
SELECT p.id, p.first_name, p.last_name, p.date_of_birth,
       p.preferred_positions, p.overall_rating
FROM players p
INNER JOIN player_age_groups pag ON pag.player_id = p.id
WHERE pag.age_group_id = @ageGroupId AND p.is_archived = 0
ORDER BY p.last_name, p.first_name
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `players`, `player_age_groups`
