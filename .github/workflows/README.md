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

## Workflows

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| **PR Build** | `pr-build.yml` | PRs to `main`/`develop`, manual | Build, unit test with coverage, publish artifacts |
| **PR Preview Environment** | `pr-preview-environment.yml` | PR open/update/reopen/close to `main`/`develop` | Deploy/close SWA PR preview environments and update B2C app redirect URIs |
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

> This workflow requires the service principal used by `AZURE_CREDENTIALS` to have Microsoft Graph app role `Application.ReadWrite.All` (with admin consent) and an Entra directory role that can manage app registrations (for example `Application Administrator` or `Cloud Application Administrator`).

## Required Secrets & Variables

| Name | Type | Purpose |
|---|---|---|
| `AZURE_CREDENTIALS` | Secret | Azure Service Principal (JSON) |
| `SQL_ADMIN_PASSWORD` | Secret | Azure SQL admin password |
| `VAPID_PRIVATE_KEY` | Secret | Web Push VAPID private key used by the Function App |
| `B2C_CLIENT_SECRET` | Secret | Azure AD B2C client secret |
| `SQL_ADMIN_USERNAME` | Variable | SQL admin login (default: `ourgame_sql_admin`) |
| `B2C_CLIENT_ID` | Variable | Azure AD B2C client ID |
| `VAPID_PUBLIC_KEY` | Variable | Web Push VAPID public key exposed to clients |
| `VAPID_SUBJECT` | Variable | VAPID subject (default: `mailto:admin@ourgame.app`) |
| `ACS_DATA_LOCATION` | Variable | ACS data location (default: `Europe`) |
| `EMAIL_SENDER_LOCAL_PART` | Variable | Sender local part (default: `DoNotReply`) |
| `EMAIL_SENDER_CUSTOM_DOMAIN` | Variable | Sender domain override (default: empty for Azure-managed domain) |
