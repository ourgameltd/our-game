# GET /api/teams/{teamId} - Get Team Details

## Endpoint Name
**Get Team Details**

## URL Pattern
```
GET /api/teams/{teamId}
```

## Description
Retrieves detailed information for a specific team.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | string (UUID) | Yes | Unique identifier of the team |

## Response Example (Success - 200 OK)
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
  "clubName": "Vale FC",
  "ageGroupId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "ageGroupName": "2014s",
  "name": "Reds",
  "colors": { "primary": "#dc2626", "secondary": "#ffffff" },
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
```

## Required SQL Queries

```sql
SELECT t.id, t.club_id, c.name as club_name,
       t.age_group_id, ag.name as age_group_name,
       t.name, t.primary_color, t.secondary_color,
       t.season, t.squad_size, t.is_archived
FROM teams t
INNER JOIN clubs c ON c.id = t.club_id
INNER JOIN age_groups ag ON ag.id = t.age_group_id
WHERE t.id = @teamId;

-- Coaches
SELECT c.id, c.first_name, c.last_name, tc.role
FROM coaches c
INNER JOIN team_coaches tc ON tc.coach_id = c.id
WHERE tc.team_id = @teamId;

-- Player count
SELECT COUNT(*) FROM player_teams WHERE team_id = @teamId;
```

## Database Tables Used
- `teams`, `clubs`, `age_groups`, `coaches`, `team_coaches`, `player_teams`
