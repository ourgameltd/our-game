---
domain: Business Logic
technology: [.NET 8, MediatR]
categories: [Interfaces, Exceptions, CQRS]
related:
  - api/OurGame.Application/UseCases/
---

# Abstractions

Core interfaces, exception types, and response models used across the Application layer.

## Child Folders

| Folder | Purpose |
|---|---|
| `Exceptions/` | Custom exception classes for domain-specific error handling |
| `Responses/` | Shared response DTOs and result types |

## Key Files

| File | Purpose |
|---|---|
| `ICommand.cs` | MediatR command interface marker for write operations |
| `IQuery.cs` | MediatR query interface marker for read operations |
