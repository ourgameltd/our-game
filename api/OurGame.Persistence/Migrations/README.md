---
domain: Data Access
technology: [EF Core 9]
categories: [Database, Migrations, Schema Management]
related:
  - api/OurGame.Persistence/Models/
  - api/OurGame.Seeder/Program.cs
---

# Migrations

EF Core 9 migration history tracking all database schema changes. Contains 15 migrations from initial schema creation through the latest additions.

## Managing Migrations

Add a new migration:
```bash
cd api
dotnet ef migrations add <MigrationName> --project OurGame.Persistence --startup-project OurGame.Api
```

Apply migrations locally:
```bash
dotnet ef database update --project OurGame.Persistence --startup-project OurGame.Api
```

In production, migrations are applied automatically by the `OurGame.Seeder` console app during deployment.
