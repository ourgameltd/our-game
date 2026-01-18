# GET /api/kits/{kitId}/orders - Get Kit Orders
## Endpoint Name
**Get Kit Orders**
## URL Pattern
```
GET /api/kits/{kitId}/orders
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": [{"id": "o1", "kitId": "k1", "playerId": "p1", "size": "M", "status": "pending"}]}
```
## Required SQL Queries
```sql
SELECT ko.id, ko.kit_id, ko.player_id, ko.size, ko.status, ko.ordered_at
FROM kit_orders ko
WHERE ko.kit_id = @kitId
ORDER BY ko.ordered_at DESC;
```
## Database Tables Used
- `kit_orders`
