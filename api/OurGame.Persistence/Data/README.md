---
domain: Data Access
technology: [EF Core 9]
categories: [Configuration, Seed Data]
related:
  - api/OurGame.Persistence/Models/
  - api/OurGame.Seeder/Program.cs
---

# Data

EF Core Fluent API configurations and database seed data.

## Child Folders

| Folder | Purpose |
|---|---|
| `Configurations/` | `IEntityTypeConfiguration<T>` implementations for Fluent API mapping (table names, relationships, constraints) |
| `SeedData/` | 49 static seed data classes used by `OurGame.Seeder` to populate the database with realistic data (Vale FC, players, formations, etc.) |
