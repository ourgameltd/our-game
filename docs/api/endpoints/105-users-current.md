# GET /api/users/current - Get Current User Details
## Endpoint Name
**Get Current User**
## URL Pattern
```
GET /api/users/current
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"id": "u1", "firstName": "John", "lastName": "Smith", "email": "john@example.com", "role": "coach"}
```
## Required SQL Queries
```sql
SELECT u.id, u.first_name, u.last_name, u.email, u.role
FROM users u
WHERE u.id = @userId;
```
## Database Tables Used
- `users`
