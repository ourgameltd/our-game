# GET /api/kits - List Kits
## Endpoint Name
**List Kits**
## URL Pattern
```
GET /api/kits
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"id": "k1", "clubId": "c1", "name": "Home Kit", "type": "home"}]}
```
## Required SQL Queries
```sql
SELECT k.id, k.club_id, k.name, k.type, k.shirt_color, k.shorts_color, k.socks_color
FROM kits k
WHERE EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = k.club_id AND uc.user_id = @userId)
ORDER BY k.club_id, k.type;
```
## Database Tables Used
- `kits`, `user_clubs`
