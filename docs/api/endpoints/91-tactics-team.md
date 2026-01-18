# GET /api/tactics/team/{teamId} - List Team Tactics
## Endpoint Name
**List Team Tactics**
## URL Pattern
```
GET /api/tactics/team/{teamId}
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
WHERE t.scope_team_id = @teamId
ORDER BY t.name;
```
## Database Tables Used
- `tactics`
