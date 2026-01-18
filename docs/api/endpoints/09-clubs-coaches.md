# GET /api/clubs/{clubId}/coaches - List Club Coaches

## Endpoint Name
**List Club Coaches**

## URL Pattern
```
GET /api/clubs/{clubId}/coaches
```

## Description
Retrieves a list of all coaches within a club, including their roles, specializations, and team assignments.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- User must have access to the club

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clubId` | string (UUID) | Yes | Unique identifier of the club |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `role` | string | No | - | Filter by role (head-coach, assistant-coach, etc.) |
| `teamId` | string | No | - | Filter by team |
| `includeArchived` | boolean | No | false | Include archived coaches |

## Request Headers
```
api-version: 1.0
Authorization: Bearer <token>
```

## Request Example
```http
GET /api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b/coaches HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer <token>
```

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
      "firstName": "Michael",
      "lastName": "Robertson",
      "photo": "https://placehold.co/150/2C3E50/FFFFFF?text=MR",
      "email": "michael.robertson@valefc.com",
      "phone": "+44 7700 900123",
      "associationId": "SFA-24781",
      "role": "head-coach",
      "specializations": ["Youth Development", "Tactical Training", "Team Building"],
      "teams": [
        {
          "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          "name": "Reds",
          "ageGroupName": "2014s"
        }
      ],
      "hasAccount": true,
      "isArchived": false
    }
  ]
}
```

## Response Schema

### CoachListItem
```typescript
{
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  photo?: string;
  email?: string;
  phone?: string;
  associationId?: string;
  role: 'head-coach' | 'assistant-coach' | 'goalkeeper-coach' | 'fitness-coach' | 'technical-coach';
  specializations: string[];
  teams: {
    id: string;
    name: string;
    ageGroupName: string;
  }[];
  hasAccount: boolean;
  isArchived: boolean;
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
SELECT 
    c.id,
    c.club_id,
    c.first_name,
    c.last_name,
    c.photo,
    c.email,
    c.phone,
    c.association_id,
    c.role,
    c.specializations,
    c.has_account,
    c.is_archived
FROM coaches c
WHERE c.club_id = @clubId
    AND (@role IS NULL OR c.role = @role)
    AND (@teamId IS NULL OR EXISTS (
        SELECT 1 FROM team_coaches tc 
        WHERE tc.coach_id = c.id AND tc.team_id = @teamId
    ))
    AND (@includeArchived = 1 OR c.is_archived = 0)
ORDER BY 
    CASE c.role
        WHEN 'head-coach' THEN 1
        WHEN 'assistant-coach' THEN 2
        WHEN 'goalkeeper-coach' THEN 3
        WHEN 'fitness-coach' THEN 4
        ELSE 5
    END,
    c.last_name, c.first_name;

-- Teams query
SELECT 
    t.id,
    t.name,
    ag.name as age_group_name,
    tc.coach_id
FROM teams t
INNER JOIN age_groups ag ON ag.id = t.age_group_id
INNER JOIN team_coaches tc ON tc.team_id = t.id
WHERE tc.coach_id IN (SELECT id FROM coaches WHERE club_id = @clubId);
```

## Database Tables Used
- `coaches`
- `team_coaches`
- `teams`
- `age_groups`

## Business Logic
1. Validate clubId
2. Check user authorization
3. Fetch coaches with filters
4. Fetch team assignments
5. Order by role priority
6. Return list

## Performance Considerations
- Index on `coaches.club_id`
- Index on `coaches.role`
- Cache coach lists

## Related Endpoints
- `GET /api/coaches/{coachId}`
- `GET /api/teams/{teamId}/coaches`

## Notes
- Coaches can be assigned to multiple teams
- Specializations stored as JSON array
- Association ID is FA registration number
