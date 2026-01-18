# GET /api/coaches - List Coaches

## Endpoint Name
**List Coaches**

## URL Pattern
```
GET /api/coaches
```

## Description
Retrieves a paginated list of coaches with filtering.

## Authentication
- **Required**: Yes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `pageSize` | integer | No | 30 | Items per page |
| `clubId` | string | No | - | Filter by club |
| `role` | string | No | - | Filter by role |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "firstName": "Michael",
      "lastName": "Robertson",
      "role": "head-coach",
      "specializations": ["Youth Development"]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 30,
    "totalCount": 18
  }
}
```

## Required SQL Queries

```sql
SELECT c.id, c.club_id, c.first_name, c.last_name, c.role, c.specializations
FROM coaches c
WHERE c.is_archived = 0
    AND (@clubId IS NULL OR c.club_id = @clubId)
    AND (@role IS NULL OR c.role = @role)
    AND EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = c.club_id AND uc.user_id = @userId)
ORDER BY c.last_name, c.first_name
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

## Database Tables Used
- `coaches`, `user_clubs`
