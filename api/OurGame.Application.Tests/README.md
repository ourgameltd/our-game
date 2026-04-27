---
domain: Testing
technology: [.NET 8, xUnit, Moq, EF Core 9]
categories: [Unit Tests, Business Logic Testing, CQRS Testing]
related:
  - api/OurGame.Application/UseCases/
  - api/OurGame.Application/Services/
  - .github/workflows/pr.yml
  - api/stryker-config.json
---

# OurGame.Application.Tests

Unit tests for MediatR command/query handlers, validators, and services in the Application layer.

## Structure

Tests are organised by domain, mirroring the `UseCases/` structure:

| Folder | Tests For |
|---|---|
| `AgeGroups/` | Age group handlers |
| `Clubs/` | Club management handlers |
| `Coaches/` | Coach profile handlers |
| `DevelopmentPlans/` | Development plan handlers |
| `Drills/` | Drill handlers |
| `DrillTemplates/` | Drill template handlers |
| `Exceptions/` | Custom exception behaviour |
| `Extensions/` | Extension method tests |
| `Formations/` | Formation handlers |
| `Invites/` | Invite handlers |
| `Matches/` | Match handlers |
| `Players/` | Player handlers |
| `Reports/` | Report handlers |
| `Responses/` | Response DTO tests |
| `Tactics/` | Tactic handlers |
| `Teams/` | Team handlers |
| `TrainingSessions/` | Training session handlers |
| `Users/` | User handlers |
| `TestInfrastructure/` | Shared test helpers and mock DbContext setup |

## Key Files

| File | Purpose |
|---|---|
| `CreatePlayerHandlerTests.cs` | Standalone player creation handler tests |
| `MatchSaveAttendanceValidationTests.cs` | Match attendance validation tests |
| `GlobalUsings.cs` | Global using directives for test project |
