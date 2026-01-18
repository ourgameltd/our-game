# GET /api/teams/{teamId}/matches - List Team Matches

## Endpoint Name
**List Team Matches**

## URL Pattern
```
GET /api/teams/{teamId}/matches
```

## Description
Retrieves all matches for a team with pagination and filtering.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | string (UUID) | Yes | Unique identifier of the team |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by status (scheduled, completed, etc.) |
| `from` | string | No | - | Start date (ISO 8601) |
| `to` | string | No | - | End date (ISO 8601) |
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 20 | Items per page |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "date": "2024-12-13T15:00:00Z",
      "opposition": "Riverside United",
      "location": "Community Sports Ground",
      "isHome": true,
      "status": "completed",
      "score": { "home": 2, "away": 1 }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 28
  }
}
```

## Required SQL Queries

```sql
SELECT m.id, m.date, m.opposition, m.location, m.is_home,
       m.status, m.home_score, m.away_score
FROM matches m
WHERE m.team_id = @teamId
    AND (@status IS NULL OR m.status = @status)
    AND (@from IS NULL OR m.date >= @from)
    AND (@to IS NULL OR m.date <= @to)
ORDER BY m.date DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `matches`
