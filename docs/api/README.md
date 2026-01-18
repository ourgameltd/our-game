# GET Request Endpoints - Implementation Plan Summary

## Overview

This document provides a comprehensive implementation plan for all GET request endpoints required to support the OurGame football club management platform. The plan includes detailed specifications, SQL queries, and implementation guidance for building out the backend API.

## Quick Start

1. **Master Task List**: See `/docs/api/get-endpoints-task-list.md` for the complete list of 85 endpoints
2. **Endpoint Specifications**: See `/docs/api/endpoints/` for detailed specifications
3. **Database Schema**: Reference `/docs/database/erd-diagrams.md` for database structure

## Project Context

**OurGame** is a comprehensive football club management platform covering:
- Club management (details, history, ethos, principles)
- Age groups and teams (youth to senior)
- Player management (35 EA FC attributes, evaluations, medical info)
- Staff and coach certifications
- Match management (reports, lineups, statistics)
- Training sessions and drill management
- Player development plans and report cards
- Formations and tactics (50+ formations for all squad sizes)
- Kit orders and management

## Technology Stack

### Backend
- **Runtime**: Azure Functions v4 with .NET 8 Isolated Worker Model
- **Database**: Azure SQL Server Serverless (local: SQL Server in Docker)
- **ORM**: Entity Framework Core 8
- **API Documentation**: OpenAPI 3.0 via NSwag
- **Versioning**: Header-based (`api-version: 1.0`)
- **Resilience**: Polly for retry policies

### Data Source
- SQL Database Project (`.sqlproj`) as schema source of truth
- EF Core Power Tools for DbContext synchronization
- Seed data from `/web/src/data/*.ts` TypeScript files

## Endpoint Categories (85 Total)

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| Clubs Management | 8 | High | Specs: 2/8 |
| Age Groups Management | 5 | High | Specs: 0/5 |
| Teams Management | 10 | High | Specs: 0/10 |
| Players Management | 12 | High | Specs: 1/12 |
| Coaches Management | 6 | Medium | Specs: 0/6 |
| Matches Management | 11 | High | Specs: 1/11 |
| Training Sessions | 8 | Medium | Specs: 0/8 |
| Drill Templates | 3 | Medium | Specs: 0/3 |
| Player Reports | 5 | Medium | Specs: 0/5 |
| Development Plans | 5 | Medium | Specs: 0/5 |
| Training Plans | 5 | Medium | Specs: 0/5 |
| Formations | 6 | Medium | Specs: 1/6 |
| Tactics | 7 | Medium | Specs: 0/7 |
| Kits Management | 4 | Low | Specs: 0/4 |
| Reference Data | 5 | Low | Specs: 0/5 |
| Statistics | 4 | Medium | Specs: 0/4 |
| User Management | 4 | Low | Specs: 0/4 |
| **TOTAL** | **85** | - | **Specs: 5/85** |

## Completed Specifications (5)

### 1. GET /api/clubs
**Purpose**: List all clubs with filtering and pagination
**Key Features**:
- Pagination (default 30, max 100 items)
- Search by name/short name
- Filter by country and archived status
- Includes player/team/coach counts
- Authorization by user's club access

**File**: `/docs/api/endpoints/01-clubs-list.md`

### 2. GET /api/clubs/{clubId}
**Purpose**: Get detailed club information
**Key Features**:
- Full club details (history, ethos, principles)
- Optional kit details
- Optional statistics
- Contact information and social media
- Authorization by user's club access

**File**: `/docs/api/endpoints/02-clubs-get-by-id.md`

### 3. GET /api/players/{playerId}
**Purpose**: Get detailed player information
**Key Features**:
- Personal details and photo
- 35 EA FC attributes (optional)
- Recent evaluations (optional)
- Medical information (restricted access)
- Recent performance stats (optional)
- Parent/guardian information
- Authorization: coaches, players (self), parents (children)

**File**: `/docs/api/endpoints/03-players-get-by-id.md`

### 4. GET /api/matches/{matchId}
**Purpose**: Get detailed match information
**Key Features**:
- Match details (date, location, opposition)
- Optional lineup with formation
- Optional match report
- Optional events (goals, cards, substitutions, injuries)
- Optional player performance ratings
- Attendance summary
- Weather conditions

**File**: `/docs/api/endpoints/04-matches-get-by-id.md`

### 5. GET /api/formations
**Purpose**: List all formations with filtering
**Key Features**:
- Filter by squad size (4, 5, 7, 9, 11)
- System formations (50+ built-in)
- Club/team custom formations
- Inheritance support (club → age group → team)
- Position count and override indicators
- Authorization by club access

**File**: `/docs/api/endpoints/05-formations-list.md`

## Specification Template

Each endpoint specification follows a consistent structure:

```markdown
# GET /api/{endpoint} - Endpoint Name

## Endpoint Name
## URL Pattern
## Description
## Authentication
## Authorization
## Path Parameters
## Query Parameters
## Request Headers
## Request Example
## Response Example (Success)
## Response Example (Errors)
## Response Schema
## Status Codes
## Required SQL Queries
## Database Tables Used
## Business Logic
## Performance Considerations
## Related Endpoints
## Notes
```

## Key Implementation Standards

### Authentication & Authorization
- **JWT Token**: Required for all endpoints
- **Roles**: admin, coach, player, parent, fan
- **Authorization Rules**:
  - Admins: Full access to all data
  - Coaches: Access to their teams' data
  - Players: Access to their own data
  - Parents: Access to their children's data
  - Fans: Limited access to public information

### API Standards
- **Versioning**: Header-based `api-version: 1.0`
- **Response Format**: camelCase JSON
- **Error Format**: RFC 7807 Problem Details
- **Pagination**: Consistent metadata structure
- **Status Codes**: Standard HTTP codes

### Database Standards
- **ORM**: Entity Framework Core 8
- **Pagination**: Database-side (OFFSET/FETCH)
- **Indexes**: Strategic indexes on filter/sort columns
- **Queries**: Separate queries for optional data
- **Performance**: Caching for frequently accessed data

### Response Structure
```json
{
  "data": [...],           // Main response data
  "pagination": {          // For list endpoints
    "page": 1,
    "pageSize": 30,
    "totalCount": 150,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Entity Relationships

### Core Hierarchy
```
Clubs
├── Age Groups (2014s, 2013s, Amateur, Senior, etc.)
│   └── Teams (Reds, Blues, Whites, etc.)
│       ├── Players (with 35 EA FC attributes)
│       ├── Coaches (head, assistant, goalkeeper, fitness)
│       ├── Matches (with lineups, reports, statistics)
│       └── Training Sessions (with drills and attendance)
```

### Supporting Entities
- **Formations**: System (50+) and custom formations
- **Tactics**: Formations with principles and overrides
- **Player Reports**: Performance evaluations and development plans
- **Training Plans**: Individual player training objectives
- **Development Plans**: Long-term player development goals
- **Kits**: Club, team, and goalkeeper kits
- **Reference Data**: Positions, roles, attributes, weather, etc.

## Database Schema Highlights

### Key Tables (50+ total)
- `clubs` - Club details
- `age_groups` - Age group definitions
- `teams` - Team details
- `players` - Player personal information
- `player_attributes` - 35 EA FC attributes
- `coaches` - Coach information
- `matches` - Match details
- `match_lineups` - Player positions
- `match_reports` - Match summaries
- `goals`, `assists`, `cards`, `injuries` - Match events
- `training_sessions` - Training session details
- `drills` - Drill definitions
- `formations` - Formation layouts
- `tactics` - Tactical setups
- `player_reports` - Performance reports
- `development_plans` - Player development
- `kits` - Kit designs
- `users` - User accounts

### Junction Tables
- `player_teams` - Player-team assignments
- `player_age_groups` - Player-age group assignments
- `team_coaches` - Team-coach assignments
- `user_clubs` - User-club access
- `match_coaches` - Match-coach assignments

## Implementation Workflow

### 1. Database Setup
```bash
# Local SQL Server
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest

# Apply database project
# Run EF Core migrations
# Seed data from TypeScript files
```

### 2. Backend Development
```csharp
// Azure Function example
[Function("GetClubs")]
public async Task<IActionResult> Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "clubs")] 
    HttpRequest req)
{
    // 1. Validate query parameters
    // 2. Get user from JWT
    // 3. Check authorization
    // 4. Query database
    // 5. Transform to DTO
    // 6. Return response
}
```

### 3. Frontend Integration
```typescript
// NSwag-generated TypeScript client
import { ClubsClient } from './api-client';

const client = new ClubsClient();
const clubs = await client.getClubs({ page: 1, pageSize: 10 });
```

## Performance Optimization

### Caching Strategy
- **System Formations**: Cache indefinitely (rarely change)
- **Club Details**: Cache for 1 hour
- **Player Attributes**: Cache for 5 minutes
- **Match Results**: Cache completed matches indefinitely
- **Reference Data**: Cache for 24 hours

### Database Optimization
- **Indexes**: On all foreign keys, filter columns, sort columns
- **Pagination**: Use OFFSET/FETCH for efficient paging
- **Conditional Loading**: Separate queries for optional data
- **Query Optimization**: Use appropriate JOINs, avoid N+1 queries
- **Connection Pooling**: Enable for Azure SQL

## Security Considerations

### Authentication
- JWT tokens with expiration
- Refresh token mechanism
- Token validation on every request

### Authorization
- Role-based access control
- Field-level permissions (e.g., medical info)
- User-club affiliation checks
- Prevent unauthorized cross-club access

### Data Protection
- No sensitive data in logs
- GDPR compliance for personal data
- Encrypted connections (TLS)
- SQL injection prevention (parameterized queries)

## Testing Strategy

### Unit Tests
- Business logic validation
- DTO transformations
- Authorization checks

### Integration Tests
- Database queries
- Azure Function endpoints
- Authentication flows

### E2E Tests
- Critical user journeys
- Multi-role scenarios
- Data integrity checks

## Deployment

### Infrastructure (Bicep)
```
Azure Resources:
├── Static Web App (Frontend)
├── Azure Functions (Backend API)
├── Azure SQL Server Serverless
├── Application Insights
├── Storage Account
└── Log Analytics
```

### CI/CD Pipeline
1. Run database migrations
2. Deploy Azure Functions
3. Deploy Next.js static site
4. Run smoke tests
5. Update API documentation

## Next Steps

### Immediate Actions (High Priority)
1. Complete Core Entity endpoint specifications:
   - Age Groups (5 endpoints)
   - Teams (10 endpoints)
   - Players (11 more endpoints)
   - Coaches (6 endpoints)

2. Complete Match Management specifications:
   - Matches list and related endpoints (10 more)
   - Match events endpoints

3. Begin implementation:
   - Set up Azure Functions project structure
   - Configure database connection
   - Implement authentication middleware
   - Create first endpoint (GET /api/clubs)

### Secondary Actions (Medium Priority)
4. Training Management specifications (11 endpoints)
5. Player Development specifications (17 endpoints)
6. Tactical & Formation specifications (12 more endpoints)

### Final Actions (Low Priority)
7. Reference Data specifications (5 endpoints)
8. Statistics specifications (4 endpoints)
9. Kit Management specifications (4 endpoints)
10. User Management specifications (4 endpoints)

## Resources

### Documentation
- `/docs/api/get-endpoints-task-list.md` - Master task list
- `/docs/api/endpoints/` - Individual endpoint specifications
- `/docs/database/erd-diagrams.md` - Database schema
- `/docs/all-routes.md` - Frontend routes requiring endpoints
- `/docs/age-group-hierarchy.md` - Club structure
- `/docs/tactics-data-layer.md` - Formation inheritance

### Data Source Files
- `/web/src/data/clubs.ts` - Club sample data
- `/web/src/data/teams.ts` - Team sample data
- `/web/src/data/players.ts` - Player sample data (35 attributes)
- `/web/src/data/matches.ts` - Match sample data
- `/web/src/data/training.ts` - Training and drill data
- `/web/src/data/formations.ts` - Formation data (50+)
- `/web/src/data/tactics.ts` - Tactic data with inheritance
- `/web/src/data/reports.ts` - Player report data
- `/web/src/data/referenceData.ts` - Lookup data

### External Resources
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [EF Core Documentation](https://docs.microsoft.com/ef/core/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [RFC 7807 Problem Details](https://tools.ietf.org/html/rfc7807)

## Contribution Guidelines

### Creating New Endpoint Specifications
1. Copy the template structure from existing specs
2. Fill in all sections with accurate information
3. Include realistic request/response examples
4. Provide complete SQL queries with parameters
5. Document all authorization rules
6. List performance considerations
7. Link to related endpoints

### SQL Query Guidelines
- Use parameterized queries (prevent SQL injection)
- Include all necessary JOINs
- Apply appropriate WHERE clauses for authorization
- Use CTEs for complex queries
- Include ORDER BY for consistent results
- Use OFFSET/FETCH for pagination

### Response Schema Guidelines
- Use TypeScript type definitions
- Document all fields with comments
- Mark optional fields with `?`
- Include realistic value examples
- Document enums and unions
- Specify date/time formats (ISO 8601)

## Support

For questions or clarifications:
- Review existing endpoint specifications in `/docs/api/endpoints/`
- Check database schema in `/docs/database/erd-diagrams.md`
- Reference sample data in `/web/src/data/*.ts` files

---

**Last Updated**: 2024-12-18
**Version**: 1.0
**Status**: Planning Phase - 5/85 Endpoints Specified
