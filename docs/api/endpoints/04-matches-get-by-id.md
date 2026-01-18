# GET /api/matches/{matchId} - Get Match Details

## Endpoint Name
**Get Match Details**

## URL Pattern
```
GET /api/matches/{matchId}
```

## Description
Retrieves detailed information for a specific match, including lineup, score, report, statistics, and events (goals, cards, substitutions).

## Authentication
- **Required**: Yes
- **Roles**: All authenticated users

## Authorization
- User must have access to the team involved in the match
- Coaches, players, and parents of players in the match can access
- Fans can access completed matches only

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `matchId` | string (UUID) | Yes | Unique identifier of the match |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includeLineup` | boolean | No | true | Include match lineup |
| `includeReport` | boolean | No | true | Include match report |
| `includeEvents` | boolean | No | true | Include match events (goals, cards, subs) |
| `includeRatings` | boolean | No | false | Include player performance ratings |

## Request Headers
```
api-version: 1.0
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Request Example
```http
GET /api/matches/m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6?includeLineup=true&includeReport=true&includeEvents=true HTTP/1.1
Host: api.ourgame.com
api-version: 1.0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Example (Success - 200 OK)
```json
{
  "id": "m1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "teamId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "teamName": "Reds",
  "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
  "clubName": "Vale Football Club",
  "ageGroupId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "ageGroupName": "2014s",
  "squadSize": 11,
  "opposition": "Riverside United",
  "date": "2024-12-13T15:00:00Z",
  "kickOffTime": "2024-12-13T15:00:00Z",
  "meetTime": "2024-12-13T14:15:00Z",
  "location": "Community Sports Ground",
  "isHome": true,
  "competition": "County League Division 1",
  "status": "completed",
  "score": {
    "home": 2,
    "away": 1
  },
  "kit": {
    "primary": {
      "id": "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      "name": "Vale Home Kit",
      "type": "home"
    },
    "goalkeeper": {
      "id": "9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
      "name": "Vale Goalkeeper Kit",
      "type": "goalkeeper"
    }
  },
  "weather": {
    "condition": "Partly Cloudy",
    "temperature": 12
  },
  "coaches": [
    {
      "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "firstName": "Michael",
      "lastName": "Robertson",
      "role": "head-coach"
    },
    {
      "id": "c2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7",
      "firstName": "Sarah",
      "lastName": "McKenzie",
      "role": "assistant-coach"
    }
  ],
  "lineup": {
    "formationId": "f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
    "formationName": "4-4-2 Classic",
    "starting": [
      {
        "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
        "firstName": "Oliver",
        "lastName": "Thompson",
        "position": "GK",
        "squadNumber": 1
      },
      {
        "playerId": "p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
        "firstName": "James",
        "lastName": "Wilson",
        "position": "CB",
        "squadNumber": 4
      }
    ],
    "substitutes": [
      {
        "playerId": "p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
        "firstName": "Charlie",
        "lastName": "Roberts",
        "squadNumber": 11
      }
    ]
  },
  "events": {
    "goals": [
      {
        "id": "g1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "playerId": "p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
        "playerName": "Noah Anderson",
        "minute": 23,
        "assistId": "p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
        "assistName": "Ethan Davies",
        "type": "open-play"
      },
      {
        "id": "g2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7",
        "playerId": "p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
        "playerName": "Noah Anderson",
        "minute": 67,
        "assistId": "p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
        "assistName": "Charlie Roberts",
        "type": "open-play"
      }
    ],
    "cards": [
      {
        "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "playerId": "p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
        "playerName": "Ethan Davies",
        "type": "yellow",
        "minute": 55,
        "reason": "Tactical foul"
      }
    ],
    "substitutions": [
      {
        "id": "s1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "minute": 75,
        "playerOut": {
          "id": "p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
          "name": "Ethan Davies"
        },
        "playerIn": {
          "id": "p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
          "name": "Charlie Roberts"
        }
      }
    ],
    "injuries": []
  },
  "report": {
    "summary": "Dominant performance from the Reds with excellent teamwork. Strong defensive display kept Rangers at bay.",
    "captainId": "p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    "captainName": "James Wilson",
    "playerOfTheMatch": {
      "id": "p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a",
      "name": "Noah Anderson"
    }
  },
  "attendance": {
    "confirmed": 8,
    "pending": 2,
    "declined": 1,
    "total": 11
  },
  "isLocked": true,
  "createdAt": "2024-11-20T10:00:00Z",
  "updatedAt": "2024-12-13T17:30:00Z"
}
```

## Response Schema

### MatchDetails
```typescript
{
  id: string;
  teamId: string;
  teamName: string;
  clubId: string;
  clubName: string;
  ageGroupId: string;
  ageGroupName: string;
  squadSize: number;                // 4, 5, 7, 9, or 11
  opposition: string;
  date: string;                     // ISO 8601 timestamp
  kickOffTime: string;              // ISO 8601 timestamp
  meetTime?: string;                // ISO 8601 timestamp
  location: string;
  isHome: boolean;
  competition: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'postponed' | 'cancelled';
  score?: {
    home: number;
    away: number;
  };
  kit?: {
    primary: {
      id: string;
      name: string;
      type: string;
    };
    goalkeeper?: {
      id: string;
      name: string;
      type: string;
    };
  };
  weather?: {
    condition: string;
    temperature: number;
  };
  coaches: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  }[];
  lineup?: MatchLineup;             // Included if includeLineup=true
  events?: MatchEvents;             // Included if includeEvents=true
  report?: MatchReport;             // Included if includeReport=true
  performanceRatings?: PlayerRating[]; // Included if includeRatings=true
  attendance?: {
    confirmed: number;
    pending: number;
    declined: number;
    total: number;
  };
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### MatchLineup
```typescript
{
  formationId?: string;
  formationName?: string;
  starting: {
    playerId: string;
    firstName: string;
    lastName: string;
    position: string;
    squadNumber: number;
  }[];
  substitutes: {
    playerId: string;
    firstName: string;
    lastName: string;
    squadNumber: number;
  }[];
}
```

### MatchEvents
```typescript
{
  goals: {
    id: string;
    playerId: string;
    playerName: string;
    minute: number;
    assistId?: string;
    assistName?: string;
    type: 'open-play' | 'penalty' | 'free-kick' | 'own-goal';
  }[];
  cards: {
    id: string;
    playerId: string;
    playerName: string;
    type: 'yellow' | 'red';
    minute: number;
    reason?: string;
  }[];
  substitutions: {
    id: string;
    minute: number;
    playerOut: { id: string; name: string; };
    playerIn: { id: string; name: string; };
  }[];
  injuries: {
    id: string;
    playerId: string;
    playerName: string;
    minute: number;
    description: string;
    severity: 'minor' | 'moderate' | 'serious';
  }[];
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Returns match details |
| 400 | Bad Request - Invalid matchId format |
| 401 | Unauthorized |
| 403 | Forbidden - User doesn't have access |
| 404 | Not Found - Match doesn't exist |
| 500 | Internal Server Error |

## Required SQL Queries

### Main Query
```sql
SELECT 
    m.id,
    m.team_id,
    t.name as team_name,
    t.club_id,
    c.name as club_name,
    t.age_group_id,
    ag.name as age_group_name,
    m.squad_size,
    m.opposition,
    m.date,
    m.kick_off_time,
    m.meet_time,
    m.location,
    m.is_home,
    m.competition,
    m.status,
    m.home_score,
    m.away_score,
    m.primary_kit_id,
    m.goalkeeper_kit_id,
    m.weather_condition,
    m.weather_temperature,
    m.is_locked,
    m.created_at,
    m.updated_at
FROM matches m
INNER JOIN teams t ON t.id = m.team_id
INNER JOIN clubs c ON c.id = t.club_id
INNER JOIN age_groups ag ON ag.id = t.age_group_id
WHERE m.id = @matchId;
```

### Coaches Query
```sql
SELECT c.id, c.first_name, c.last_name, mc.role
FROM coaches c
INNER JOIN match_coaches mc ON mc.coach_id = c.id
WHERE mc.match_id = @matchId;
```

### Lineup Query (if includeLineup=true)
```sql
-- Starting lineup
SELECT 
    ml.player_id,
    p.first_name,
    p.last_name,
    ml.position,
    ml.squad_number,
    ml.is_substitute
FROM match_lineups ml
INNER JOIN players p ON p.id = ml.player_id
WHERE ml.match_id = @matchId
ORDER BY ml.is_substitute, ml.squad_number;

-- Formation
SELECT f.id, f.name
FROM formations f
INNER JOIN matches m ON m.formation_id = f.id
WHERE m.id = @matchId;
```

### Events Query (if includeEvents=true)
```sql
-- Goals
SELECT 
    g.id,
    g.player_id,
    CONCAT(p.first_name, ' ', p.last_name) as player_name,
    g.minute,
    g.assist_player_id,
    CONCAT(p2.first_name, ' ', p2.last_name) as assist_name,
    g.type
FROM goals g
INNER JOIN players p ON p.id = g.player_id
LEFT JOIN players p2 ON p2.id = g.assist_player_id
WHERE g.match_id = @matchId
ORDER BY g.minute;

-- Cards
SELECT 
    c.id,
    c.player_id,
    CONCAT(p.first_name, ' ', p.last_name) as player_name,
    c.type,
    c.minute,
    c.reason
FROM cards c
INNER JOIN players p ON p.id = c.player_id
WHERE c.match_id = @matchId
ORDER BY c.minute;

-- Substitutions
SELECT 
    s.id,
    s.minute,
    s.player_out_id,
    CONCAT(p1.first_name, ' ', p1.last_name) as player_out_name,
    s.player_in_id,
    CONCAT(p2.first_name, ' ', p2.last_name) as player_in_name
FROM substitutions s
INNER JOIN players p1 ON p1.id = s.player_out_id
INNER JOIN players p2 ON p2.id = s.player_in_id
WHERE s.match_id = @matchId
ORDER BY s.minute;

-- Injuries
SELECT 
    i.id,
    i.player_id,
    CONCAT(p.first_name, ' ', p.last_name) as player_name,
    i.minute,
    i.description,
    i.severity
FROM injuries i
INNER JOIN players p ON p.id = i.player_id
WHERE i.match_id = @matchId
ORDER BY i.minute;
```

### Report Query (if includeReport=true)
```sql
SELECT 
    mr.summary,
    mr.captain_id,
    CONCAT(p1.first_name, ' ', p1.last_name) as captain_name,
    mr.player_of_match_id,
    CONCAT(p2.first_name, ' ', p2.last_name) as player_of_match_name
FROM match_reports mr
LEFT JOIN players p1 ON p1.id = mr.captain_id
LEFT JOIN players p2 ON p2.id = mr.player_of_match_id
WHERE mr.match_id = @matchId;
```

### Attendance Query
```sql
SELECT 
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined,
    COUNT(*) as total
FROM match_attendance
WHERE match_id = @matchId;
```

## Database Tables Used
- `matches` - Main match information
- `teams`, `clubs`, `age_groups` - Related entities
- `coaches`, `match_coaches` - Coach assignments
- `match_lineups`, `players` - Lineup information
- `formations` - Formation details
- `goals`, `cards`, `substitutions`, `injuries` - Match events
- `match_reports` - Match report
- `match_attendance` - Attendance tracking
- `kits` - Kit information

## Business Logic
1. Validate matchId format
2. Get authenticated user from JWT
3. Check authorization (team access)
4. Fetch main match data
5. Fetch coaches
6. If includeLineup=true, fetch lineup and formation
7. If includeEvents=true, fetch goals, cards, substitutions, injuries
8. If includeReport=true, fetch match report
9. If includeRatings=true, fetch player ratings
10. Fetch attendance summary
11. Transform to DTO and return

## Performance Considerations
- Use separate queries for optional data
- Index on `matches.id`, `match_lineups.match_id`
- Cache completed match details
- Consider pre-computing statistics for completed matches

## Related Endpoints
- `GET /api/matches` - List matches
- `GET /api/matches/{matchId}/lineup` - Get full lineup details
- `GET /api/matches/{matchId}/report` - Get full match report
- `GET /api/matches/{matchId}/statistics` - Get match statistics
- `GET /api/teams/{teamId}/matches` - Get team matches

## Notes
- Locked matches cannot be edited
- Only completed matches have full reports
- Weather data is optional
- Performance ratings may not be available for all players
- Consider implementing real-time updates for in-progress matches
