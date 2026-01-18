# GET /api/teams - List Teams

## Endpoint Name
**List Teams**

## URL Pattern
```
GET /api/teams
```

## Description
Retrieves a paginated list of teams with filtering options.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 30 | Items per page |
| `clubId` | string | No | - | Filter by club |
| `ageGroupId` | string | No | - | Filter by age group |
| `search` | string | No | - | Search by team name |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "clubName": "Vale FC",
      "ageGroupId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "ageGroupName": "2014s",
      "name": "Reds",
      "colors": { "primary": "#dc2626", "secondary": "#ffffff" },
      "playerCount": 12,
      "coachCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 30,
    "totalCount": 12,
    "totalPages": 1
  }
}
```

## Required SQL Queries

```sql
SELECT t.id, t.club_id, c.name as club_name,
       t.age_group_id, ag.name as age_group_name,
       t.name, t.primary_color, t.secondary_color,
       COUNT(DISTINCT pt.player_id) as player_count,
       COUNT(DISTINCT tc.coach_id) as coach_count
FROM teams t
INNER JOIN clubs c ON c.id = t.club_id
INNER JOIN age_groups ag ON ag.id = t.age_group_id
LEFT JOIN player_teams pt ON pt.team_id = t.id
LEFT JOIN team_coaches tc ON tc.team_id = t.id
WHERE t.is_archived = 0
    AND (@clubId IS NULL OR t.club_id = @clubId)
    AND (@ageGroupId IS NULL OR t.age_group_id = @ageGroupId)
    AND (@search IS NULL OR t.name LIKE '%' + @search + '%')
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.club_id AND uc.user_id = @userId)
GROUP BY t.id, t.club_id, c.name, t.age_group_id, ag.name, t.name, t.primary_color, t.secondary_color
ORDER BY c.name, ag.code DESC, t.name
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `teams`, `clubs`, `age_groups`, `player_teams`, `team_coaches`, `user_clubs`
