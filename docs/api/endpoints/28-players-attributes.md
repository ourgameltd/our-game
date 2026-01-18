# GET /api/players/{playerId}/attributes - Get Player Attributes

## Endpoint Name
**Get Player Attributes**

## URL Pattern
```
GET /api/players/{playerId}/attributes
```

## Description
Retrieves the 35 EA FC-style attributes for a player.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `playerId` | string (UUID) | Yes | Unique identifier of the player |

## Response Example (Success - 200 OK)
```json
{
  "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
  "overallRating": 50,
  "attributes": {
    "skills": {
      "ballControl": 45,
      "crossing": 35,
      "dribbling": 40,
      "finishing": 30,
      "heading": 42,
      "longPassing": 48,
      "shortPassing": 52,
      "shotPower": 40,
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
      "stamina": 60,
      "strength": 48
    },
    "mental": {
      "aggression": 45,
      "awareness": 65,
      "communication": 72,
      "composure": 60,
      "positioning": 70,
      "vision": 50
    }
  },
  "updatedAt": "2024-12-01T10:00:00Z"
}
```

## Required SQL Queries

```sql
SELECT * FROM player_attributes
WHERE player_id = @playerId;
```

## Database Tables Used
- `player_attributes`
