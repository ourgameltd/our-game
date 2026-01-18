# GET /api/coaches/{coachId} - Get Coach Details

## Endpoint Name
**Get Coach Details**

## URL Pattern
```
GET /api/coaches/{coachId}
```

## Description
Retrieves detailed information for a specific coach.

## Authentication
- **Required**: Yes

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `coachId` | string (UUID) | Yes | Unique identifier of the coach |

## Response Example (Success - 200 OK)
```json
{
  "id": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
  "clubId": "8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b",
  "clubName": "Vale FC",
  "firstName": "Michael",
  "lastName": "Robertson",
  "dateOfBirth": "1978-05-12",
  "photo": "https://placehold.co/150/2C3E50/FFFFFF?text=MR",
  "email": "michael.robertson@valefc.com",
  "phone": "+44 7700 900123",
  "associationId": "SFA-24781",
  "role": "head-coach",
  "specializations": ["Youth Development", "Tactical Training"],
  "biography": "Experienced youth coach with over 15 years...",
  "hasAccount": true,
  "isArchived": false
}
```

## Required SQL Queries

```sql
SELECT c.id, c.club_id, cl.name as club_name, c.first_name, c.last_name,
       c.date_of_birth, c.photo, c.email, c.phone, c.association_id,
       c.role, c.specializations, c.biography, c.has_account, c.is_archived
FROM coaches c
INNER JOIN clubs cl ON cl.id = c.club_id
WHERE c.id = @coachId;
```

## Database Tables Used
- `coaches`, `clubs`
