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
| **PR Build, Test & Preview** | `pr.yml` | PR open/update/reopen/close to `main`/`master`/`develop`, manual | Always validates (build, unit test with coverage, publish artifacts). For functional, non-Dependabot, same-repo PRs touching `infrastructure/`, `api/`, or `web/`, also deploys the full stack to the shared environment (infra → database → Functions) and then deploys an Azure Static Web Apps native PR preview environment, adding the PR's B2C redirect URI. On PR close, closes the SWA preview environment and removes the PR's B2C redirect URI. |
| **Tag Release** | `tag-release.yml` | Git tag `v*.*.*`, manual | Full deployment: infra → database → Functions → SWA |
| **Deploy SWA** | `deploy-swa.yml` | Manual | Re-deploy frontend only to Azure Static Web Apps |
| **Reset Database** | `reset-database.yml` | Manual | Re-seed Azure SQL with optional `--clean` flag |
| **Stryker** | `stryker.yml` | Manual | Mutation testing for Application and API layers (parallel jobs) |

## PR Build, Test & Preview Pipeline

`pr.yml` merges the previous `pr-build.yml` and `pr-preview-environment.yml` workflows into one pipeline with five job tiers:

### 1. `changes` — change detection (always for non-closed PRs)

- Compares `pull_request.base.sha` to `pull_request.head.sha`
- Outputs `infra` (`infrastructure/**`), `api` (`api/**`), `web` (`web/**`), and `functional` (any of the three)
- Outputs `isDependabot` (`github.actor == 'dependabot[bot]'`) and `isFork` (PR head repo differs from base repo)

### 2. `build` — validation (always for non-closed PRs)

- Spins up SQL Server 2022 service container
- Builds .NET solution, runs xUnit tests with XPlat Code Coverage
- Generates coverage report via ReportGenerator (excludes `OurGame.Persistence`)
- Posts coverage summary to GitHub Actions step summary
- Publishes API artifact (`api-package`) for downstream deployment
- Builds React frontend and publishes `frontend-package` artifact

### 3. `deploy-infrastructure` — conditional infrastructure deployment

Runs only for functional, non-Dependabot, same-repo PRs (same conditions as preview deployment):

- Logs into Azure with `AZURE_CREDENTIALS`
- Deploys subscription-level Bicep (`infrastructure/main-subscription.bicep`) into the shared environment
- Captures resource outputs (resource group, SWA name, Function App name, SQL server details) for downstream jobs

### 4. `deploy-database` — conditional database migration + seed

- Adds a temporary SQL firewall rule for the GitHub runner IP
- Runs `OurGame.Seeder` against Azure SQL (migrations + seed data)
- Always removes the temporary firewall rule

### 5. `deploy-function-app` — conditional API deployment

- Downloads the validated `api-package` artifact
- Deploys it to the Function App using `Azure/functions-action@v1`

### 6. `deploy-preview` — conditional preview deployment

Runs only when **all** of these are true:

- PR action is not `closed`
- `functional` change detected (`infrastructure/`, `api/`, or `web/`)
- PR is not from Dependabot
- PR head is in the same repository (no forks)

When those conditions are met (and after infra/database/API jobs succeed), the job:

- Retrieves the deployment token from the Static Web App output by the infra deployment
- Uses `Azure/static-web-apps-deploy@v1` with `action: upload` and the validated `frontend-package` artifact, which makes Azure SWA automatically create or update a native **PR preview environment** under the production SWA's DNS (e.g. `<env-name>.<region>.<n>.azurestaticapps.net`)
- Logs into the B2C tenant (when `B2C_CREDENTIALS` is set) and adds the preview's `/.auth/login/btoc/callback` redirect URI to the B2C app registration
- Uses GitHub environment `live` with the SWA preview URL as the deployment URL

### 7. `close-preview` — always-on cleanup on PR close

Runs on every PR `closed` event regardless of changed paths or actor:

- Resolves the SWA preview environment hostname for the PR
- Calls `Azure/static-web-apps-deploy@v1` with `action: close` to tear down the preview environment
- Logs into the B2C tenant and removes the PR's redirect URI from the app registration
- Reports the result in the run summary

> **Dependabot PRs:** Always validated, never deployed.

## Tag Release Pipeline

Runs six sequential jobs:

1. **build-backend** — `dotnet publish` API, upload artifact
2. **build-frontend** — `npm ci` + `npm run build`, upload artifact
3. **deploy-infrastructure** — Subscription-level Bicep deployment to Azure
4. **provision-database** — Temporary firewall rule → run Seeder (migrations + seed) → remove rule
5. **deploy-function-app** — Deploy to Azure Function App
6. **deploy-static-web-app** — Deploy frontend, configure B2C auth settings

> **Cross-tenant B2C setup:** The B2C app registration typically lives in a dedicated Azure AD B2C tenant, while `AZURE_CREDENTIALS` is a service principal in the main Entra tenant. Because `az ad app` commands only see app registrations in the logged-in tenant, set `B2C_CREDENTIALS` to a service principal **in the B2C tenant** with `Application.ReadWrite.All` (Microsoft Graph, admin consent) and a directory role such as `Application Administrator`. When `B2C_CREDENTIALS` is present, both `deploy-preview` and `close-preview` re-login to the B2C tenant before updating redirect URIs. If `B2C_CREDENTIALS` is missing, the URI add/remove step is skipped with a warning and the rest of the workflow continues.

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
