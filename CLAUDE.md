# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OurGame is a football club management platform — a full-stack monorepo with a React + TypeScript frontend (`/web`), an Azure Functions .NET 8 backend (`/api`), and Azure Bicep infrastructure (`/infrastructure`).

## Commands

### Backend (`/api`)

```bash
# Build
cd api && dotnet restore && dotnet build --configuration Release

# Run tests
cd api && dotnet test --configuration Release

# Run a single test project
cd api && dotnet test OurGame.Api.Tests --configuration Release

# Start Azure Functions locally
cd api/OurGame.Api && func start

# Add EF Core migration (SQL Server must be running on localhost:14330)
cd api && dotnet ef migrations add <MigrationName> --project OurGame.Persistence --startup-project OurGame.Api

# Apply migrations only (no seed data)
cd api && dotnet ef database update --project OurGame.Persistence --startup-project OurGame.Api

# Mutation testing
cd api/OurGame.Application.Tests && dotnet stryker --config-file ../stryker-config.json --project OurGame.Application.csproj
```

### Frontend (`/web`)

```bash
npm install          # one-time setup
npm run dev          # Vite dev server (localhost:5173)
npm run build        # TypeScript check + Vite build
npm run storybook    # Component development
npm run generate:api # Regenerate TypeScript API client from running Functions (localhost:7071/openapi/v3.json)
```

### Local Infrastructure

```bash
# Start SQL Server 2022 (localhost:14330) + Azurite
docker compose -f docker-compose.local.yml up -d

# Seed database (applies migrations first)
docker compose -f docker-compose.local.yml --profile seed run --no-deps --rm seeder

# Stop
docker compose -f docker-compose.local.yml down
```

### SWA CLI (proxies frontend + backend on localhost:4280)

```bash
# Terminal 1
cd api/OurGame.Api && func start
# Terminal 2
cd web && npx swa start --config swa-cli.config.json
```

VS Code task `Dev: Start Backend Containers + SWA` runs the full local stack in sequence.

## Architecture

### Backend: Clean Architecture + CQRS

The API layer (`OurGame.Api`) contains only Azure Functions HTTP triggers. Business logic lives in `OurGame.Application` via MediatR handlers. `OurGame.Persistence` owns the EF Core 9 `OurGameContext`, ~85 entities, migrations, and 49 seed data classes representing a realistic Vale FC hierarchy.

- **Versioning**: Header-based (`api-version: 1.0`) — not URL-based.
- **Validation**: FluentValidation. Errors returned as RFC 7807 problem details.
- **Resilience**: Polly via `PollyX.cs` extension.
- **Preconditions**: `PreconditionX.cs` for guard checks.
- **Status codes**: `HttpStatusCodeX.cs`.
- **JSON**: camelCase throughout.

### Frontend: Feature-Organised Components

The TypeScript client in `src/api/` is **generated** — run `npm run generate:api` after backend changes; do not edit it manually. All routes are defined in the React Router config (no file-based routing). Path aliases: `@` → `src/`, `@api`, `@components`, `@pages`, `@data`, `@types`, `@utils`, `@stores`.

State: Zustand stores for global state; React Context for auth, theme, navigation, page title, and user preferences.

Type definitions live in `src/types/index.ts` (~700 lines). Use those; avoid `any`.

### Data Flow

Frontend → generated TypeScript client → Azure Functions trigger → MediatR handler in Application → EF Core → Azure SQL.

For complex queries, custom SQL is acceptable in the Persistence layer.

## Testing Conventions

**After implementing any backend feature, updating tests is not optional — it is the final step before the work is complete.**

### Where tests live

- `OurGame.Api.Tests` — HTTP endpoint behavior (status codes, request/response contracts, auth, serialization)
- `OurGame.Application.Tests` — MediatR handlers, FluentValidation validators, business logic, Polly policies
- `OurGame.Persistence` is excluded from coverage metrics — do not add tests there

### What to cover after a backend change

For every new or modified endpoint / handler, add or extend tests covering:
1. **Success path** — valid input returns expected status code and response shape
2. **Validation failures** — invalid/missing fields return 400 with RFC 7807 problem details
3. **Authorization** — unauthorized requests return 401/403 as appropriate
4. **Edge cases** — any conditional logic or branching introduced by the change

### Rules

- **No Playwright**: Do not add E2E browser tests. API unit coverage is the required default.
- Prefer extending existing test classes over creating new files where the subject already has coverage.
- Use xUnit + Moq. Mock dependencies at the handler boundary, not the EF Core layer.
- Run `dotnet test --configuration Release` after writing tests to confirm they pass before considering the feature done.

## Directory Documentation System

Every meaningful directory has a `README.md` with YAML frontmatter (`domain`, `technology`, `categories`, `related`). `ARCHITECTURE.md` at the repo root is the master index. **Keep both up to date** when adding directories or changing a folder's purpose — this is how LLMs get fast, accurate context without reading every file.

## API Development Notes

- All endpoints require OpenAPI documentation via the Azure Functions Worker OpenAPI extension.
- After adding or modifying endpoints, regenerate the frontend client with `npm run generate:api`.
- RPC-style endpoints (e.g. `/api/matches/{id}/calculate-ratings`) are acceptable where REST is inefficient.
- Maintain backward compatibility for at least one previous API version; mark deprecated endpoints with sunset dates in the OpenAPI spec.

## Deployment

Full production releases are triggered by pushing a semver git tag (`v1.2.0`). The `tag-release.yml` pipeline runs: infra (Bicep) → database (seeder) → Functions → Static Web App. PR previews are deployed automatically by `pr.yml` for non-Dependabot PRs touching `infrastructure/`, `api/`, or `web/`.

Required secrets: `AZURE_CREDENTIALS`, `SQL_ADMIN_PASSWORD`, `B2C_CLIENT_SECRET`, `VAPID_PRIVATE_KEY`.  
Required variables: `SQL_ADMIN_USERNAME`, `B2C_CLIENT_ID`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`.

Infrastructure entry point: `infrastructure/main-subscription.bicep` (subscription-level).
