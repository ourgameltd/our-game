# GET /api/users/{userId}/notifications - Get User Notifications
## Endpoint Name
**Get User Notifications**
## URL Pattern
```
GET /api/users/{userId}/notifications
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"id": "n1", "userId": "u1", "message": "Match tomorrow", "read": false, "createdAt": "2024-12-18"}]}
```
## Required SQL Queries
```sql
SELECT n.id, n.user_id, n.message, n.is_read, n.created_at
FROM notifications n
WHERE n.user_id = @userId
ORDER BY n.created_at DESC;
```
## Database Tables Used
- `notifications`
