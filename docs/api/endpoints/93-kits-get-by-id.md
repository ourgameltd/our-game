# GET /api/kits/{kitId} - Get Kit Details
## Endpoint Name
**Get Kit Details**
## URL Pattern
```
GET /api/kits/{kitId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"id": "k1", "name": "Home Kit", "type": "home", "shirtColor": "#000080"}
```
## Required SQL Queries
```sql
SELECT k.* FROM kits k WHERE k.id = @kitId;
```
## Database Tables Used
- `kits`
