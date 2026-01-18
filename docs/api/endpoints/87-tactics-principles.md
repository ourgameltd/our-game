# GET /api/tactics/{tacticId}/principles - Get Tactic Principles
## Endpoint Name
**Get Tactic Principles**
## URL Pattern
```
GET /api/tactics/{tacticId}/principles
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"id": "p1", "phase": "attacking", "principle": "Press high"}]}
```
## Required SQL Queries
```sql
SELECT tp.id, tp.phase, tp.principle
FROM tactic_principles tp
WHERE tp.tactic_id = @tacticId
ORDER BY tp.phase, tp.order_index;
```
## Database Tables Used
- `tactic_principles`
