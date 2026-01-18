# GET /api/tactics/club/{clubId} - List Club Tactics
## Endpoint Name
**List Club Tactics**
## URL Pattern
```
GET /api/tactics/club/{clubId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"id": "t1", "name": "High Press", "formationId": "f1"}]}
```
## Required SQL Queries
```sql
SELECT t.id, t.name, t.formation_id
FROM tactics t
WHERE t.scope_club_id = @clubId
ORDER BY t.name;
```
## Database Tables Used
- `tactics`
