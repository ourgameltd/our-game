# GET /api/formations - List Formations

## Endpoint Name
**List Formations**

## URL Pattern
```
GET /api/formations
```

## Description
Retrieves a paginated list of football formations, including both system formations (50+ pre-defined) and club/team-specific formations. Supports filtering by squad size, club, and formation type.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- All users can see system formations
- Users can only see club/team formations for clubs they have access to

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `pageSize` | integer | No | 30 | Items per page (max: 100) |
| `squadSize` | integer | No | - | Filter by squad size (4, 5, 7, 9, 11) |
| `systemOnly` | boolean | No | false | Show only system formations |
| `clubId` | string (UUID) | No | - | Filter by club-specific formations |
| `scope` | string | No | - | Filter by scope: 'system', 'club', 'ageGroup', 'team' |
| `search` | string | No | - | Search in formation name or system |
| `sortBy` | string | No | name | Sort field: `name`, `system`, `squadSize`, `createdAt` |
| `sortOrder` | string | No | asc | Sort order: `asc` or `desc` |

## Request Headers
```
api-version: 1.0
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Request Example
```http
GET /api/formations?squadSize=11&page=1&pageSize=20&sortBy=name HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "4-4-2 Classic",
      "system": "4-4-2",
      "squadSize": 11,
      "isSystemFormation": true,
      "scope": {
        "type": "system"
      },
      "positionCount": 11,
      "summary": "Traditional 4-4-2 formation with two strikers and flat midfield",
      "tags": [
        "Direct play through the middle",
        "Wide play using full-backs",
        "Two strikers working in partnership"
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "f2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7",
      "name": "4-3-3 Attack",
      "system": "4-3-3",
      "squadSize": 11,
      "isSystemFormation": true,
      "scope": {
        "type": "system"
      },
      "positionCount": 11,
      "summary": "Attacking 4-3-3 with wingers and central striker",
      "tags": [
        "Width provided by wingers",
        "Central striker as focal point",
        "Defensive midfielder shields back four"
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "t1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "High Press 4-4-2",
      "system": "4-4-2",
      "squadSize": 11,
      "parentFormationId": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "isSystemFormation": false,
      "scope": {
        "type": "club",
        "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
        "clubName": "Vale Football Club"
      },
      "positionCount": 11,
      "hasOverrides": true,
      "summary": "Vale FC's signature high-pressing system designed to win the ball back quickly in the opponent's half",
      "tags": ["pressing", "attacking", "4-4-2"],
      "style": "High Press",
      "createdBy": {
        "id": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
        "name": "John Smith"
      },
      "createdAt": "2024-09-01T00:00:00Z",
      "updatedAt": "2024-09-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 53,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Response Schema

### FormationListItem
```typescript
{
  id: string;                      // UUID
  name: string;
  system: string;                  // e.g., "4-4-2", "4-3-3", "3-5-2"
  squadSize: number;               // 4, 5, 7, 9, or 11
  parentFormationId?: string;      // For custom formations based on system formation
  isSystemFormation: boolean;      // True for built-in, false for user-created
  scope: {
    type: 'system' | 'club' | 'ageGroup' | 'team';
    clubId?: string;
    clubName?: string;
    ageGroupId?: string;
    ageGroupName?: string;
    teamId?: string;
    teamName?: string;
  };
  positionCount: number;
  hasOverrides?: boolean;          // True if position overrides exist
  summary?: string;
  tags?: string[];
  style?: string;                  // e.g., "High Press", "Possession", "Counter Attack"
  createdBy?: {
    id: string;
    name: string;
  };
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Returns list of formations |
| 400 | Bad Request - Invalid query parameters |
| 401 | Unauthorized |
| 403 | Forbidden |
| 500 | Internal Server Error |

## Required SQL Queries

### Main Query
```sql
WITH UserAccessibleClubs AS (
    SELECT club_id
    FROM user_clubs
    WHERE user_id = @userId
)
SELECT 
    f.id,
    f.name,
    f.system,
    f.squad_size,
    f.parent_formation_id,
    f.is_system_formation,
    f.scope_type,
    f.scope_club_id,
    c.name as scope_club_name,
    f.scope_age_group_id,
    ag.name as scope_age_group_name,
    f.scope_team_id,
    t.name as scope_team_name,
    f.summary,
    f.tags,
    f.style,
    f.created_by_id,
    CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
    f.created_at,
    f.updated_at,
    COUNT(fp.id) as position_count,
    CASE WHEN EXISTS (
        SELECT 1 FROM formation_position_overrides fpo 
        WHERE fpo.formation_id = f.id
    ) THEN 1 ELSE 0 END as has_overrides
FROM formations f
LEFT JOIN clubs c ON c.id = f.scope_club_id
LEFT JOIN age_groups ag ON ag.id = f.scope_age_group_id
LEFT JOIN teams t ON t.id = f.scope_team_id
LEFT JOIN users u ON u.id = f.created_by_id
LEFT JOIN formation_positions fp ON fp.formation_id = f.id
WHERE 
    (@squadSize IS NULL OR f.squad_size = @squadSize)
    AND (@systemOnly = 0 OR f.is_system_formation = 1)
    AND (@clubId IS NULL OR f.scope_club_id = @clubId)
    AND (@scope IS NULL OR f.scope_type = @scope)
    AND (@search IS NULL OR f.name LIKE '%' + @search + '%' OR f.system LIKE '%' + @search + '%')
    AND (
        f.is_system_formation = 1  -- System formations visible to all
        OR f.scope_club_id IN (SELECT club_id FROM UserAccessibleClubs)  -- User has access
    )
GROUP BY 
    f.id, f.name, f.system, f.squad_size, f.parent_formation_id,
    f.is_system_formation, f.scope_type, f.scope_club_id, c.name,
    f.scope_age_group_id, ag.name, f.scope_team_id, t.name,
    f.summary, f.tags, f.style, f.created_by_id,
    u.first_name, u.last_name, f.created_at, f.updated_at
ORDER BY 
    CASE WHEN @sortBy = 'name' AND @sortOrder = 'asc' THEN f.name END ASC,
    CASE WHEN @sortBy = 'name' AND @sortOrder = 'desc' THEN f.name END DESC,
    CASE WHEN @sortBy = 'system' AND @sortOrder = 'asc' THEN f.system END ASC,
    CASE WHEN @sortBy = 'system' AND @sortOrder = 'desc' THEN f.system END DESC,
    CASE WHEN @sortBy = 'squadSize' AND @sortOrder = 'asc' THEN f.squad_size END ASC,
    CASE WHEN @sortBy = 'squadSize' AND @sortOrder = 'desc' THEN f.squad_size END DESC,
    CASE WHEN @sortBy = 'createdAt' AND @sortOrder = 'asc' THEN f.created_at END ASC,
    CASE WHEN @sortBy = 'createdAt' AND @sortOrder = 'desc' THEN f.created_at END DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
```

### Count Query
```sql
WITH UserAccessibleClubs AS (
    SELECT club_id
    FROM user_clubs
    WHERE user_id = @userId
)
SELECT COUNT(DISTINCT f.id)
FROM formations f
WHERE 
    (@squadSize IS NULL OR f.squad_size = @squadSize)
    AND (@systemOnly = 0 OR f.is_system_formation = 1)
    AND (@clubId IS NULL OR f.scope_club_id = @clubId)
    AND (@scope IS NULL OR f.scope_type = @scope)
    AND (@search IS NULL OR f.name LIKE '%' + @search + '%' OR f.system LIKE '%' + @search + '%')
    AND (
        f.is_system_formation = 1
        OR f.scope_club_id IN (SELECT club_id FROM UserAccessibleClubs)
    );
```

## Database Tables Used
- `formations` - Main formation data
- `formation_positions` - Position coordinates
- `formation_position_overrides` - Custom position overrides
- `clubs`, `age_groups`, `teams` - Scope context
- `users` - Creator information
- `user_clubs` - Authorization

## Business Logic
1. Validate query parameters
2. Get authenticated user from JWT
3. Build query with user's club access restrictions
4. Apply filters (squad size, system only, club, scope, search)
5. Execute count query for pagination
6. Execute main query with pagination and sorting
7. System formations are visible to all users
8. Custom formations only visible if user has access to the club
9. Transform to DTOs and return

## Performance Considerations
- Index on `formations.squad_size` for filtering
- Index on `formations.is_system_formation` for filtering
- Index on `formations.scope_club_id` for authorization
- Index on `formations.system` and `formations.name` for search
- Cache system formations (they rarely change)
- Consider materialized views for frequently accessed formation lists

## Related Endpoints
- `GET /api/formations/{formationId}` - Get formation details with positions
- `GET /api/formations/{formationId}/positions` - Get all positions
- `GET /api/formations/system` - Get system formations only
- `GET /api/formations/club/{clubId}` - Get club formations
- `GET /api/tactics` - Get tactics (formations with principles)

## Notes
- Squad sizes supported: 4v4, 5v5, 7v7, 9v9, 11v11
- System formations are pre-loaded during database seeding
- Tags should be stored as JSON array or separate table
- Formation inheritance allows teams to override club formations
- Consider implementing formation templates/categories
- Style field helps classify formations (e.g., "Attacking", "Defensive", "Balanced")
