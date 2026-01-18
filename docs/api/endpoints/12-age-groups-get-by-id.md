# GET /api/age-groups/{ageGroupId} - Get Age Group Details

## Endpoint Name
**Get Age Group Details**

## URL Pattern
```
GET /api/age-groups/{ageGroupId}
```

## Description
Retrieves detailed information for a specific age group, including coordinators, team details, and player statistics.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- User must have access to the club that owns the age group

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ageGroupId` | string (UUID) | Yes | Unique identifier of the age group |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includeStats` | boolean | No | true | Include statistics |

## Request Headers
```
api-version: 1.0
Authorization: Bearer <token>
```

## Request Example
```http
GET /api/age-groups/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer <token>
```

## Response Example (Success - 200 OK)
```json
{
  "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
  "clubName": "Vale Football Club",
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
      "lastName": "Smith",
      "email": "john.smith@valefc.com",
      "phone": "+44 7700 900100"
    }
  ],
  "statistics": {
    "teamCount": 2,
    "playerCount": 24,
    "coachCount": 4,
    "matchesPlayed": 28,
    "wins": 16,
    "draws": 7,
    "losses": 5,
    "goalsFor": 89,
    "goalsAgainst": 52
  },
  "isArchived": false,
  "createdAt": "2023-08-01T10:00:00Z",
  "updatedAt": "2024-09-01T14:00:00Z"
}
```

## Response Schema

### AgeGroupDetails
```typescript
{
  id: string;
  clubId: string;
  clubName: string;
  name: string;
  code: string;
  level: 'youth' | 'amateur' | 'reserve' | 'senior';
  season: string;
  seasons: string[];
  defaultSquadSize: number;
  description?: string;
  coordinators: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }[];
  statistics?: {
    teamCount: number;
    playerCount: number;
    coachCount: number;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
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
-- Main query
SELECT 
    ag.id,
    ag.club_id,
    c.name as club_name,
    ag.name,
    ag.code,
    ag.level,
    ag.season,
    ag.seasons,
    ag.default_squad_size,
    ag.description,
    ag.is_archived,
    ag.created_at,
    ag.updated_at
FROM age_groups ag
INNER JOIN clubs c ON c.id = ag.club_id
WHERE ag.id = @ageGroupId;

-- Coordinators query
SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.phone
FROM staff s
INNER JOIN age_group_coordinators agc ON agc.staff_id = s.id
WHERE agc.age_group_id = @ageGroupId;

-- Statistics query (if includeStats=true)
SELECT 
    COUNT(DISTINCT t.id) as team_count,
    COUNT(DISTINCT pag.player_id) as player_count,
    COUNT(DISTINCT tc.coach_id) as coach_count,
    COUNT(DISTINCT m.id) as matches_played,
    SUM(CASE 
        WHEN (m.is_home = 1 AND m.home_score > m.away_score) 
            OR (m.is_home = 0 AND m.away_score > m.home_score) 
        THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) as draws,
    SUM(CASE 
        WHEN (m.is_home = 1 AND m.home_score < m.away_score) 
            OR (m.is_home = 0 AND m.away_score < m.home_score) 
        THEN 1 ELSE 0 END) as losses,
    SUM(CASE WHEN m.is_home = 1 THEN m.home_score ELSE m.away_score END) as goals_for,
    SUM(CASE WHEN m.is_home = 1 THEN m.away_score ELSE m.home_score END) as goals_against
FROM age_groups ag
LEFT JOIN teams t ON t.age_group_id = ag.id AND t.is_archived = 0
LEFT JOIN player_age_groups pag ON pag.age_group_id = ag.id
LEFT JOIN team_coaches tc ON tc.team_id = t.id
LEFT JOIN matches m ON m.team_id = t.id AND m.status = 'completed'
WHERE ag.id = @ageGroupId
GROUP BY ag.id;
```

## Database Tables Used
- `age_groups`
- `clubs`
- `staff`, `age_group_coordinators`
- `teams`
- `player_age_groups`
- `team_coaches`
- `matches`

## Business Logic
1. Validate ageGroupId
2. Check user has access to club
3. Fetch age group details
4. Fetch coordinators
5. If includeStats=true, calculate statistics
6. Return details

## Performance Considerations
- Cache age group details
- Index on `age_groups.id`
- Separate query for statistics

## Related Endpoints
- `GET /api/clubs/{clubId}/age-groups`
- `GET /api/age-groups/{ageGroupId}/teams`
- `GET /api/age-groups/{ageGroupId}/players`

## Notes
- Age groups organize teams by player age or category
- Youth age groups named by birth year
- Statistics aggregated from all teams in age group
