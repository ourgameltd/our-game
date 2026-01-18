# GET /api/reference/weather-conditions - Get Weather Conditions
## Endpoint Name
**Get Weather Conditions**
## URL Pattern
```
GET /api/reference/weather-conditions
```
## Authentication
- **Required**: Yes
## Response Example (Success - 200 OK)
```json
{"data": ["Clear", "Partly Cloudy", "Overcast", "Light Rain", "Heavy Rain"]}
```
## Required SQL Queries
```sql
SELECT DISTINCT weather_condition
FROM weather_conditions
ORDER BY display_order;
```
## Database Tables Used
- `weather_conditions`
