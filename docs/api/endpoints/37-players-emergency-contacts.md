# GET /api/players/{playerId}/emergency-contacts - Get Emergency Contacts

## Endpoint Name
**Get Player Emergency Contacts**

## URL Pattern
```
GET /api/players/{playerId}/emergency-contacts
```

## Description
Retrieves emergency contacts for a player (restricted access).

## Authentication
- **Required**: Yes
- **Roles**: admin, coach, parent (own children)

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "ec-1",
      "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "firstName": "Sarah",
      "lastName": "Thompson",
      "relationship": "Mother",
      "phone": "+44 7890 123456",
      "isPrimary": true
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT ec.id, ec.player_id, ec.first_name, ec.last_name,
       ec.relationship, ec.phone, ec.is_primary
FROM emergency_contacts ec
WHERE ec.player_id = @playerId
ORDER BY ec.is_primary DESC, ec.last_name;
```

## Database Tables Used
- `emergency_contacts`
