---
domain: Business Logic
technology: [.NET 8, MediatR 12, FluentValidation 11, Polly 8]
categories: [CQRS, Validation, Resilience, Services]
related:
  - api/OurGame.Application/DependencyResolutionX.cs
  - api/OurGame.Application/OurGame.Application.csproj
  - api/OurGame.Api/Program.cs
---

# OurGame.Application

Business logic layer implementing CQRS with MediatR. Contains use case handlers, FluentValidation validators, Polly resilience policies, and service implementations.

## Child Folders

| Folder | Purpose |
|---|---|
| `UseCases/` | MediatR command and query handlers organised by domain (17 domains) |
| `Abstractions/` | Interfaces (`ICommand`, `IQuery`), exceptions, and response types |
| `Extensions/` | Utility extension methods (HTTP status codes, Polly policies, preconditions, string helpers) |
| `Services/` | Service implementations for email (ACS) and push notifications (VAPID) |

## Key Files

| File | Purpose |
|---|---|
| `DependencyResolutionX.cs` | Service registration — registers MediatR, FluentValidation, Polly, and service implementations |
| `OurGame.Application.csproj` | Project file with NuGet package references |

## Recent Updates

- Player update command handling now enforces field-level authorization for linked accounts:
  - Coach/admin: full edit access
  - Linked player/parent: cannot modify association ID, preferred positions, archive status, or team assignments
  - Unauthorized callers receive a forbidden error from the application layer
- Player emergency contact command DTOs and handlers now support an optional contact email field.
- Coach update command DTOs and handlers now support unlinking linked accounts:
  - `UnlinkCoachAccount` to remove the coach's own user link
  - `RemoveLinkedEmergencyContactIds` to remove linked emergency-contact accounts
