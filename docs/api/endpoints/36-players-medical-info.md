# GET /api/players/{playerId}/medical-info - Get Medical Information

## Endpoint Name
**Get Player Medical Information**

## URL Pattern
```
GET /api/players/{playerId}/medical-info
```

## Description
Retrieves medical information for a player (restricted access).

## Authentication
- **Required**: Yes
- **Roles**: admin, coach, parent (own children)

## Response Example (Success - 200 OK)
```json
{
  "playerId": "p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
  "bloodType": "O+",
  "allergies": ["Peanuts"],
  "medications": [],
  "conditions": [],
  "lastCheckup": "2024-08-15"
}
```

## Required SQL Queries

```sql
SELECT m.player_id, m.blood_type, m.allergies, m.medications,
       m.conditions, m.last_checkup
FROM medical_info m
WHERE m.player_id = @playerId;
```

## Database Tables Used
- `medical_info`
