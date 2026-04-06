---
domain: Data Access
technology: [.NET 8, EF Core 9, Azure SQL Server]
categories: [ORM, Database, Migrations, Entity Models]
related:
  - api/OurGame.Persistence/OurGame.Persistence.csproj
  - api/OurGame.Persistence/DependencyResolutionX.cs
  - api/OurGame.Seeder/Program.cs
  - infrastructure/main.bicep
---

# OurGame.Persistence

Data access layer built with Entity Framework Core 9. Contains the `OurGameContext` DbContext, entity models, Fluent API configurations, migrations, and seed data definitions.

## Child Folders

| Folder | Purpose |
|---|---|
| `Models/` | Entity model classes (~85 entities including partial classes for the DbContext) |
| `Data/` | EF Core Fluent API configurations (`Configurations/`) and seed data classes (`SeedData/`) |
| `Migrations/` | EF Core migration history (15 migrations from initial create through latest schema changes) |
| `Enums/` | Domain enumerations (21 enums: player positions, match statuses, invite types, etc.) |

## Key Files

| File | Purpose |
|---|---|
| `DependencyResolutionX.cs` | Registers `OurGameContext` with DI using connection string |
| `OurGameContextFactory.cs` | Design-time DbContext factory for EF Core CLI tooling |
| `efpt.config.json` | EF Core Power Tools configuration |
| `OurGame.Persistence.csproj` | Project file with EF Core and SQL Server NuGet references |
