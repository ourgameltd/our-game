# GET /api/players/{playerId} - Get Player Details

## Endpoint Name
**Get Player Details**

## URL Pattern
```
GET /api/players/{playerId}
```

## Description
Retrieves detailed information for a specific player, including personal details, attributes, positions, medical information, and recent performance data.

## Authentication
- **Required**: Yes
- **Roles**: admin, coach, player (self), parent (own children)

## Authorization
- Admins can access any player
- Coaches can access players in their teams
- Players can access their own data
- Parents can access their children's data
- Fans cannot access detailed player information

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `playerId` | string (UUID) | Yes | Unique identifier of the player |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includeAttributes` | boolean | No | true | Include player attributes (35 EA FC attributes) |
| `includeEvaluations` | boolean | No | false | Include recent evaluations |
| `includeMedical` | boolean | No | false | Include medical info (requires special permission) |
| `includePerformance` | boolean | No | false | Include recent performance stats |

## Request Headers
```
api-version: 1.0
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Request Example
```http
GET /api/players/p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5?includeAttributes=true&includePerformance=true HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success - 200 OK)
```json
{
  "id": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
  "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
  "clubName": "Vale Football Club",
  "firstName": "Oliver",
  "lastName": "Thompson",
  "nickname": "The Wall",
  "dateOfBirth": "2014-03-15",
  "age": 10,
  "photo": "https://storage.ourgame.com/players/oliver-thompson.jpg",
  "associationId": "SFA-Y-40123",
  "preferredPositions": ["GK"],
  "ageGroups": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "2014s",
      "code": "2014"
    }
  ],
  "teams": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Reds",
      "ageGroupId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "squadNumber": 1
    }
  ],
  "parents": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "firstName": "Sarah",
      "lastName": "Thompson",
      "relationship": "Mother",
      "email": "sarah.thompson@email.com",
      "phone": "+44 7890 123456",
      "isPrimary": true
    },
    {
      "id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
      "firstName": "David",
      "lastName": "Thompson",
      "relationship": "Father",
      "email": "david.thompson@email.com",
      "phone": "+44 7891 234567",
      "isPrimary": false
    }
  ],
  "overallRating": 50,
  "attributes": {
    "skills": {
      "ballControl": 45,
      "crossing": 35,
      "weakFoot": 40,
      "dribbling": 40,
      "finishing": 30,
      "freeKick": 35,
      "heading": 42,
      "longPassing": 48,
      "longShot": 38,
      "penalties": 50,
      "shortPassing": 52,
      "shotPower": 40,
      "slidingTackle": 38,
      "standingTackle": 40,
      "volleys": 35
    },
    "physical": {
      "acceleration": 55,
      "agility": 62,
      "balance": 58,
      "jumping": 60,
      "pace": 54,
      "reactions": 68,
      "sprintSpeed": 53,
      "stamina": 60,
      "strength": 48
    },
    "mental": {
      "aggression": 45,
      "attackingPosition": 35,
      "awareness": 65,
      "communication": 72,
      "composure": 60,
      "defensivePositioning": 60,
      "interceptions": 42,
      "marking": 40,
      "positivity": 68,
      "positioning": 70,
      "vision": 50
    }
  },
  "recentPerformance": {
    "matchesPlayed": 8,
    "averageRating": 8.1,
    "cleanSheets": 4,
    "goals": 0,
    "assists": 0,
    "yellowCards": 0,
    "redCards": 0,
    "lastFiveMatches": [
      {
        "matchId": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "date": "2024-12-01",
        "opposition": "Parkside Rangers",
        "result": "W 3-1",
        "rating": 8.5,
        "isHome": true
      },
      {
        "matchId": "m5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0",
        "date": "2024-11-24",
        "opposition": "Meadow United",
        "result": "W 4-0",
        "rating": 8.5,
        "isHome": true
      },
      {
        "matchId": "m7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2",
        "date": "2024-11-20",
        "opposition": "Oakwood Eagles",
        "result": "D 3-3",
        "rating": 7.0,
        "isHome": false
      }
    ]
  },
  "albumImageCount": 4,
  "isArchived": false,
  "createdAt": "2023-08-15T10:00:00Z",
  "updatedAt": "2024-12-01T18:30:00Z"
}
```

## Response Example (Forbidden - 403)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to access this player's information",
  "instance": "/api/players/p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5"
}
```

## Response Schema

### PlayerDetails
```typescript
{
  id: string;                           // UUID
  clubId: string;
  clubName: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: string;                  // ISO 8601 date
  age: number;                          // Calculated from DOB
  photo?: string;                       // URL
  associationId?: string;               // FA registration number
  preferredPositions: string[];         // Array of position codes (e.g., ['GK', 'CB'])
  ageGroups: {
    id: string;
    name: string;
    code: string;
  }[];
  teams: {
    id: string;
    name: string;
    ageGroupId: string;
    squadNumber?: number;
  }[];
  parents: {
    id: string;
    firstName: string;
    lastName: string;
    relationship: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
  }[];
  overallRating: number;                // Calculated from attributes
  attributes?: PlayerAttributes;        // Included if includeAttributes=true
  evaluations?: PlayerEvaluation[];     // Included if includeEvaluations=true
  medicalInfo?: MedicalInfo;            // Included if includeMedical=true
  recentPerformance?: RecentPerformance; // Included if includePerformance=true
  albumImageCount: number;
  isArchived: boolean;
  createdAt: string;                    // ISO 8601 timestamp
  updatedAt: string;                    // ISO 8601 timestamp
}
```

### PlayerAttributes
```typescript
{
  skills: {
    ballControl: number;        // 0-100
    crossing: number;
    weakFoot: number;
    dribbling: number;
    finishing: number;
    freeKick: number;
    heading: number;
    longPassing: number;
    longShot: number;
    penalties: number;
    shortPassing: number;
    shotPower: number;
    slidingTackle: number;
    standingTackle: number;
    volleys: number;
  };
  physical: {
    acceleration: number;
    agility: number;
    balance: number;
    jumping: number;
    pace: number;
    reactions: number;
    sprintSpeed: number;
    stamina: number;
    strength: number;
  };
  mental: {
    aggression: number;
    attackingPosition: number;
    awareness: number;
    communication: number;
    composure: number;
    defensivePositioning: number;
    interceptions: number;
    marking: number;
    positivity: number;
    positioning: number;
    vision: number;
  };
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Returns player details |
| 400 | Bad Request - Invalid playerId format |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - User doesn't have access to this player |
| 404 | Not Found - Player doesn't exist |
| 500 | Internal Server Error |

## Required SQL Queries

### Main Query
```sql
SELECT 
    p.id,
    p.club_id,
    c.name as club_name,
    p.first_name,
    p.last_name,
    p.nickname,
    p.date_of_birth,
    p.photo_url,
    p.association_id,
    p.preferred_positions,
    p.overall_rating,
    p.is_archived,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT a.id) as album_image_count
FROM players p
INNER JOIN clubs c ON c.id = p.club_id
LEFT JOIN player_album a ON a.player_id = p.id
WHERE p.id = @playerId
GROUP BY p.id, p.club_id, c.name, p.first_name, p.last_name, p.nickname,
         p.date_of_birth, p.photo_url, p.association_id, p.preferred_positions,
         p.overall_rating, p.is_archived, p.created_at, p.updated_at;
```

### Age Groups Query
```sql
SELECT ag.id, ag.name, ag.code
FROM age_groups ag
INNER JOIN player_age_groups pag ON pag.age_group_id = ag.id
WHERE pag.player_id = @playerId AND ag.is_archived = 0;
```

### Teams Query
```sql
SELECT t.id, t.name, t.age_group_id, pt.squad_number
FROM teams t
INNER JOIN player_teams pt ON pt.team_id = t.id
WHERE pt.player_id = @playerId AND t.is_archived = 0;
```

### Parents Query
```sql
SELECT u.id, u.first_name, u.last_name, pc.relationship, 
       u.email, u.phone, pc.is_primary
FROM users u
INNER JOIN player_contacts pc ON pc.user_id = u.id
WHERE pc.player_id = @playerId;
```

### Attributes Query (if includeAttributes=true)
```sql
SELECT * FROM player_attributes
WHERE player_id = @playerId;
```

### Recent Performance Query (if includePerformance=true)
```sql
-- Recent matches with ratings
SELECT TOP 5
    m.id as match_id,
    m.date,
    m.opposition,
    CASE 
        WHEN m.is_home = 1 THEN CONCAT('W ', m.home_score, '-', m.away_score)
        ELSE CONCAT('W ', m.away_score, '-', m.home_score)
    END as result,
    pr.rating,
    m.is_home
FROM matches m
INNER JOIN match_lineups ml ON ml.match_id = m.id
INNER JOIN performance_ratings pr ON pr.match_id = m.id AND pr.player_id = @playerId
WHERE ml.player_id = @playerId
    AND m.status = 'completed'
ORDER BY m.date DESC;

-- Aggregate stats
SELECT 
    COUNT(*) as matches_played,
    AVG(pr.rating) as average_rating,
    SUM(CASE WHEN m.home_score = 0 AND ml.position = 'GK' THEN 1 ELSE 0 END) as clean_sheets,
    COUNT(DISTINCT g.id) as goals,
    COUNT(DISTINCT a.id) as assists,
    COUNT(DISTINCT CASE WHEN c.type = 'yellow' THEN c.id END) as yellow_cards,
    COUNT(DISTINCT CASE WHEN c.type = 'red' THEN c.id END) as red_cards
FROM matches m
INNER JOIN match_lineups ml ON ml.match_id = m.id
LEFT JOIN performance_ratings pr ON pr.match_id = m.id AND pr.player_id = @playerId
LEFT JOIN goals g ON g.match_id = m.id AND g.player_id = @playerId
LEFT JOIN assists a ON a.match_id = m.id AND a.player_id = @playerId
LEFT JOIN cards c ON c.match_id = m.id AND c.player_id = @playerId
WHERE ml.player_id = @playerId
    AND m.status = 'completed';
```

## Database Tables Used
- `players` - Main player information
- `clubs` - Club details
- `age_groups`, `player_age_groups` - Age group assignments
- `teams`, `player_teams` - Team assignments
- `users`, `player_contacts` - Parent/guardian information
- `player_attributes` - EA FC style attributes
- `player_evaluations` - Coach evaluations
- `medical_info`, `emergency_contacts` - Medical information
- `matches`, `match_lineups`, `performance_ratings` - Match performance
- `player_album` - Photo album

## Business Logic
1. Validate playerId format (UUID)
2. Get authenticated user from JWT
3. Check authorization (admin, coach of player's team, player self, or parent)
4. Fetch main player data
5. Fetch age groups and teams
6. Fetch parent/guardian information
7. Calculate age from date of birth
8. If includeAttributes=true, fetch and attach attributes
9. If includePerformance=true, fetch and calculate performance stats
10. Transform to DTO and return

## Performance Considerations
- Use separate queries for optional data to avoid unnecessary joins
- Cache player attributes (they don't change frequently)
- Index on `players.id`, `player_teams.player_id`, `player_age_groups.player_id`
- Consider caching frequently accessed player profiles

## Related Endpoints
- `GET /api/players/{playerId}/attributes` - Get full attributes
- `GET /api/players/{playerId}/evaluations` - Get evaluations
- `GET /api/players/{playerId}/performance` - Get performance stats
- `GET /api/players/{playerId}/reports` - Get report cards
- `GET /api/players/{playerId}/album` - Get photo album

## Notes
- Age should be calculated dynamically
- Medical information requires special permission (coach or parent)
- Overall rating is calculated from attributes
- Photo URLs should be CDN URLs
- Implement field-level authorization for sensitive data
