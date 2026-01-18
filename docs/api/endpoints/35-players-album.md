# GET /api/players/{playerId}/album - Get Player Photo Album

## Endpoint Name
**Get Player Photo Album**

## URL Pattern
```
GET /api/players/{playerId}/album
```

## Description
Retrieves photos for a player's album.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "img-1",
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "url": "https://storage.ourgame.com/players/img-1.jpg",
      "caption": "Match day celebration",
      "uploadedAt": "2024-12-01",
      "tags": ["match", "award"]
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT a.id, a.player_id, a.url, a.caption, a.uploaded_at, a.tags
FROM player_album a
WHERE a.player_id = @playerId
ORDER BY a.uploaded_at DESC;
```

## Database Tables Used
- `player_album`
