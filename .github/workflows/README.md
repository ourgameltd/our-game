---
domain: DevOps
technology: [GitHub Actions, Azure CLI, .NET 8, Node.js 20]
categories: [CI/CD, Deployment, Testing, Infrastructure]
related:
  - infrastructure/main-subscription.bicep
  - infrastructure/main.bicep
  - api/OurGame.Seeder/Program.cs
  - api/stryker-config.json
---

# GitHub Actions Workflows

CI/CD pipelines for building, testing, and deploying the OurGame platform.

## Naming Convention

Workflow display names use the format `Type: Purpose` so they group together in the GitHub Actions UI.

| Type | Used for | Choose this type when... |
|---|---|---|
| `Build` | Compiling, unit testing, and packaging artifacts | The workflow primarily validates code or produces build artifacts for later stages. |
| `Deploy` | Pushing artifacts or infrastructure to an environment | The workflow's main goal is releasing or updating an environment, even if it also runs database migrations or seed steps as part of that deployment. |
| `Database` | Schema or seed-data operations against a deployed database | The workflow's main goal is changing, resetting, migrating, or reseeding a database independently of a wider application deployment. |
| `Test` | Long-running or specialised test suites (for example mutation testing) | The workflow primarily executes an extended or non-standard test pass rather than a normal build validation. |

Use the type that best matches the workflow's primary outcome, not every step it performs. For example, `tag-release.yml` remains a `Deploy` workflow because its purpose is a full release, while `reset-database.yml` is a `Database` workflow because the database operation is the whole point of the run.
## Workflows

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| **PR Build** | `pr-build.yml` | PRs to `main`/`develop`, manual | Build, unit test with coverage, publish artifacts |
| **PR Preview Environment** | `pr-preview-environment.yml` | PR open/update/reopen/close to `main`/`master`/`develop` | Deploy/close SWA PR preview environments and update B2C app redirect URIs |
| **Tag Release** | `tag-release.yml` | Git tag `v*.*.*`, manual | Full deployment: infra → database → Functions → SWA |
| **Deploy SWA** | `deploy-swa.yml` | Manual | Re-deploy frontend only to Azure Static Web Apps |
| **Reset Database** | `reset-database.yml` | Manual | Re-seed Azure SQL with optional `--clean` flag |
| **Stryker** | `stryker.yml` | Manual | Mutation testing for Application and API layers (parallel jobs) |

## PR Build Pipeline

- Spins up SQL Server 2022 service container
- Builds .NET solution, runs xUnit tests with XPlat Code Coverage
- Generates coverage report via ReportGenerator (excludes `OurGame.Persistence`)
- Posts coverage summary to GitHub Actions step summary
- Builds React frontend (`npm ci` + `npm run build`)
- Publishes API artifact

## Tag Release Pipeline

Runs six sequential jobs:

1. **build-backend** — `dotnet publish` API, upload artifact
2. **build-frontend** — `npm ci` + `npm run build`, upload artifact
3. **deploy-infrastructure** — Subscription-level Bicep deployment to Azure
4. **provision-database** — Temporary firewall rule → run Seeder (migrations + seed) → remove rule
5. **deploy-function-app** — Deploy to Azure Function App
6. **deploy-static-web-app** — Deploy frontend, configure B2C auth settings

## PR Preview Environment Pipeline

- Builds frontend on PR open/synchronize/reopen
- Deploys PR preview environment to Azure Static Web Apps
- Adds `/.auth/login/btoc/callback` preview URI to the B2C app registration (`B2C_CLIENT_ID`)
- On PR close, closes the SWA preview environment and removes that preview callback URI from the app registration

> **Cross-tenant setup (B2C tenant is separate from main Entra tenant):** The B2C app registration typically lives in a dedicated Azure AD B2C tenant, while `AZURE_CREDENTIALS` is a service principal in the main Entra tenant. Because `az ad app` commands only see app registrations in the logged-in tenant, you must set the optional `B2C_CREDENTIALS` secret to a service principal **in the B2C tenant** with `Application.ReadWrite.All` (Microsoft Graph, admin consent) and a directory role such as `Application Administrator`. When `B2C_CREDENTIALS` is present, the workflow will re-login to the B2C tenant before updating redirect URIs.
>
> If `B2C_CREDENTIALS` is not set, the app-registration update step is skipped with a warning and the preview deployment itself still succeeds.

## Required Secrets & Variables

| Name | Type | Purpose |
|---|---|---|
| `AZURE_CREDENTIALS` | Secret | Azure Service Principal (JSON) for main Entra tenant (SWA, Functions, SQL) |
| `B2C_CREDENTIALS` | Secret | Azure Service Principal (JSON) in the B2C tenant — required for automated redirect URI management. Must have `Application.ReadWrite.All` (admin consent) and `Application Administrator` directory role in the B2C tenant. |
| `SQL_ADMIN_PASSWORD` | Secret | Azure SQL admin password |
| `VAPID_PRIVATE_KEY` | Secret | Web Push VAPID private key used by the Function App |
| `B2C_CLIENT_SECRET` | Secret | Azure AD B2C client secret |
| `SQL_ADMIN_USERNAME` | Variable | SQL admin login (default: `ourgame_sql_admin`) |
| `B2C_CLIENT_ID` | Variable | Azure AD B2C client ID |
| `VAPID_PUBLIC_KEY` | Variable | Web Push VAPID public key exposed to clients |
| `VAPID_SUBJECT` | Variable | VAPID subject (default: `mailto:admin@ourgame.app`) |
