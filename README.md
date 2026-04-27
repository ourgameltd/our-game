# Our Game

Football management at all levels organised and done properly.

## Why?

Cause just now Scottish football is an underfunded shambles.

## Strategy Report

- Market, competitor, and go-to-market analysis: [`docs/market-competitive-analysis.md`](docs/market-competitive-analysis.md)

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript with Vite |
| **Backend** | Azure Functions v4 (.NET 8 Isolated Worker) |
| **Database** | Azure SQL Server Serverless (EF Core 9) |
| **Infrastructure** | Azure Bicep (subscription-level) |
| **Deployment** | GitHub Actions (tag-based releases) |
| **Local Dev** | Docker Compose (SQL Server + Azurite) + SWA CLI |
| **Messaging** | Web Push (VAPID) |
| **Monitoring** | Application Insights + Log Analytics |

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20.x+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Azure Functions Core Tools v4](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) (for local development)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (for deployment)

## Local Development

### Build the Solution

```bash
cd api
dotnet restore
dotnet build --configuration Release
```

### Local Infrastructure (Docker Compose)

The `docker-compose.local.yml` file starts SQL Server 2022 and Azurite (Azure Storage emulator):

```bash
# Start SQL Server + Azurite
docker compose -f docker-compose.local.yml up -d

# Stop
docker compose -f docker-compose.local.yml down
```

> **Note:** On Apple Silicon, SQL Server runs under `linux/amd64` emulation. SQL Server is exposed on `localhost:14330`.

### Database Migrations

If you need to apply EF Core migrations without seeding (e.g. after pulling new migration files), run:

```bash
cd api
dotnet ef database update --project OurGame.Persistence --startup-project OurGame.Api
```

To add a new migration after changing EF Core models:

```bash
cd api
dotnet ef migrations add <MigrationName> --project OurGame.Persistence --startup-project OurGame.Api
```

> The connection string is read from `api/OurGame.Api/local.settings.json`. Ensure SQL Server is running on `localhost:14330` first.

### Database Seeding

Seed the database with sample data using the seeder profile. This also applies any pending migrations before seeding:

```bash
docker compose -f docker-compose.local.yml --profile seed run --no-deps --rm seeder
```

The seeder applies EF Core migrations and populates all tables with realistic sample data (clubs, teams, players, formations, matches, etc.).

### VS Code Tasks (Recommended)

From `Terminal` → `Run Task`:

| Task | Description |
|---|---|
| `Infra: Start Local Stack` | Starts SQL Server + Azurite containers |
| `DB: Seed` | Runs migrations and seeds the database |
| `Web: SWA CLI` | Starts Vite + SWA CLI proxy on http://localhost:4280 |
| `Dev: Start Backend Containers + SWA` | Runs all three above in sequence |
| `Infra: Stop Local Stack` | Stops containers |

### One-Time Setup

```bash
cd web && npm install
```

### Running Manually

**Option 1 — SWA CLI (recommended)**:

The SWA CLI proxies the Vite dev server (`localhost:5173`) and Azure Functions (`localhost:7071`) together on `http://localhost:4280`.

```bash
# Terminal 1: Start Azure Functions
cd api/OurGame.Api && func start

# Terminal 2: Start SWA CLI
cd web && npx swa start --config swa-cli.config.json
```

**Option 2 — Separate servers (for debugging)**:

```bash
# Terminal 1: Azure Functions
cd api/OurGame.Api && func start

# Terminal 2: Vite dev server
cd web && npm run dev
```

The React app runs on `http://localhost:5173` and connects to the API at `http://localhost:7071/api`.

## Deployment

### Infrastructure

Infrastructure is managed with Azure Bicep at the subscription level. The `main-subscription.bicep` template creates the resource group and deploys all resources via `main.bicep`:

- Azure Static Web App (Standard tier) with linked Function App backend
- Azure Functions (Consumption Y1) on .NET 8 Isolated
- Azure SQL Server Serverless (GP_S_Gen5, auto-pause 60 min)
- Storage Account (StorageV2, TLS 1.2)
- Application Insights + Log Analytics
- Custom domain support (optional)

**Manual deployment:**

```bash
az login

az deployment sub create \
  --location westeurope \
  --template-file infrastructure/main-subscription.bicep \
  --parameters infrastructure/parameters-subscription.json \
  --parameters sqlAdminUsername=<username> \
  --parameters sqlAdminPassword=<password>
```

### GitHub Actions Pipelines

| Workflow | Trigger | Purpose |
|---|---|---|
| **PR Build, Test & Preview** (`pr.yml`) | Pull requests to `main` / `master` / `develop` | Always builds, tests with coverage, and publishes artifacts. For functional, non-Dependabot, same-repo PRs (touching `infrastructure/`, `api/`, or `web/`) also deploys an Azure Static Web Apps native PR preview environment under the production SWA and updates B2C redirect URIs. On PR close, closes the SWA preview environment and removes the PR's B2C redirect URI. |
| **Tag Release** (`tag-release.yml`) | Git tag `v*.*.*` or manual | Full deployment: infra → database → Functions → SWA |
| **Deploy SWA** (`deploy-swa.yml`) | Manual | Re-deploy frontend only |
| **Reset Database** (`reset-database.yml`) | Manual | Re-seed Azure SQL (with optional `--clean` flag) |
| **Stryker** (`stryker.yml`) | Manual | Mutation testing for Application and API layers |

#### PR Build, Test & Preview Pipeline

Runs on every pull request. Always validates: spins up a SQL Server 2022 service container, builds the full .NET solution, runs all unit tests with code coverage (XPlat Code Coverage), generates a coverage report (excluding `OurGame.Persistence`), builds the React frontend, and publishes the API. Coverage summaries are posted to the GitHub Actions step summary. Validation artifacts (`api-package`, `frontend-package`) are uploaded for downstream deployment.

For functional, non-Dependabot pull requests from the same repository touching `infrastructure/`, `api/`, or `web/`, the workflow then deploys the validated `frontend-package` to the **production Azure Static Web App as a native PR preview environment**. SWA automatically generates a per-PR preview hostname under its own DNS, and the workflow adds that preview's `/.auth/login/btoc/callback` redirect URI to the B2C app registration. SWA PR preview environments share the linked Function App backend of the production SWA; the API itself is only deployed by the Tag Release pipeline.

On PR close the workflow always runs a cleanup job that closes the SWA preview environment and removes the PR's B2C redirect URI.

#### Tag Release Pipeline

Triggered by pushing a semver tag (e.g. `v1.2.0`) or manually. Runs five jobs in sequence:

1. **build-backend** — Restores, publishes the .NET API, uploads artifact
2. **build-frontend** — `npm ci` + `npm run build`, uploads artifact
3. **deploy-infrastructure** — Deploys subscription-level Bicep template to Azure (requires `AZURE_CREDENTIALS`, `SQL_ADMIN_PASSWORD` secrets)
4. **provision-database** — Opens temporary firewall rule, runs the seeder (migrations + seed data), removes firewall rule
5. **deploy-function-app** — Deploys published API to Azure Function App
6. **deploy-static-web-app** — Deploys built frontend to Azure Static Web App, configures B2C auth settings

#### Required GitHub Secrets & Variables

| Name | Type | Purpose |
|---|---|---|
| `AZURE_CREDENTIALS` | Secret | Azure Service Principal credentials (JSON) |
| `SQL_ADMIN_PASSWORD` | Secret | Azure SQL admin password |
| `B2C_CLIENT_SECRET` | Secret | Azure AD B2C client secret |
| `SQL_ADMIN_USERNAME` | Variable | SQL admin username (defaults to `ourgame_sql_admin`) |
| `B2C_CLIENT_ID` | Variable | Azure AD B2C client ID |

## Testing

### Unit Tests

Two xUnit test projects mirror the main API layers:

- `OurGame.Api.Tests` — Tests Azure Functions endpoint behaviour (HTTP triggers, routing, validation)
- `OurGame.Application.Tests` — Tests business logic, use cases, and validation

```bash
cd api
dotnet test --configuration Release
```

### Mutation Testing

[Stryker.NET](https://stryker-mutator.io/docs/stryker-net/introduction/) is configured via `stryker-config.json`. Run locally or trigger the `Stryker` workflow manually:

```bash
cd api/OurGame.Application.Tests
dotnet stryker --config-file ../stryker-config.json --project OurGame.Application.csproj
```

### Code Coverage

Coverage reports are generated automatically in the PR Build pipeline using [ReportGenerator](https://github.com/danielpalme/ReportGenerator). The `OurGame.Persistence` assembly is excluded from coverage metrics.

## Project Structure

```
.
├── api/                                # .NET 8 Backend
│   ├── OurGame.Api/                    # Azure Functions HTTP triggers
│   ├── OurGame.Application/            # Business logic, services, use cases (MediatR)
│   ├── OurGame.Persistence/            # EF Core 9 models, migrations, seed data
│   ├── OurGame.Seeder/                 # Database migration & seeding console app
│   ├── OurGame.Api.Tests/              # API endpoint unit tests (xUnit + Moq)
│   ├── OurGame.Application.Tests/      # Business logic unit tests (xUnit)
│   ├── OurGame.Api.sln                 # Solution file
│   └── stryker-config.json             # Mutation testing configuration
├── web/                                # React 18 + TypeScript frontend
│   ├── src/
│   │   ├── api/                        # API client (generated via hey-api/openapi-ts)
│   │   ├── components/                 # Feature-organised React components
│   │   ├── pages/                      # Route page components
│   │   ├── contexts/                   # React Context providers
│   │   ├── hooks/                      # Custom React hooks
│   │   ├── stores/                     # Zustand state stores
│   │   ├── types/                      # TypeScript type definitions
│   │   └── utils/                      # Utility functions
│   ├── public/                         # Static assets & SWA config
│   └── swa-cli.config.json             # SWA CLI local dev config
├── infrastructure/                      # Azure Bicep IaC
│   ├── main-subscription.bicep          # Subscription-level entry point
│   ├── main.bicep                       # Resource group resources
│   └── parameters-subscription.json     # Default parameters
├── docs/                                # Documentation
├── scripts/                             # Setup & utility scripts
└── .github/workflows/                   # GitHub Actions pipelines
    ├── pr.yml                           # PR validation + ephemeral preview deploy
    ├── tag-release.yml                  # Full deployment on version tag
    ├── deploy-swa.yml                   # Manual frontend deployment
    ├── reset-database.yml               # Manual database reseed
    └── stryker.yml                      # Mutation testing
```

## Version Management

Versions are manually managed in `.csproj` project files. Update the `<Version>`, `<AssemblyVersion>`, and `<FileVersion>` properties as needed. Tag releases use semver format (`v1.0.0`).
