# GET /api/clubs - List All Clubs

## Endpoint Name
**List All Clubs**

## URL Pattern
```
GET /api/clubs
```

## Description
Retrieves a paginated list of all football clubs that the authenticated user has access to. Supports filtering and sorting options.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users (admin, coach, player, parent, fan)

## Authorization
- Admins can see all clubs
- Users can only see clubs they are affiliated with (via clubId in user profile)
- Returns clubs filtered by user's club affiliations

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination (min: 1) |
| `pageSize` | integer | No | 30 | Number of items per page (min: 1, max: 100) |
| `includeArchived` | boolean | No | false | Include archived clubs in results |
| `search` | string | No | - | Search term for club name or shortName |
| `country` | string | No | - | Filter by country |
| `sortBy` | string | No | name | Sort field: `name`, `founded`, `location` |
| `sortOrder` | string | No | asc | Sort order: `asc` or `desc` |

## Request Headers
```
api-version: 1.0
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Request Example
```http
GET /api/clubs?page=1&pageSize=10&search=Vale&sortBy=name&sortOrder=asc HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "name": "Vale Football Club",
      "shortName": "Vale FC",
      "logo": "https://storage.ourgame.com/assets/vale-crest.jpg",
      "colors": {
        "primary": "#1a472a",
        "secondary": "#ffd700",
        "accent": "#ffffff"
      },
      "location": {
        "city": "Vale",
        "country": "England",
        "venue": "Community Sports Ground",
        "address": "123 Football Lane, Vale"
      },
      "founded": 1950,
      "isArchived": false,
      "playerCount": 45,
      "teamCount": 6,
      "coachCount": 8
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalCount": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Response Example (No Results - 200 OK)
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalCount": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Response Example (Unauthorized - 401)
```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication token is missing or invalid",
  "instance": "/api/clubs"
}
```

## Response Example (Validation Error - 400)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid query parameters",
  "errors": {
    "pageSize": ["pageSize must be between 1 and 100"]
  },
  "instance": "/api/clubs"
}
```

## Response Schema

### ClubListItem
```typescript
{
  id: string;                    // UUID
  name: string;                  // Full club name
  shortName: string;             // Short name/abbreviation
  logo: string;                  // URL to club logo
  colors: {
    primary: string;             // Hex color
    secondary: string;           // Hex color
    accent?: string;             // Optional hex color
  };
  location: {
    city: string;
    country: string;
    venue: string;
    address?: string;
  };
  founded: number;               // Year founded
  isArchived: boolean;
  playerCount: number;           // Total active players
  teamCount: number;             // Total active teams
  coachCount: number;            // Total active coaches
}
```

### PaginationMetadata
```typescript
{
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Returns list of clubs (may be empty) |
| 400 | Bad Request - Invalid query parameters |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - User doesn't have permission to access clubs |
| 500 | Internal Server Error - Server-side error occurred |

## Required SQL Queries

### Main Query
```sql
-- Get clubs with counts, filtered by user access
SELECT 
    c.id,
    c.name,
    c.short_name,
    c.logo_url,
    c.primary_color,
    c.secondary_color,
    c.accent_color,
    c.city,
    c.country,
    c.venue,
    c.address,
    c.founded,
    c.is_archived,
    COUNT(DISTINCT p.id) as player_count,
    COUNT(DISTINCT t.id) as team_count,
    COUNT(DISTINCT co.id) as coach_count
FROM clubs c
LEFT JOIN teams t ON t.club_id = c.id AND t.is_archived = 0
LEFT JOIN players p ON p.club_id = c.id AND p.is_archived = 0
LEFT JOIN coaches co ON co.club_id = c.id AND co.is_archived = 0
WHERE 
    (@includeArchived = 1 OR c.is_archived = 0)
    AND (@search IS NULL OR c.name LIKE '%' + @search + '%' OR c.short_name LIKE '%' + @search + '%')
    AND (@country IS NULL OR c.country = @country)
    AND c.id IN (SELECT club_id FROM user_clubs WHERE user_id = @userId)
GROUP BY c.id, c.name, c.short_name, c.logo_url, c.primary_color, c.secondary_color, 
         c.accent_color, c.city, c.country, c.venue, c.address, c.founded, c.is_archived
ORDER BY 
    CASE WHEN @sortBy = 'name' AND @sortOrder = 'asc' THEN c.name END ASC,
    CASE WHEN @sortBy = 'name' AND @sortOrder = 'desc' THEN c.name END DESC,
    CASE WHEN @sortBy = 'founded' AND @sortOrder = 'asc' THEN c.founded END ASC,
    CASE WHEN @sortBy = 'founded' AND @sortOrder = 'desc' THEN c.founded END DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

### Count Query
```sql
-- Get total count for pagination
SELECT COUNT(DISTINCT c.id)
FROM clubs c
WHERE 
    (@includeArchived = 1 OR c.is_archived = 0)
    AND (@search IS NULL OR c.name LIKE '%' + @search + '%' OR c.short_name LIKE '%' + @search + '%')
    AND (@country IS NULL OR c.country = @country)
    AND c.id IN (SELECT club_id FROM user_clubs WHERE user_id = @userId);
```

## Database Tables Used
- `clubs` - Main club information
- `teams` - For team count
- `players` - For player count
- `coaches` - For coach count
- `user_clubs` - For authorization filtering

## Business Logic
1. Extract and validate query parameters
2. Get authenticated user ID from JWT token
3. Build SQL query with user's club access restrictions
4. Apply filters (search, country, archived status)
5. Execute count query for pagination metadata
6. Execute main query with pagination and sorting
7. Transform database results to DTOs
8. Return paginated response

## Performance Considerations
- Index on `clubs.name`, `clubs.short_name` for search performance
- Index on `clubs.country` for country filtering
- Index on `clubs.is_archived` for filtering
- Index on `user_clubs.user_id` and `user_clubs.club_id` for authorization
- Consider caching for frequently accessed club lists
- Use database-side pagination (OFFSET/FETCH) to limit memory usage

## Related Endpoints
- `GET /api/clubs/{clubId}` - Get single club details
- `GET /api/clubs/{clubId}/teams` - Get club teams
- `GET /api/clubs/{clubId}/players` - Get club players
- `GET /api/clubs/{clubId}/statistics` - Get club statistics

## Notes
- Logo URLs should be pre-signed or public URLs
- Color values must be valid hex colors
- Founded year should be validated (reasonable range: 1800-current year)
- Consider implementing response compression for large lists
- Implement rate limiting (e.g., 100 requests per minute per user)
