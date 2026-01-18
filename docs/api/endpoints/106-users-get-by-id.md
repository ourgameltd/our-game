# GET /api/users/{userId} - Get User Details
## Endpoint Name
**Get User Details**
## URL Pattern
```
GET /api/users/{userId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"id": "u1", "firstName": "John", "lastName": "Smith", "email": "john@example.com"}
```
## Required SQL Queries
```sql
SELECT u.id, u.first_name, u.last_name, u.email, u.role
FROM users u
WHERE u.id = @userId;
```
## Database Tables Used
- `users`
