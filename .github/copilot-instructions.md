# OurGame - Football Club Management Platform

## Project Overview

OurGame is a comprehensive, responsive, mobile-first web portal for football clubs (soccer) worldwide to manage their operations and reduce administrative burden. The platform covers club details (colors, logo, names, locations, history, ethos, principles), all age groups and teams (from youth to amateurs and first teams), player management with positions and abilities, staff certifications, kit orders, match reports, and training sessions.

## Technology Stack

### Frontend (`/web`)
- **Framework**: React 18 + Vite + TypeScript
- **Routing**: React Router 6
- **Styling**: Tailwind CSS 3.4+
- **State Management**: Zustand 4.5+ with React Context
- **UI Components**: React 18+ with Lucide icons, Recharts for visualizations
- **Build Configuration**: Vite build output for Azure Static Web Apps

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
- **ORM**: Entity Framework Core 9
- **Migrations**: EF Core migrations in `OurGame.Persistence/Migrations`
- **Seed Data**: Seeded via `OurGame.Seeder` using `OurGame.Persistence.Data.SeedData`

### Infrastructure (`/infrastructure`)
- **IaC Tool**: Azure Bicep
- **Deployment**: Single production environment (future: multi-environment)
- **Resources**:
    - Azure Static Web App (Standard tier) hosting Vite build output
  - Azure Functions (Consumption Y1) as linked SWA backend
  - Azure SQL Server Serverless with SQL Database
  - Application Insights and Log Analytics
  - Storage Account for function app diagnostics

### Development Tools
- **SWA CLI**: Links Vite dev server with local Azure Functions
- **EF Core CLI**: Database migrations and scaffolding
- **Docker**: Local SQL Server container
- **Storybook**: Component development

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

### Development Workflow

1. **Schema Changes**: Schema changes are code first in EF Core models
2. **Database Update**: Apply changes to local Docker SQL Server or Azure SQL
3. **Code Generation**: Update repositories, services, and DTOs based on new schema
4. **Seed Data**: Populate database using transformed TypeScript files from seed data project

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
- **NSwag Integration**: Generate TypeScript clients for the React frontend
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

### React Router Routing
1. **Preserve Structure**: Maintain existing pages and component folders
2. **Route Definitions**: Keep all routes in React Router config (no file-based routing)
3. **Dynamic Segments**: Use route params for clubs, teams, formations, tactics, and players
4. **Nested Layouts**: Use nested routes and shared layout components
5. **API Integration**: Replace mock data with calls to Azure Functions via NSwag-generated client

### Component Architecture
- **Feature Folders**: Maintain existing structure (`components/ageGroup`, `components/coach`, `components/formation`, etc.)
- **Reusable Components**: Keep common components in `components/common`
- **Layout Components**: Use shared layout components for navigation/header/footer
- **Contexts**: Preserve ThemeContext, NavigationContext, UserPreferencesContext

### State Management
- **Zustand Stores**: Keep existing stores for global state
- **React Context**: Use for theme, user preferences, navigation state
- **Server State**: Use React Query or SWR for API data fetching and caching

### Styling
- **Tailwind CSS**: Continue using Tailwind 3.4+ with mobile-first approach
- **Club Branding**: Dynamic color schemes based on club colors
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, ARIA labels


## Infrastructure Development

### Local Development Setup
1. **SQL Server**: Run Docker container with SQL Server
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
   ```
2. **EF Core**: Run migrations from `OurGame.Persistence/Migrations` to local database
3. **Seed Data**: Run `OurGame.Seeder` to populate data from `OurGame.Persistence.Data.SeedData`
4. **Azure Functions**: Run with `func start` in `/api/OurGame.Api`
5. **Vite**: Run with `npm run dev` in `/web`
6. **SWA CLI**: Use `swa start` to link frontend and backend locally

### Bicep Infrastructure
- **File**: `/infrastructure/main.bicep`
- **Current Resources**: Static Web App, Azure Functions, Storage Account, App Insights
- **Required Addition**: Azure SQL Server Serverless resource with database
- **Connection Strings**: Configure in Function App app settings via Bicep
- **Environment**: Single production environment (future: dev, staging, prod)

### Deployment Pipeline
1. **Database**: Apply EF Core migrations from `OurGame.Persistence/Migrations` to Azure SQL Server
2. **Backend**: Deploy Azure Functions via GitHub Actions or Azure CLI
3. **Frontend**: Build Vite output, deploy to SWA
4. **Seed Data**: Run `OurGame.Seeder` on first deployment

## Design Principles

### User Experience
- **Simple & Clean**: Focus on usability and accessibility
- **Mobile-First**: Responsive design that works on all devices
- **Intuitive Navigation**: Clear hierarchy matching the application structure
- **Role-Appropriate**: Show only features relevant to user's role

### Club Customization
- **Branding**: Dynamic color schemes based on club colors (e.g., Vale FC: red/white)
- **Logos**: Club crests displayed throughout the interface
- **Ethos**: Display club constitution and principles
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

---

**Repository**: Monorepo structure with `/web` (React + Vite), `/api` (.NET), and `/infrastructure` (Bicep)

**Development Focus**: Full-stack development with production-ready backend, database layer, and API integration replacing frontend-only demonstrations.