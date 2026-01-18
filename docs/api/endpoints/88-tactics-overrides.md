# GET /api/tactics/{tacticId}/overrides - Get Position Overrides
## Endpoint Name
**Get Position Overrides**
## URL Pattern
```
GET /api/tactics/{tacticId}/overrides
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"position": "ST", "instruction": "Press aggressively"}]}
```
## Required SQL Queries
```sql
SELECT fpo.position, fpo.instruction
FROM formation_position_overrides fpo
WHERE fpo.tactic_id = @tacticId;
```
## Database Tables Used
- `formation_position_overrides`
