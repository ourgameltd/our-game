# GET /api/development-plans - List Development Plans

## Endpoint Name
**List Development Plans**

## URL Pattern
```
GET /api/development-plans
```

## Description
Retrieves a paginated list of development plans with filtering.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 20 | Items per page |
| `playerId` | string | No | - | Filter by player |
| `status` | string | No | - | Filter by status |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "devplan-1",
      "playerId": "p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      "playerName": "Carlos Fernandez",
      "title": "Complete Forward Development - Q1 2025",
      "status": "active",
      "progress": 45,
      "period": {"start": "2024-12-01", "end": "2025-02-28"}
    }
  ],
  "pagination": {"page": 1, "pageSize": 20, "totalCount": 45}
}
```

## Required SQL Queries

```sql
SELECT dp.id, dp.player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name,
       dp.title, dp.status, dp.progress, dp.period_start, dp.period_end
FROM development_plans dp
INNER JOIN players p ON p.id = dp.player_id
WHERE (@playerId IS NULL OR dp.player_id = @playerId)
    AND (@status IS NULL OR dp.status = @status)
ORDER BY dp.status, dp.created_at DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `development_plans`, `players`
