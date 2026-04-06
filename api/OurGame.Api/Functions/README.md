---
domain: API
technology: [Azure Functions v4, .NET 8, OpenAPI 3.0]
categories: [HTTP Triggers, REST API, CQRS]
related:
  - api/OurGame.Application/UseCases/
  - api/OurGame.Api/Extensions/
  - api/OurGame.Api.Tests/
---

# Functions

HTTP trigger function classes organised by domain. Each function file defines one or more Azure Functions endpoints that dispatch MediatR commands/queries to the Application layer.

## Top-level Function Files

| File | Domains Covered |
|---|---|
| `AgeGroupFunctions.cs` | Age group CRUD |
| `ClubFunctions.cs` | Club management |
| `DevelopmentPlanFunctions.cs` | Player development plans |
| `DrillFunctions.cs` | Drill management |
| `DrillTemplateFunctions.cs` | Drill template management |
| `FormationFunctions.cs` | Formation CRUD and linking |
| `GetRolesFunctions.cs` | User role retrieval |
| `InviteFunctions.cs` | Invite generation and redemption |
| `MatchFunctions.cs` | Match scheduling and reporting |
| `NotificationFunctions.cs` | Notification delivery and management |
| `PushSubscriptionFunctions.cs` | Web Push subscription management |
| `ReportFunctions.cs` | Player report cards |
| `TacticFunctions.cs` | Tactic principles management |
| `TeamFunctions.cs` | Team CRUD |
| `TrainingSessionFunctions.cs` | Training session scheduling |
| `UserFunctions.cs` | User profile and management |

## Subdomain Folders

More complex domains have additional endpoints in subfolders:

| Folder | Purpose |
|---|---|
| `AgeGroups/` | Additional age group operations |
| `Clubs/` | Club-specific operations (media, links) |
| `Coaches/` | Coach management endpoints |
| `DevelopmentPlans/` | Development plan detail operations |
| `DrillTemplates/` | Drill template linking and sharing |
| `Drills/` | Drill linking and sharing |
| `Players/` | Player attributes, images, reports, parents |
| `Tactics/` | Tactic assignment operations |
| `Teams/` | Team-specific operations (coaches, players) |
