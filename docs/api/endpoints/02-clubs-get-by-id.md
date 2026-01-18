# GET /api/clubs/{clubId} - Get Club Details

## Endpoint Name
**Get Club Details**

## URL Pattern
```
GET /api/clubs/{clubId}
```

## Description
Retrieves detailed information for a specific football club, including full history, ethos, principles, and kit details.

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- User must have access to the specified club
- User's clubId must match or user must be admin

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clubId` | string (UUID) | Yes | Unique identifier of the club |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includeKits` | boolean | No | true | Include kit details in response |
| `includeStats` | boolean | No | false | Include club statistics |

## Request Headers
```
api-version: 1.0
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Request Example
```http
GET /api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b?includeKits=true&includeStats=true HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success - 200 OK)
```json
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
  "history": "Founded in 1950, Vale Football Club has been a cornerstone of the local community for over 70 years. Starting as a small amateur team, we have grown to support players of all ages and abilities.",
  "ethos": "Vale FC is committed to providing an inclusive, welcoming environment where everyone can enjoy football. We believe in developing not just skilled players, but well-rounded individuals who embody the values of teamwork, respect, and perseverance.",
  "principles": [
    "Inclusivity - Football for everyone, regardless of age, ability, or background",
    "Community - Building strong connections within our local area",
    "Development - Nurturing talent and personal growth at every level",
    "Respect - Treating everyone with dignity on and off the pitch",
    "Fun - Ensuring football remains enjoyable for all participants"
  ],
  "contactInfo": {
    "email": "info@valefc.com",
    "phone": "+44 1234 567890",
    "website": "https://www.valefc.com",
    "socialMedia": {
      "facebook": "https://facebook.com/valefc",
      "twitter": "https://twitter.com/valefc",
      "instagram": "https://instagram.com/valefc"
    }
  },
  "kits": [
    {
      "id": "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      "name": "Vale Home Kit",
      "type": "home",
      "shirtColor": "#000080",
      "shortsColor": "#000080",
      "socksColor": "#000080",
      "isActive": true
    },
    {
      "id": "9b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
      "name": "Vale Away Kit",
      "type": "away",
      "shirtColor": "#87CEEB",
      "shortsColor": "#000080",
      "socksColor": "#000080",
      "isActive": true
    },
    {
      "id": "9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
      "name": "Vale Goalkeeper Kit",
      "type": "goalkeeper",
      "shirtColor": "#00FF00",
      "shortsColor": "#00FF00",
      "socksColor": "#00FF00",
      "isActive": true
    }
  ],
  "statistics": {
    "ageGroupCount": 6,
    "teamCount": 12,
    "playerCount": 245,
    "coachCount": 18,
    "matchesPlayed": 156,
    "wins": 89,
    "draws": 34,
    "losses": 33,
    "goalsFor": 412,
    "goalsAgainst": 278
  },
  "isArchived": false,
  "createdAt": "2020-01-15T10:00:00Z",
  "updatedAt": "2024-12-01T14:30:00Z"
}
```

## Response Example (Not Found - 404)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Club with ID '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b' not found",
  "instance": "/api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b"
}
```

## Response Example (Forbidden - 403)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to access this club",
  "instance": "/api/clubs/8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b"
}
```

## Response Schema

### ClubDetails
```typescript
{
  id: string;                    // UUID
  name: string;
  shortName: string;
  logo: string;                  // URL
  colors: {
    primary: string;             // Hex color
    secondary: string;           // Hex color
    accent?: string;             // Hex color (optional)
  };
  location: {
    city: string;
    country: string;
    venue: string;
    address?: string;
  };
  founded: number;
  history: string;               // Long text
  ethos: string;                 // Long text
  principles: string[];          // Array of principle statements
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
    };
  };
  kits?: Kit[];                  // Optional, included if includeKits=true
  statistics?: ClubStatistics;   // Optional, included if includeStats=true
  isArchived: boolean;
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### Kit
```typescript
{
  id: string;
  name: string;
  type: 'home' | 'away' | 'third' | 'goalkeeper' | 'training';
  shirtColor: string;            // Hex color
  shortsColor: string;           // Hex color
  socksColor: string;            // Hex color
  isActive: boolean;
}
```

### ClubStatistics
```typescript
{
  ageGroupCount: number;
  teamCount: number;
  playerCount: number;
  coachCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Returns club details |
| 400 | Bad Request - Invalid clubId format |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - User doesn't have access to this club |
| 404 | Not Found - Club doesn't exist |
| 500 | Internal Server Error - Server-side error occurred |

## Required SQL Queries

### Main Query
```sql
-- Get club details
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
    c.history,
    c.ethos,
    c.principles,
    c.contact_email,
    c.contact_phone,
    c.website,
    c.facebook_url,
    c.twitter_url,
    c.instagram_url,
    c.is_archived,
    c.created_at,
    c.updated_at
FROM clubs c
WHERE c.id = @clubId
    AND EXISTS (
        SELECT 1 FROM user_clubs uc 
        WHERE uc.club_id = c.id AND uc.user_id = @userId
    );
```

### Kits Query (if includeKits=true)
```sql
-- Get club kits
SELECT 
    k.id,
    k.name,
    k.type,
    k.shirt_color,
    k.shorts_color,
    k.socks_color,
    k.is_active
FROM kits k
WHERE k.club_id = @clubId
    AND k.is_active = 1
ORDER BY 
    CASE k.type
        WHEN 'home' THEN 1
        WHEN 'away' THEN 2
        WHEN 'third' THEN 3
        WHEN 'goalkeeper' THEN 4
        ELSE 5
    END;
```

### Statistics Query (if includeStats=true)
```sql
-- Get club statistics
SELECT 
    COUNT(DISTINCT ag.id) as age_group_count,
    COUNT(DISTINCT t.id) as team_count,
    COUNT(DISTINCT p.id) as player_count,
    COUNT(DISTINCT co.id) as coach_count,
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
FROM clubs c
LEFT JOIN age_groups ag ON ag.club_id = c.id AND ag.is_archived = 0
LEFT JOIN teams t ON t.club_id = c.id AND t.is_archived = 0
LEFT JOIN players p ON p.club_id = c.id AND p.is_archived = 0
LEFT JOIN coaches co ON co.club_id = c.id AND co.is_archived = 0
LEFT JOIN matches m ON m.team_id = t.id AND m.status = 'completed'
WHERE c.id = @clubId
GROUP BY c.id;
```

## Database Tables Used
- `clubs` - Main club information
- `kits` - Club kits (optional)
- `age_groups` - For statistics
- `teams` - For statistics
- `players` - For statistics
- `coaches` - For statistics
- `matches` - For statistics
- `user_clubs` - For authorization

## Business Logic
1. Validate clubId format (must be valid UUID)
2. Get authenticated user ID from JWT token
3. Check user has access to the club (query user_clubs table)
4. Fetch main club details
5. If club not found, return 404
6. If includeKits=true, fetch and attach kits
7. If includeStats=true, calculate and attach statistics
8. Transform database results to DTO
9. Return club details

## Performance Considerations
- Cache club details for frequently accessed clubs
- Use separate queries for optional data (kits, stats) to avoid joins when not needed
- Index on `clubs.id` (primary key)
- Index on `user_clubs.club_id` and `user_clubs.user_id` for authorization
- Consider using Redis cache with TTL for club data

## Related Endpoints
- `GET /api/clubs` - List all clubs
- `GET /api/clubs/{clubId}/teams` - Get club teams
- `GET /api/clubs/{clubId}/age-groups` - Get age groups
- `GET /api/clubs/{clubId}/players` - Get club players
- `GET /api/clubs/{clubId}/statistics` - Get detailed statistics

## Notes
- Principles should be stored as JSON array in database or separate table
- Logo URLs should be CDN URLs for performance
- Consider implementing ETags for caching
- History and ethos can be long text - consider pagination or truncation
- Social media URLs should be validated for correct format
