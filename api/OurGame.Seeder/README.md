---
domain: Data Access
technology: [.NET 8, EF Core 9]
categories: [Database, Seeding, Migrations, DevOps]
related:
  - api/OurGame.Persistence/Data/SeedData/
  - api/OurGame.Persistence/Migrations/
  - docker-compose.local.yml
  - .github/workflows/tag-release.yml
  - .github/workflows/reset-database.yml
---

# OurGame.Seeder

Console application that applies EF Core migrations and seeds the database with initial data. Used both locally (via Docker Compose) and in CI/CD pipelines.

## Key Files

| File | Purpose |
|---|---|
| `Program.cs` | Entry point — applies pending migrations then seeds all tables in FK-dependency order |
| `OurGame.Seeder.csproj` | Project file referencing `OurGame.Persistence` |

## Usage

### Local (Docker Compose)
```bash
docker compose -p infrastructure -f docker-compose.local.yml --profile seed run --no-deps --rm seeder
```

### With Clean Flag
```bash
# Truncates all data before reseeding (disables/re-enables FK constraints)
docker compose -p infrastructure -f docker-compose.local.yml --profile seed run --no-deps --rm seeder --clean
```

### Direct Execution
```bash
cd api
dotnet run --project OurGame.Seeder -- --connection "Server=localhost,14330;Database=OurGame;User Id=sa;Password=<pwd>;TrustServerCertificate=True"
```
