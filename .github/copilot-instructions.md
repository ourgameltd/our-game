# OurGame - Football Club Management Platform

## Project Overview

OurGame is a comprehensive, responsive, mobile-first web portal for football clubs (soccer) worldwide to manage their operations and reduce administrative burden. The platform covers club details (colors, logo, names, locations, history, ethos, principles), all age groups and teams (from youth to amateurs and first teams), player management with positions and abilities, staff certifications, kit orders, match reports, and training sessions.

## Technology Stack

### Frontend (`/web`)
- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Rendering**: Static Site Generation (SSG) for clubs/formations/tactics, client-side rendering for dynamic content
- **Styling**: Tailwind CSS 3.4+
- **State Management**: Zustand 4.5+ with React Context
- **UI Components**: React 18+ with Lucide icons, Recharts for visualizations
- **Build Configuration**: Next.js with SWA-optimized static export

### Backend (`/api`)
- **Runtime**: Azure Functions v4 with .NET 8 Isolated Worker Model
- **Architecture**: RESTful API with RPC-style endpoints for optimization
- **API Documentation**: OpenAPI 3.0 specification via NSwag
- **Versioning**: Header-based versioning using `api-version` header (e.g., `api-version: 1.0`)
- **Resilience**: Polly for retry policies and circuit breakers
- **Projects**:
  - `OurGame.Api` - Azure Functions HTTP triggers
  - `OurGame.Application` - Shared business logic, extensions, and services

### Database
- **Production**: Azure SQL Server Serverless (deployed via Bicep)
- **Local Development**: SQL Server in Docker container
- **ORM**: Entity Framework Core 8
- **Schema Management**: SQL Database Project (`.sqlproj`) as source of truth
- **Migrations**: EF Core Power Tools to sync DbContext with database project schema
- **Seed Data**: Populated from existing `/web/src/data/*.ts` TypeScript sample files

### Infrastructure (`/infrastructure`)
- **IaC Tool**: Azure Bicep
- **Deployment**: Single production environment (future: multi-environment)
- **Resources**:
  - Azure Static Web App (Standard tier) hosting Next.js build output
  - Azure Functions (Consumption Y1) as linked SWA backend
  - Azure SQL Server Serverless with SQL Database
  - Application Insights and Log Analytics
  - Storage Account for function app diagnostics

### Development Tools
- **SWA CLI**: Links Next.js dev server with local Azure Functions
- **EF Core CLI**: Database migrations and scaffolding
- **Docker**: Local SQL Server container
- **Storybook**: Component development and visual testing

## Application Structure

The platform follows a hierarchical tree structure:

Dashboard
- Clubs (list the clubs I have access to in icons in a grid)   
  - Club/{clubId}/{clubName}
    - Club overview (breakdown of teams, players, upcoming matches, recent results etc)
    - Consititution and principles/Ethos of the club
    - Club/{clubId}/{clubName}/Teams (list the teams I have access too in icons in a grid these teams should be grouped by agre group e.g. 2014, 2015, Amateur, Reserve, Senior etc team names would be e.g. Regs, Blues, Whites etc)
        - Team overview
        - Club/{clubId}/{clubName}/Teams/{teamId}/{teamGroupName}/{teamName}
            - Team overview (upcoming matches, recent results, top performers, struggling players etc)
            - Squad Management (list of players in the team with ability to add/remove players)
                - Player overview (details of player, position, abilities, stats etc)
                - Club/{clubId}/{clubName}/Teams/{teamId}/{teamGroupName}/{teamName}/Players/{playerId}/{playerName}
                    - Player growth (chart of abilities over time, progress made, areas to work on) 
                    - Sponsors
                - Match Reports
                    - Goal scorers, assists, bookings, substitutions, player ratings, men of match
                - Training Sessions linking to global shareable training sessions across club
                - Report cards
                    - Similar players in profesional game to focus on for improvement
                - individual training plans
                - Formations linking to global shareable formations across club
            - Kit orders
            - Messages/Notifications
        - Messages/Notifications           
- Formations & Tactics (list of all formations and tactics stored globally)
    - Formation 1
    - Formation 2
- Training Sessions (list of all training sessions across all clubs/teams I have access to)
    - Training Session 1
    - Training Session 2

## Core Features

### Global Resources
- **Formations & Tactics**: Stored globally (50+ formations for 4v4, 5v5, 7v7, 9v9, 11v11) and assignable to teams with inheritance (club → team overrides)
- **Training Sessions**: Shareable drill library with drill builder and session manager for coaches
- **Match Scheduling**: Opposition details, location, date/time, weather conditions, referee assignments
- **Training Scheduling**: Focus areas, drills, duration, attendance tracking

### Player Development
- **EA FC-Style Attributes**: 35 detailed abilities (pace, shooting, passing, dribbling, defending, physical, mental, technical)
- **Performance Tracking**: Match ratings, training session performance, coach reviews
- **Report Cards**: Automated generation based on performance data and coach assessments
- **Development Plans**: Individual training plans with target areas, progress tracking over time
- **Professional Comparisons**: Similar players in professional game to model improvement

### User Management
- **Invite-Only Registration**: Admin creates invites with pre-assigned roles (coach, player, parent, fan, staff)
- **Role-Based Access**: Automatic role assignment based on invite link used during registration
- **Authentication Pages**: Login, registration, password reset, user profile management
- **Parent Access**: Parents assigned to youth players to manage profiles and receive updates
- **Fan Engagement**: Fans can follow clubs, receive match day notifications, view statistics and news

### Administrative Features
- **Kit Management**: Kit builder with 10+ patterns, order tracking, size management
- **Staff Certifications**: Coach qualifications, certifications, renewal tracking
- **Emergency Contacts**: Player safety information
- **Messages/Notifications**: In-app messaging system for teams and club-wide announcements

### Future Enhancements
- **Mobile App**: Native iOS/Android app with real-time notifications
- **Payment Processing**: Club membership fees, kit orders, event payments
- **Real-Time Updates**: Push notifications for games, training sessions, club news

## Database Architecture

### Schema Overview
The database follows the comprehensive schema documented in `/docs/database/erd-diagrams.md` (50+ tables):

**Core Entities**: `users`, `clubs`, `age_groups`, `teams`, `coaches`, `players`

**Player Management**: `player_attributes` (35 EA FC metrics), `player_teams`, `player_age_groups`, `player_images`, `emergency_contacts`

**Formations & Tactics**: `formations`, `formation_positions`, `position_overrides`, `tactic_principles` (inheritance system)

**Matches**: `matches`, `match_lineups`, `goals`, `assists`, `cards`, `injuries`, `performance_ratings`, `substitutions`

**Training**: `training_sessions`, `drills`, `drill_templates`, `attendance`, `session_drills`

**Development**: `development_plans`, `player_reports`, `training_plans`, `focus_areas`

**Administrative**: `kits`, `kit_orders`, `certifications`, `roles`, `notifications`

**Junction Tables**: `team_coaches`, `age_group_coordinators`, various many-to-many relationships

### Development Workflow

1. **Schema Changes**: Make changes in SQL Database Project (`.sqlproj`)
2. **Database Update**: Apply changes to local Docker SQL Server or Azure SQL
3. **EF Core Sync**: Use EF Core Power Tools to reverse-engineer DbContext from database
4. **Code Generation**: Update repositories, services, and DTOs based on new schema
5. **Seed Data**: Populate database using transformed TypeScript files from `/web/src/data/`

### Data Seeding Strategy
- Source sample data from existing TypeScript files: `clubs.ts`, `teams.ts`, `players.ts`, `matches.ts`, `formations.ts`, `tactics.ts`, `training.ts`, etc.
- Maintain UUID structure and referential integrity
- Preserve EA FC attribute system (35 metrics per player)
- Use realistic relationships: Vale FC → multiple age groups → multiple teams → 30+ players

## API Development Guidelines

### REST API Principles
- **Endpoints**: Follow RESTful conventions (`GET /api/clubs`, `POST /api/players`, etc.)
- **RPC Optimization**: Use RPC-style endpoints where REST is inefficient (e.g., `/api/matches/{id}/calculate-ratings`)
- **Custom SQL**: Allowed for complex queries and performance optimization
- **Status Codes**: Use standard HTTP status codes (see `HttpStatusCodeX.cs`)
- **JSON Naming**: camelCase for all JSON properties

### OpenAPI Specification
- **Documentation**: All endpoints must have OpenAPI/Swagger documentation
- **NSwag Integration**: Generate TypeScript clients for Next.js frontend
- **Schema Validation**: Request/response models documented with examples
- **Endpoint Grouping**: Tag endpoints by domain (Clubs, Players, Matches, Formations, etc.)

### Versioning Strategy
- **Header-Based**: Use `api-version` header (e.g., `api-version: 1.0`, `api-version: 2.0`)
- **Backward Compatibility**: Maintain at least one previous version
- **Deprecation Policy**: Mark deprecated endpoints in OpenAPI spec with sunset dates

### Error Handling
- **Resilience**: Use Polly (see `PollyX.cs`) for retry logic and circuit breakers
- **Validation**: Use `PreconditionX.cs` for precondition checks
- **Consistent Errors**: Return RFC 7807 problem details for all errors

## Frontend Development Guidelines

### Next.js Migration Path
1. **Preserve Structure**: Maintain existing 60+ pages and 15+ component folders
2. **Routing Conversion**: Convert React Router routes to Next.js App Router file-based routing
3. **SSG Pages**: Use `generateStaticParams` for clubs, formations, tactics pages
4. **Client Components**: Mark interactive components with `'use client'` directive
5. **API Integration**: Replace mock data with calls to Azure Functions via NSwag-generated client

### Component Architecture
- **Feature Folders**: Maintain existing structure (`components/ageGroup`, `components/coach`, `components/formation`, etc.)
- **Reusable Components**: Keep common components in `components/common`
- **Layout Components**: Use Next.js layout.tsx for shared navigation/header/footer
- **Contexts**: Preserve ThemeContext, NavigationContext, UserPreferencesContext

### State Management
- **Zustand Stores**: Keep existing stores for global state
- **React Context**: Use for theme, user preferences, navigation state
- **Server State**: Use React Query or SWR for API data fetching and caching

### Styling
- **Tailwind CSS**: Continue using Tailwind 3.4+ with mobile-first approach
- **Club Branding**: Dynamic color schemes based on club colors (Vale FC example in `/docs/images/vale-crest.jpg`)
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, ARIA labels

### Visual Testing
- **Storybook**: Maintain component stories for isolated testing
- **Route Testing**: Use `/docs/all-routes.md` checklist (60+ routes)
- **Playwright**: Screenshot capture script for visual regression

## Infrastructure Development

### Local Development Setup
1. **SQL Server**: Run Docker container with SQL Server
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
   ```
2. **Database Project**: Open `.sqlproj` in Visual Studio or Azure Data Studio
3. **EF Core**: Run migrations to local database
4. **Azure Functions**: Run with `func start` in `/api/OurGame.Api`
5. **Next.js**: Run with `npm run dev` in `/web`
6. **SWA CLI**: Use `swa start` to link frontend and backend locally

### Bicep Infrastructure
- **File**: `/infrastructure/main.bicep`
- **Current Resources**: Static Web App, Azure Functions, Storage Account, App Insights
- **Required Addition**: Azure SQL Server Serverless resource with database
- **Connection Strings**: Configure in Function App app settings via Bicep
- **Environment**: Single production environment (future: dev, staging, prod)

### Deployment Pipeline
1. **Database**: Apply database project to Azure SQL Server
2. **Backend**: Deploy Azure Functions via GitHub Actions or Azure CLI
3. **Frontend**: Build Next.js static export, deploy to SWA
4. **Seed Data**: Run EF Core seeding script on first deployment

## Design Principles

### User Experience
- **Simple & Clean**: Focus on usability and accessibility
- **Mobile-First**: Responsive design that works on all devices
- **Intuitive Navigation**: Clear hierarchy matching the application structure
- **Role-Appropriate**: Show only features relevant to user's role

### Club Customization
- **Branding**: Dynamic color schemes based on club colors (e.g., Vale FC: red/white)
- **Logos**: Club crests displayed throughout the interface
- **Ethos**: Display club constitution and principles (see `/docs/club-consitituion.md`)
- **Inclusive Language**: Welcoming tone for community club supporting all ages and abilities

### Content Guidelines
- **Formal vs Friendly**: Constitution content adapted to be less formal, more inclusive
- **Community Focus**: Emphasize "football for everyone" messaging
- **Age-Appropriate**: Content tailored for youth, amateur, and senior audiences

## Code Quality Standards

### TypeScript
- **Strict Mode**: Enable all strict type checking
- **Type Safety**: Use existing comprehensive types in `/web/src/types/index.ts` (699 lines)
- **No Any**: Avoid `any` type, use proper interfaces

### .NET
- **Async/Await**: Use async methods for all I/O operations
- **Dependency Injection**: Register services in `Program.cs`
- **Extension Methods**: Follow patterns in `OurGame.Application/Extensions`

### Testing
- **Unit Tests**: Required for business logic
- **Integration Tests**: Test Azure Functions endpoints
- **E2E Tests**: Playwright tests for critical user journeys

## Documentation References

- **All Routes**: `/docs/all-routes.md` - 60+ route definitions for visual testing
- **Database ERD**: `/docs/database/erd-diagrams.md` - Complete schema documentation (905 lines)
- **Age Group Hierarchy**: `/docs/age-group-hierarchy.md` - 3-level club structure
- **Formation System**: `/docs/tactics-data-layer.md` - Inheritance and overrides
- **Kit Management**: `/docs/kit-management-system.md` - Kit builder system
- **Squad Sizes**: `/docs/squad-size-feature.md` - Support for 4v4 through 11v11
- **Club Constitution**: `/docs/club-consitituion.md` - Vale FC ethos and principles

---

**Repository**: Monorepo structure with `/web` (Next.js), `/api` (.NET), `/infrastructure` (Bicep), and `/docs`

**Development Focus**: Full-stack development with production-ready backend, database layer, and API integration replacing frontend-only demonstrations.