# GET /api/reference/attributes - Get All Player Attributes Definitions
## Endpoint Name
**Get Player Attributes**
## URL Pattern
```
GET /api/reference/attributes
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"code": "pace", "name": "Pace", "category": "physical", "description": "Player speed"}]}
```
## Required SQL Queries
```sql
SELECT code, name, category, description, min_value, max_value
FROM attribute_definitions
ORDER BY category, display_order;
```
## Database Tables Used
- `attribute_definitions`
