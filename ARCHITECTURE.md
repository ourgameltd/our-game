---
purpose: Table of Contents for directory README files
updated: 2026-04-06
---

# Architecture — Directory README Index

This file serves as a master table of contents for all directory-level README files across the repository. Each README contains YAML frontmatter with metadata (`domain`, `technology`, `categories`, `related`) to provide LLM and developer context about that folder's purpose, contents, and relationships.

> **Maintainers**: Update this file when adding or removing directory READMEs. This should be reviewed on each PR that adds new folders.

## GitHub & DevOps

| Path | Description |
|---|---|
| [.github/README.md](.github/README.md) | GitHub config overview (workflows, agents, prompts) |
| [.github/workflows/README.md](.github/workflows/README.md) | CI/CD pipeline definitions (5 workflows) |
| [.github/agents/README.md](.github/agents/README.md) | Copilot agent definitions |
| [.github/prompts/README.md](.github/prompts/README.md) | Copilot prompt templates |
| [.vscode/README.md](.vscode/README.md) | VS Code tasks, launch configs, extensions |

## Backend — API Layer

| Path | Description |
|---|---|
| [api/README.md](api/README.md) | Backend solution root (4 projects + 2 test projects) |
| [api/OurGame.Api/README.md](api/OurGame.Api/README.md) | Azure Functions v4 HTTP triggers |
| [api/OurGame.Api/Attributes/README.md](api/OurGame.Api/Attributes/README.md) | Custom endpoint attributes |
| [api/OurGame.Api/Extensions/README.md](api/OurGame.Api/Extensions/README.md) | Function and HTTP request extensions |
| [api/OurGame.Api/Functions/README.md](api/OurGame.Api/Functions/README.md) | HTTP trigger functions by domain |
| [api/OurGame.Application/README.md](api/OurGame.Application/README.md) | Business logic (MediatR, FluentValidation, Polly) |
| [api/OurGame.Application/Abstractions/README.md](api/OurGame.Application/Abstractions/README.md) | Interfaces, exceptions, response types |
| [api/OurGame.Application/Extensions/README.md](api/OurGame.Application/Extensions/README.md) | Utility extension methods |
| [api/OurGame.Application/Services/README.md](api/OurGame.Application/Services/README.md) | Web Push notification services |
| [api/OurGame.Application/UseCases/README.md](api/OurGame.Application/UseCases/README.md) | CQRS use cases across 17 domains |
| [api/OurGame.Application/UseCases/Drills/DTOs/README.md](api/OurGame.Application/UseCases/Drills/DTOs/README.md) | Shared drill diagram JSON contract DTOs |
| [api/OurGame.Persistence/README.md](api/OurGame.Persistence/README.md) | Data access layer (EF Core 9) |
| [api/OurGame.Persistence/Data/README.md](api/OurGame.Persistence/Data/README.md) | EF Core configurations and seed data |
| [api/OurGame.Persistence/Enums/README.md](api/OurGame.Persistence/Enums/README.md) | Domain enumerations (21 enums) |
| [api/OurGame.Persistence/Models/README.md](api/OurGame.Persistence/Models/README.md) | Entity models (~85 entities) |
| [api/OurGame.Persistence/Migrations/README.md](api/OurGame.Persistence/Migrations/README.md) | EF Core migration history |
| [api/OurGame.Seeder/README.md](api/OurGame.Seeder/README.md) | Database migration and seeding console app |

## Backend — Tests

| Path | Description |
|---|---|
| [api/OurGame.Api.Tests/README.md](api/OurGame.Api.Tests/README.md) | API endpoint unit/contract tests |
| [api/OurGame.Application.Tests/README.md](api/OurGame.Application.Tests/README.md) | Application layer unit tests |

## Frontend — Web Layer

| Path | Description |
|---|---|
| [web/src/README.md](web/src/README.md) | Frontend source root |
| [web/src/api/README.md](web/src/api/README.md) | API client layer (generated + auth + hooks) |
| [web/src/components/README.md](web/src/components/README.md) | Reusable React components (15 domain folders) |
| [web/src/pages/README.md](web/src/pages/README.md) | Page route components (11 domain folders) |
| [web/src/contexts/README.md](web/src/contexts/README.md) | React Context providers |
| [web/src/hooks/README.md](web/src/hooks/README.md) | Custom React hooks |
| [web/src/data/README.md](web/src/data/README.md) | Mock and static data files |
| [web/src/constants/README.md](web/src/constants/README.md) | Application constants |
| [web/src/types/README.md](web/src/types/README.md) | TypeScript type definitions |
| [web/src/utils/README.md](web/src/utils/README.md) | Utility functions |
| [web/src/stories/README.md](web/src/stories/README.md) | Storybook component stories |
| [web/src/styles/README.md](web/src/styles/README.md) | Global CSS styles |

## Infrastructure & Documentation

| Path | Description |
|---|---|
| [infrastructure/README.md](infrastructure/README.md) | Azure Bicep IaC templates |
| [docs/README.md](docs/README.md) | Project documentation and runbooks |
| [scripts/README.md](scripts/README.md) | Utility scripts |
