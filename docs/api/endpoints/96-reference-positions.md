# GET /api/reference/positions - Get All Player Positions
## Endpoint Name
**Get Player Positions**
## URL Pattern
```
GET /api/reference/positions
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"code": "GK", "name": "Goalkeeper"}, {"code": "CB", "name": "Center Back"}]}
```
## Required SQL Queries
```sql
SELECT code, name, abbreviation, category
FROM positions
ORDER BY category, display_order;
```
## Database Tables Used
- `positions`
