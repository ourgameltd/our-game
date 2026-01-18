# GET /api/teams/{teamId}/kits - Get Team Kits

## Endpoint Name
**Get Team Kits**

## URL Pattern
```
GET /api/teams/{teamId}/kits
```

## Description
Retrieves kits assigned to a team.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | string (UUID) | Yes | Unique identifier of the team |

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      "name": "Vale Home Kit",
      "type": "home",
      "shirtColor": "#000080",
      "shortsColor": "#000080",
      "socksColor": "#000080"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT k.id, k.name, k.type, k.shirt_color, k.shorts_color, k.socks_color
FROM kits k
INNER JOIN team_kits tk ON tk.kit_id = k.id
WHERE tk.team_id = @teamId AND k.is_active = 1
ORDER BY 
    CASE k.type
        WHEN 'home' THEN 1
        WHEN 'away' THEN 2
        WHEN 'third' THEN 3
        WHEN 'goalkeeper' THEN 4
    END;
```

## Database Tables Used
- `kits`, `team_kits`
