# GET /api/reference/squad-sizes - Get Supported Squad Sizes
## Endpoint Name
**Get Squad Sizes**
## URL Pattern
```
GET /api/reference/squad-sizes
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"size": 4, "format": "4v4"}, {"size": 5, "format": "5v5"}, {"size": 7, "format": "7v7"}, {"size": 9, "format": "9v9"}, {"size": 11, "format": "11v11"}]}
```
## Required SQL Queries
```sql
SELECT size, format, description
FROM squad_sizes
ORDER BY size;
```
## Database Tables Used
- `squad_sizes`
