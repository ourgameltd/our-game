---
domain: Business Logic
technology: [.NET 8, MediatR 12, FluentValidation 11, EF Core 9]
categories: [CQRS, Commands, Queries, Validation]
related:
  - api/OurGame.Application/Abstractions/
  - api/OurGame.Api/Functions/
  - api/OurGame.Application.Tests/
---

# UseCases

MediatR command and query handlers organised by domain. Each domain folder contains a `Commands/` subfolder for write operations and a `Queries/` subfolder for read operations. FluentValidation validators are co-located with their handlers.

## Domain Folders

| Folder | Description |
|---|---|
| `AgeGroups/` | Age group creation, updates, and queries |
| `Clubs/` | Club management, media, and configuration |
| `Coaches/` | Coach profiles and certifications |
| `DevelopmentPlans/` | Player development plans, goals, and progress |
| `DrillTemplates/` | Shareable drill template library |
| `Drills/` | Training drills with age group/team/club linking |
| `Formations/` | Formation definitions and position assignments |
| `Invites/` | Invite generation, redemption, and validation |
| `Matches/` | Match scheduling, lineups, reports, and attendance |
| `Notifications/` | In-app and push notification delivery |
| `Players/` | Player profiles, attributes, images, and reports |
| `PushSubscriptions/` | Web Push subscription management |
| `Reports/` | Player report cards and performance summaries |
| `Tactics/` | Tactical principles and team assignments |
| `Teams/` | Team roster management and configuration |
| `TrainingSessions/` | Training session scheduling and drill assignment |
| `Users/` | User registration, authentication, and profile management |

## Pattern

Each domain follows the CQRS pattern:

```
{Domain}/
  Commands/
    {Action}/
      {Action}Command.cs          — MediatR IRequest record
      {Action}Handler.cs          — MediatR IRequestHandler implementation
      {Action}Validator.cs        — FluentValidation AbstractValidator
  Queries/
    {Action}/
      {Action}Query.cs            — MediatR IRequest record
      {Action}Handler.cs          — MediatR IRequestHandler implementation
```
