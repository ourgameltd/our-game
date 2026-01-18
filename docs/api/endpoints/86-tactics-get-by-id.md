# GET /api/tactics/{tacticId} - Get Tactic Details
## Endpoint Name
**Get Tactic Details**
## URL Pattern
```
GET /api/tactics/{tacticId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"id": "t1", "name": "High Press", "formationId": "f1", "description": "..."}
```
## Required SQL Queries
```sql
SELECT t.* FROM tactics t WHERE t.id = @tacticId;
```
## Database Tables Used
- `tactics`
