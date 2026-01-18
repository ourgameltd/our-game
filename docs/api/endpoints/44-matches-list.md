# GET /api/matches - List Matches

## Endpoint Name
**List Matches**

## URL Pattern
```
GET /api/matches
```

## Description
Retrieves a paginated list of matches with filtering.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 20 | Items per page |
| `teamId` | string | No | - | Filter by team |
| `status` | string | No | - | Filter by status |
| `from` | string | No | - | Start date |
| `to` | string | No | - | End date |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "teamId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "teamName": "Reds",
      "date": "2024-12-13T15:00:00Z",
      "opposition": "Riverside United",
      "isHome": true,
      "status": "completed",
      "score": {"home": 2, "away": 1}
    }
  ],
  "pagination": {"page": 1, "pageSize": 20, "totalCount": 156}
}
```

## Required SQL Queries

```sql
SELECT m.id, m.team_id, t.name as team_name, m.date, m.opposition,
       m.is_home, m.status, m.home_score, m.away_score
FROM matches m
INNER JOIN teams t ON t.id = m.team_id
WHERE (@teamId IS NULL OR m.team_id = @teamId)
    AND (@status IS NULL OR m.status = @status)
    AND (@from IS NULL OR m.date >= @from)
    AND (@to IS NULL OR m.date <= @to)
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.club_id AND uc.user_id = @userId)
ORDER BY m.date DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `matches`, `teams`, `user_clubs`
