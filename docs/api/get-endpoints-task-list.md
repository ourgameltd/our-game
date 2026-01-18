# GET Request Endpoints Implementation Task List

This document tracks all GET endpoints required to support the OurGame application functionality. Each endpoint corresponds to a detailed specification file in the `docs/api/endpoints/` directory.

## Progress Overview

- **Total Endpoints**: 85
- **Completed**: 5
- **In Progress**: 0
- **Not Started**: 80

---

## 1. Clubs Management (8 endpoints)

- [x] `GET /api/clubs` - List all clubs
- [x] `GET /api/clubs/{clubId}` - Get club details by ID
- [x] `GET /api/clubs/{clubId}/age-groups` - List age groups for a club
- [x] `GET /api/clubs/{clubId}/teams` - List all teams for a club
- [x] `GET /api/clubs/{clubId}/players` - List all players for a club
- [ ] `GET /api/clubs/{clubId}/coaches` - List all coaches for a club
- [ ] `GET /api/clubs/{clubId}/kits` - List kits for a club
- [ ] `GET /api/clubs/{clubId}/statistics` - Get club-wide statistics

---

## 2. Age Groups Management (5 endpoints)

- [ ] `GET /api/age-groups/{ageGroupId}` - Get age group details
- [ ] `GET /api/age-groups/{ageGroupId}/teams` - List teams in an age group
- [ ] `GET /api/age-groups/{ageGroupId}/players` - List players in an age group
- [ ] `GET /api/age-groups/{ageGroupId}/coaches` - List coaches for an age group
- [ ] `GET /api/age-groups/{ageGroupId}/statistics` - Get age group statistics

---

## 3. Teams Management (10 endpoints)

- [ ] `GET /api/teams` - List teams (with filtering)
- [ ] `GET /api/teams/{teamId}` - Get team details by ID
- [ ] `GET /api/teams/{teamId}/players` - List players in a team
- [ ] `GET /api/teams/{teamId}/coaches` - List coaches for a team
- [ ] `GET /api/teams/{teamId}/matches` - List matches for a team
- [ ] `GET /api/teams/{teamId}/matches/upcoming` - Get upcoming matches
- [ ] `GET /api/teams/{teamId}/matches/past` - Get past matches
- [ ] `GET /api/teams/{teamId}/training-sessions` - List training sessions
- [ ] `GET /api/teams/{teamId}/statistics` - Get team statistics
- [ ] `GET /api/teams/{teamId}/kits` - Get team kits

---

## 4. Players Management (12 endpoints)

- [ ] `GET /api/players` - List players (with filtering)
- [ ] `GET /api/players/{playerId}` - Get player details
- [ ] `GET /api/players/{playerId}/attributes` - Get player attributes
- [ ] `GET /api/players/{playerId}/evaluations` - Get player evaluations
- [ ] `GET /api/players/{playerId}/matches` - List player matches
- [ ] `GET /api/players/{playerId}/performance` - Get player performance stats
- [ ] `GET /api/players/{playerId}/reports` - List player report cards
- [ ] `GET /api/players/{playerId}/development-plans` - Get development plans
- [ ] `GET /api/players/{playerId}/training-plans` - Get training plans
- [ ] `GET /api/players/{playerId}/album` - Get player photo album
- [ ] `GET /api/players/{playerId}/medical-info` - Get medical information
- [ ] `GET /api/players/{playerId}/emergency-contacts` - Get emergency contacts

---

## 5. Coaches Management (6 endpoints)

- [ ] `GET /api/coaches` - List coaches (with filtering)
- [ ] `GET /api/coaches/{coachId}` - Get coach details
- [ ] `GET /api/coaches/{coachId}/teams` - List teams coached by coach
- [ ] `GET /api/coaches/{coachId}/certifications` - Get coach certifications
- [ ] `GET /api/coaches/{coachId}/specializations` - Get coach specializations
- [ ] `GET /api/coaches/{coachId}/biography` - Get coach biography

---

## 6. Matches Management (11 endpoints)

- [ ] `GET /api/matches` - List matches (with filtering)
- [ ] `GET /api/matches/{matchId}` - Get match details
- [ ] `GET /api/matches/{matchId}/lineup` - Get match lineup
- [ ] `GET /api/matches/{matchId}/report` - Get match report
- [ ] `GET /api/matches/{matchId}/statistics` - Get match statistics
- [ ] `GET /api/matches/{matchId}/goals` - Get match goals
- [ ] `GET /api/matches/{matchId}/cards` - Get match cards
- [ ] `GET /api/matches/{matchId}/substitutions` - Get match substitutions
- [ ] `GET /api/matches/{matchId}/injuries` - Get match injuries
- [ ] `GET /api/matches/{matchId}/performance-ratings` - Get player ratings
- [ ] `GET /api/matches/{matchId}/attendance` - Get attendance list

---

## 7. Training Sessions Management (8 endpoints)

- [ ] `GET /api/training-sessions` - List training sessions (with filtering)
- [ ] `GET /api/training-sessions/{sessionId}` - Get training session details
- [ ] `GET /api/training-sessions/{sessionId}/drills` - Get session drills
- [ ] `GET /api/training-sessions/{sessionId}/attendance` - Get attendance
- [ ] `GET /api/training-sessions/upcoming` - Get upcoming training sessions
- [ ] `GET /api/training-sessions/past` - Get past training sessions
- [ ] `GET /api/drills` - List all drills
- [ ] `GET /api/drills/{drillId}` - Get drill details

---

## 8. Drill Templates Management (3 endpoints)

- [ ] `GET /api/drill-templates` - List drill templates
- [ ] `GET /api/drill-templates/{templateId}` - Get drill template details
- [ ] `GET /api/drill-templates/{templateId}/drills` - Get drills in template

---

## 9. Player Reports Management (5 endpoints)

- [ ] `GET /api/player-reports` - List player reports (with filtering)
- [ ] `GET /api/player-reports/{reportId}` - Get report details
- [ ] `GET /api/player-reports/{reportId}/development-actions` - Get development actions
- [ ] `GET /api/player-reports/{reportId}/similar-players` - Get similar professional players
- [ ] `GET /api/player-reports/latest` - Get latest reports

---

## 10. Development Plans Management (5 endpoints)

- [ ] `GET /api/development-plans` - List development plans (with filtering)
- [ ] `GET /api/development-plans/{planId}` - Get development plan details
- [ ] `GET /api/development-plans/{planId}/goals` - Get plan goals
- [ ] `GET /api/development-plans/{planId}/progress` - Get plan progress
- [ ] `GET /api/development-plans/active` - Get active development plans

---

## 11. Training Plans Management (5 endpoints)

- [ ] `GET /api/training-plans` - List training plans (with filtering)
- [ ] `GET /api/training-plans/{planId}` - Get training plan details
- [ ] `GET /api/training-plans/{planId}/objectives` - Get plan objectives
- [ ] `GET /api/training-plans/{planId}/sessions` - Get planned sessions
- [ ] `GET /api/training-plans/active` - Get active training plans

---

## 12. Formations Management (6 endpoints)

- [ ] `GET /api/formations` - List formations (with filtering by squad size)
- [ ] `GET /api/formations/{formationId}` - Get formation details
- [ ] `GET /api/formations/{formationId}/positions` - Get formation positions
- [ ] `GET /api/formations/system` - List system formations only
- [ ] `GET /api/formations/club/{clubId}` - List club-specific formations
- [ ] `GET /api/formations/{squadSize}` - List formations for squad size

---

## 13. Tactics Management (7 endpoints)

- [ ] `GET /api/tactics` - List tactics (with filtering)
- [ ] `GET /api/tactics/{tacticId}` - Get tactic details
- [ ] `GET /api/tactics/{tacticId}/principles` - Get tactic principles
- [ ] `GET /api/tactics/{tacticId}/overrides` - Get position overrides
- [ ] `GET /api/tactics/{tacticId}/inheritance` - Get inheritance chain
- [ ] `GET /api/tactics/club/{clubId}` - List club tactics
- [ ] `GET /api/tactics/team/{teamId}` - List team tactics

---

## 14. Kits Management (4 endpoints)

- [ ] `GET /api/kits` - List kits (with filtering)
- [ ] `GET /api/kits/{kitId}` - Get kit details
- [ ] `GET /api/kits/{kitId}/orders` - Get kit orders
- [ ] `GET /api/kit-orders/{orderId}` - Get kit order details

---

## 15. Reference Data (5 endpoints)

- [ ] `GET /api/reference/positions` - Get all player positions
- [ ] `GET /api/reference/roles` - Get all roles (user, coach)
- [ ] `GET /api/reference/attributes` - Get all player attributes definitions
- [ ] `GET /api/reference/weather-conditions` - Get weather conditions
- [ ] `GET /api/reference/squad-sizes` - Get supported squad sizes

---

## 16. Statistics & Analytics (4 endpoints)

- [ ] `GET /api/statistics/club/{clubId}` - Get club statistics
- [ ] `GET /api/statistics/age-group/{ageGroupId}` - Get age group statistics
- [ ] `GET /api/statistics/team/{teamId}` - Get team statistics
- [ ] `GET /api/statistics/player/{playerId}` - Get player statistics

---

## 17. User Management (4 endpoints)

- [ ] `GET /api/users/current` - Get current user details
- [ ] `GET /api/users/{userId}` - Get user details
- [ ] `GET /api/users/{userId}/preferences` - Get user preferences
- [ ] `GET /api/users/{userId}/notifications` - Get user notifications

---

## Implementation Notes

### Priority Order
1. **High Priority**: Clubs, Age Groups, Teams, Players, Matches (core entities)
2. **Medium Priority**: Coaches, Training Sessions, Formations, Statistics
3. **Low Priority**: Kits, Reference Data, User Preferences

### Database Considerations
- All endpoints will query from Azure SQL Server using EF Core
- Use DTOs for response models to control data exposure
- Implement pagination for list endpoints (default: 30 items, max: 100)
- Use query parameters for filtering and sorting

### Authentication & Authorization
- All endpoints require authentication via JWT tokens
- Role-based access control (RBAC) based on user role and club affiliation
- Parents can only access their children's data
- Players can access their own data
- Coaches can access data for their teams
- Admins have full access

### API Versioning
- Use header-based versioning: `api-version: 1.0`
- Support at least one previous version during deprecation period

### Response Format
- All responses in camelCase JSON
- Consistent error response format (RFC 7807 Problem Details)
- Include metadata for paginated responses (totalCount, page, pageSize)

---

## Related Documentation

- `/docs/database/erd-diagrams.md` - Database schema reference
- `/docs/api/endpoints/` - Individual endpoint specifications
- `/docs/all-routes.md` - Frontend routes requiring these endpoints
