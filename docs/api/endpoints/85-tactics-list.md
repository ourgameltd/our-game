# GET /api/tactics - List Tactics
## Endpoint Name
**List Tactics**
## URL Pattern
```
GET /api/tactics
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"id": "t1", "name": "High Press", "formationId": "f1", "clubId": "c1"}]}
```
## Required SQL Queries
```sql
SELECT t.id, t.name, t.formation_id, t.scope_club_id
FROM tactics t
WHERE EXISTS (SELECT 1 FROM user_clubs uc WHERE uc.club_id = t.scope_club_id AND uc.user_id = @userId)
ORDER BY t.name;
```
## Database Tables Used
- `tactics`, `user_clubs`
