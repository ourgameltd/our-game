# GET /api/tactics/{tacticId}/inheritance - Get Inheritance Chain
## Endpoint Name
**Get Inheritance Chain**
## URL Pattern
```
GET /api/tactics/{tacticId}/inheritance
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"chain": [{"level": "system", "tacticId": "t1"}, {"level": "club", "tacticId": "t2"}]}
```
## Required SQL Queries
```sql
WITH RECURSIVE InheritanceChain AS (
  SELECT t.id, t.parent_tactic_id, t.scope_type, 0 as level
  FROM tactics t WHERE t.id = @tacticId
  UNION ALL
  SELECT t.id, t.parent_tactic_id, t.scope_type, ic.level + 1
  FROM tactics t
  INNER JOIN InheritanceChain ic ON ic.parent_tactic_id = t.id
)
SELECT * FROM InheritanceChain ORDER BY level DESC;
```
## Database Tables Used
- `tactics`
