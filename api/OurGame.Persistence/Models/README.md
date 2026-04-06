---
domain: Data Access
technology: [EF Core 9, .NET 8]
categories: [Entity Models, Domain Model, Database Schema]
related:
  - api/OurGame.Persistence/Data/Configurations/
  - api/OurGame.Persistence/Migrations/
  - api/OurGame.Persistence/Enums/
---

# Models

Entity model classes mapped to database tables via EF Core 9. Contains ~85 files including partial classes for the `OurGameContext` DbContext.

## Key Entities

| Entity | Description |
|---|---|
| `Club.cs` | Football club with branding, constitution, and settings |
| `Team.cs` | Team within an age group (e.g. Reds, Blues) |
| `AgeGroup.cs` | Age group (e.g. 2014, 2015, Senior, Amateur) |
| `Player.cs` | Player profile with personal details |
| `PlayerAttribute.cs` | EA FC-style attribute ratings (35 abilities per player) |
| `Coach.cs` | Coach profile and certifications |
| `Match.cs` | Scheduled or completed match with opposition, location, weather |
| `MatchReport.cs` | Post-match report with ratings and events |
| `Formation.cs` | Tactical formation (4-3-3, 4-4-2, etc.) with positions |
| `TrainingSession.cs` | Training session with drills and attendance |
| `Drill.cs` / `DrillTemplate.cs` | Training drills and shareable templates |
| `DevelopmentPlan.cs` | Player development plan with goals and progress |
| `Invite.cs` | Invite link for role-based registration |
| `User.cs` | Authenticated user with role assignments |
| `Notification.cs` | In-app notification |
| `PushSubscription.cs` | Web Push subscription for browser notifications |
| `Kit.cs` / `KitOrder.cs` | Kit definitions and order tracking |
| `OurGameContext.cs` | EF Core DbContext with DbSet declarations (with partial classes) |
