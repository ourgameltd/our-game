# GET /api/coaches/{coachId}/certifications - Get Coach Certifications

## Endpoint Name
**Get Coach Certifications**

## URL Pattern
```
GET /api/coaches/{coachId}/certifications
```

## Description
Retrieves certifications for a coach.

## Authentication
- **Required**: Yes

## Response Example (Success - 200 OK)
```json
{
  "data": [
    {
      "id": "cert-1",
      "coachId": "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "name": "UEFA B License",
      "issuedBy": "SFA",
      "issuedDate": "2020-06-15",
      "expiryDate": "2025-06-15",
      "status": "active"
    }
  ]
}
```

## Required SQL Queries

```sql
SELECT cert.id, cert.coach_id, cert.name, cert.issued_by,
       cert.issued_date, cert.expiry_date, cert.status
FROM certifications cert
WHERE cert.coach_id = @coachId
ORDER BY cert.issued_date DESC;
```

## Database Tables Used
- `certifications`
