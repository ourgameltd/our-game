# GET /api/kit-orders/{orderId} - Get Kit Order Details
## Endpoint Name
**Get Kit Order Details**
## URL Pattern
```
GET /api/kit-orders/{orderId}
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"id": "o1", "kitId": "k1", "playerId": "p1", "size": "M", "status": "pending"}
```
## Required SQL Queries
```sql
SELECT ko.* FROM kit_orders ko WHERE ko.id = @orderId;
```
## Database Tables Used
- `kit_orders`
