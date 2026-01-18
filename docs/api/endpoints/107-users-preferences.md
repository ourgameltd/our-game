# GET /api/users/{userId}/preferences - Get User Preferences
## Endpoint Name
**Get User Preferences**
## URL Pattern
```
GET /api/users/{userId}/preferences
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"userId": "u1", "theme": "dark", "language": "en", "notifications": true}
```
## Required SQL Queries
```sql
SELECT up.* FROM user_preferences up WHERE up.user_id = @userId;
```
## Database Tables Used
- `user_preferences`
