# OurGame - Football Club Management Platform

## Project Overview

OurGame is a comprehensive, responsive, mobile-first web portal for football clubs (soccer) worldwide to manage their operations and reduce administrative burden. The platform covers club details (colors, logo, names, locations, history, ethos, principles), all age groups and teams (from youth to amateurs and first teams), player management with positions and abilities, staff certifications, kit orders, match reports, and training sessions.

## Technology Stack

### Frontend (`/web`)
- **Framework**: React 18.3 + Vite 8 + TypeScript 5.9
- **Routing**: React Router 6
- **Styling**: Tailwind CSS 4.2+
- **State Management**: Zustand 5+ with React Context
- **UI Components**: React 18+ with Lucide icons, MUI Material 7, Recharts for visualizations
- **API Client**: Generated via `@hey-api/openapi-ts` from the Functions OpenAPI spec
- **Build Configuration**: Vite build output for Azure Static Web Apps

### Backend (`/api`)
- **Runtime**: Azure Functions v4 with .NET 8 Isolated Worker Model
- **Architecture**: RESTful API with RPC-style endpoints for optimization, MediatR for CQRS command/query dispatching
- **API Documentation**: OpenAPI 3.0 specification via Azure Functions Worker OpenAPI extension
- **Versioning**: Header-based versioning using `api-version` header (e.g., `api-version: 1.0`)
- **Resilience**: Polly for retry policies and circuit breakers
- **Validation**: FluentValidation for request validation
- **Notifications**: Azure Communication Services (email) + Web Push (VAPID)
- **Projects**:
  - `OurGame.Api` - Azure Functions HTTP triggers
  - `OurGame.Application` - Business logic, use cases, services (MediatR handlers, FluentValidation, Polly)
  - `OurGame.Persistence` - EF Core 9 DbContext, models, migrations, seed data
  - `OurGame.Seeder` - Database migration and seeding console app

### Database
- **Production**: Azure SQL Server Serverless (deployed via Bicep)
- **Local Development**: SQL Server in Docker container
- **ORM**: Entity Framework Core 9
- **Migrations**: EF Core migrations in `OurGame.Persistence/Migrations`
- **Seed Data**: Seeded via `OurGame.Seeder` using `OurGame.Persistence.Data.SeedData`

### Infrastructure (`/infrastructure`)
- **IaC Tool**: Azure Bicep (subscription-level deployment via `main-subscription.bicep`)
- **Deployment**: Single production environment (future: multi-environment)
- **Resources**:
  - Azure Static Web App (Standard tier) hosting Vite build output, with linked Function App backend
  - Azure Functions (Consumption Y1) as linked SWA backend
  - Azure SQL Server Serverless (GP_S_Gen5, auto-pause 60 min) with SQL Database
  - Application Insights and Log Analytics (30-day retention)
  - Storage Account (StorageV2, TLS 1.2)
  - Azure Communication Services with managed email domain
  - Custom domain support (optional, CNAME-based)

### Development Tools
- **SWA CLI**: Links Vite dev server (`localhost:5173`) with local Azure Functions (`localhost:7071`) on `localhost:4280`
- **Docker Compose**: Local SQL Server 2022 (port 14330) + Azurite (blob/queue/table storage emulator)
- **EF Core CLI**: Database migrations and scaffolding
- **Storybook**: Component development
- **Stryker.NET**: Mutation testing for Application and API layers
- **.NET Test Projects**: xUnit + Moq for unit test coverage of backend and API endpoint behavior

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
- Seed data is defined in 49 C# classes in `OurGame.Persistence/Data/SeedData/`
- `OurGame.Seeder` applies EF Core migrations then seeds all tables in FK-dependency order
- Supports `--clean` flag to truncate all data before reseeding (disables/re-enables FK constraints)
- Maintains UUID structure and referential integrity
- Preserves EA FC attribute system (35 metrics per player)
- Uses realistic relationships: Vale FC → multiple age groups → multiple teams → 30+ players

## API Development Guidelines

### REST API Principles
- **Endpoints**: Follow RESTful conventions (`GET /api/clubs`, `POST /api/players`, etc.)
- **RPC Optimization**: Use RPC-style endpoints where REST is inefficient (e.g., `/api/matches/{id}/calculate-ratings`)
- **Custom SQL**: Allowed for complex queries and performance optimization
- **Status Codes**: Use standard HTTP status codes (see `HttpStatusCodeX.cs`)
- **JSON Naming**: camelCase for all JSON properties

### OpenAPI Specification
- **Documentation**: All endpoints must have OpenAPI/Swagger documentation via Azure Functions Worker OpenAPI extension
- **Client Generation**: TypeScript clients generated via `@hey-api/openapi-ts` from `http://localhost:7071/openapi/v3.json` (run `npm run generate:api` in `/web`)
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
- **Contexts**: Preserve AuthContext, ThemeContext, NavigationContext, PageTitleContext, UserPreferencesContext

### State Management
- **Zustand Stores**: Keep existing stores for global state
- **React Context**: Use for auth, theme, user preferences, navigation state, page title
- **Axios**: HTTP client for API calls via generated TypeScript client

### Styling
- **Tailwind CSS**: Continue using Tailwind 4.2+ with mobile-first approach
- **Club Branding**: Dynamic color schemes based on club colors
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, ARIA labels


## Infrastructure Development

### Local Development Setup
1. **Docker Compose**: Run `docker compose -f docker-compose.local.yml up -d` to start SQL Server 2022 (port 14330) + Azurite
2. **Database Seed**: Run `docker compose -f docker-compose.local.yml --profile seed run --no-deps --rm seeder` to apply migrations and seed data
3. **Azure Functions**: Run with `func start` in `/api/OurGame.Api`
4. **Vite**: Run with `npm run dev` in `/web`
5. **SWA CLI**: Use `npx swa start --config swa-cli.config.json` in `/web` to link frontend and backend on `localhost:4280`

Alternatively, use the VS Code task `Dev: Start Backend Containers + SWA` to start everything in sequence.

### API Endpoint Test Expectations

Playwright and other browser-driven end-to-end test guidance is intentionally out of scope for this repository's contributor instructions. Do not add new Playwright tests, Playwright workflows, or Playwright-specific references to these instructions when making changes.

When work changes backend behavior, API contracts, validation, authorization, serialization, or endpoint responses, contributors should add or extend a .NET unit test project that exercises the affected API endpoints. Treat API endpoint unit coverage as the default testing expectation for backend work.

#### Backend Test Guidance
1. Add focused tests around the affected Azure Functions endpoints and their observable HTTP behavior.
2. Cover success paths, validation failures, and relevant edge cases introduced by the change.
3. Keep tests close to the API surface so contract regressions are caught without relying on browser automation.
4. Update existing backend test projects where possible instead of introducing Playwright or other E2E test references.

### Bicep Infrastructure
- **Entry Point**: `/infrastructure/main-subscription.bicep` (subscription-level deployment)
- **Resources**: `/infrastructure/main.bicep` (resource group-level)
- **All Resources Deployed**: Static Web App, Azure Functions, Storage Account, App Insights, Log Analytics, Azure SQL Server Serverless + Database, Azure Communication Services (email), custom domain support
- **Connection Strings**: Configured in Function App app settings via Bicep (SQL, ACS, VAPID keys)
- **Environment**: Single production environment (future: dev, staging, prod)

### CI/CD Pipelines (GitHub Actions)

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| **PR Build** | `pr-build.yml` | PRs to `main`/`develop` | Build, test with coverage, generate report |
| **Tag Release** | `tag-release.yml` | Git tag `v*.*.*` or manual | Full deployment: infra → database → Functions → SWA |
| **Deploy SWA** | `deploy-swa.yml` | Manual | Re-deploy frontend only |
| **Reset Database** | `reset-database.yml` | Manual | Re-seed Azure SQL (with optional `--clean` flag) |
| **Stryker** | `stryker.yml` | Manual | Mutation testing for Application and API layers |

#### Tag Release Pipeline (Full Deployment)
1. **Build**: Backend (.NET 8) and Frontend (Node 20.x) built in parallel
2. **Infrastructure**: Subscription-level Bicep deployment (creates/updates all Azure resources)
3. **Database**: Opens temporary firewall rule, runs `OurGame.Seeder` (migrations + seed data), removes firewall rule
4. **Function App**: Deploys published API to Azure Function App
5. **Static Web App**: Deploys built frontend, configures B2C auth settings

#### Required GitHub Secrets & Variables
- **Secrets**: `AZURE_CREDENTIALS`, `SQL_ADMIN_PASSWORD`, `B2C_CLIENT_SECRET`
- **Variables**: `SQL_ADMIN_USERNAME` (defaults to `ourgame_sql_admin`), `B2C_CLIENT_ID`

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
- **Unit Tests**: Required for business logic (xUnit + Moq)
- **API Endpoint Unit Tests**: Expected for Azure Functions endpoint behavior and contract changes
- **Mutation Testing**: Stryker.NET available for Application and API layers (`stryker.yml` workflow)
- **Code Coverage**: XPlat Code Coverage collected in PR builds, reported via ReportGenerator
- **No Playwright Coverage**: Do not add Playwright tests or Playwright-specific guidance to this workspace instruction set

## Directory README Documentation System

Each meaningful directory in the repository contains a `README.md` with YAML frontmatter metadata. This system exists to give LLMs (GitHub Copilot, AI agents) rich context about the purpose, technology, and relationships of each folder — enabling more accurate code generation and navigation.

### Frontmatter Schema

```yaml
---
domain: <functional area, e.g. "API", "Frontend", "Data Access">
technology: [<tech1>, <tech2>]
categories: [<category1>, <category2>]
related:
  - path/to/related/file
---
```

### Master Index

`ARCHITECTURE.md` at the repository root is the table of contents listing all directory READMEs. This file should be updated whenever directories are added or removed.

### Maintenance

- When adding a new folder with meaningful content, add a `README.md` with frontmatter
- Update `ARCHITECTURE.md` to include the new entry
- Review directory READMEs during PRs that restructure or add folders

**Important**: Upon completing any feature or implementation work, directory READMEs and `ARCHITECTURE.md` **must** be kept up to date. If new folders, files, or capabilities are added, the relevant `README.md` files should be created or updated to reflect the changes. If existing folders change purpose or gain new key files, update their README accordingly. This is imperative — accurate directory documentation drastically reduces the context needed for each subsequent implementation, enabling faster and more precise work by both developers and LLMs.

---

**Repository**: Monorepo structure with `/web` (React + Vite), `/api` (.NET 8 with 4 projects), `/infrastructure` (Bicep), and `/docs`

**Development Focus**: Full-stack development with production-ready backend, database layer, CI/CD pipelines, and API integration.