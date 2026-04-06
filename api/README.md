---
domain: Backend
technology: [.NET 8, Azure Functions v4, EF Core 9, MediatR, FluentValidation]
categories: [API, Business Logic, Data Access, Testing]
related:
  - api/OurGame.Api.sln
  - .github/workflows/pr-build.yml
  - .github/workflows/tag-release.yml
  - infrastructure/main.bicep
---

# api

.NET 8 backend solution containing 4 production projects and 2 test projects, structured using Clean Architecture principles with CQRS via MediatR.

## Child Folders

| Folder | Purpose |
|---|---|
| `OurGame.Api/` | Azure Functions v4 HTTP triggers — the API surface layer |
| `OurGame.Application/` | Business logic, use cases, services (MediatR handlers, FluentValidation, Polly) |
| `OurGame.Persistence/` | EF Core 9 DbContext, entity models, migrations, seed data, and Fluent API configurations |
| `OurGame.Seeder/` | Console app that applies EF Core migrations and seeds the database |
| `OurGame.Api.Tests/` | xUnit + Moq tests for API endpoint behaviour |
| `OurGame.Application.Tests/` | xUnit tests for business logic and use case handlers |
| `Tools/` | Reserved for development tooling |

## Key Files

| File | Purpose |
|---|---|
| `OurGame.Api.sln` | .NET solution file referencing all projects |
| `stryker-config.json` | Stryker.NET mutation testing configuration |
| `verify-users.sql` | SQL script for user verification queries |

## Build & Test

```bash
cd api
dotnet restore
dotnet build --configuration Release
dotnet test --configuration Release
```
