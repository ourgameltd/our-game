# GET /api/teams/{teamId}/players - List Team Players

## Endpoint Name
**List Team Players**

## URL Pattern
```
GET /api/teams/{teamId}/players
```

## Description
Retrieves all players assigned to a specific team.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | string (UUID) | Yes | Unique identifier of the team |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "firstName": "Oliver",
      "lastName": "Thompson",
      "squadNumber": 1,
      "preferredPositions": ["GK"],
      "overallRating": 50
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT p.id, p.first_name, p.last_name, pt.squad_number,
       p.preferred_positions, p.overall_rating
FROM players p
INNER JOIN player_teams pt ON pt.player_id = p.id
WHERE pt.team_id = @teamId AND p.is_archived = 0
ORDER BY pt.squad_number, p.last_name;
```

## Database Tables Used
- `players`, `player_teams`
