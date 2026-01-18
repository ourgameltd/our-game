# GET /api/reference/roles - Get All Roles
## Endpoint Name
**Get Roles**
## URL Pattern
```
GET /api/reference/roles
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"code": "admin", "name": "Administrator"}, {"code": "coach", "name": "Coach"}]}
```
## Required SQL Queries
```sql
SELECT code, name, description
FROM roles
ORDER BY name;
```
## Database Tables Used
- `roles`
