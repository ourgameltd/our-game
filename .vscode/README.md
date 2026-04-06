---
domain: Developer Experience
technology: [VS Code]
categories: [IDE Configuration, Local Development]
related:
  - docker-compose.local.yml
  - web/swa-cli.config.json
---

# VS Code Workspace Configuration

Editor settings, launch configurations, and task definitions for local development.

## Files

| File | Purpose |
|---|---|
| `tasks.json` | VS Code tasks for starting Docker containers, seeding DB, and running SWA CLI |
| `launch.json` | Debug launch configurations for Azure Functions and browser |
| `settings.json` | Workspace editor settings |
| `extensions.json` | Recommended VS Code extensions |
| `mcp.json` | MCP server configuration for Copilot tool integrations |

## Key Tasks

| Task | Description |
|---|---|
| `Infra: Start Local Stack` | Starts SQL Server + Azurite via Docker Compose |
| `DB: Seed` | Runs migrations and seeds the database |
| `Web: SWA CLI` | Starts Vite + SWA CLI proxy on `localhost:4280` |
| `Dev: Start Backend Containers + SWA` | Runs all three above in sequence |
| `Infra: Stop Local Stack` | Stops Docker containers |
