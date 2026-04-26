---
domain: Business Logic
technology: [.NET 8, Web Push]
categories: [Push Notifications, External Services]
related:
  - infrastructure/main.bicep
---

# Services

Service implementations for external integrations.

## Files

| File | Purpose |
|---|---|
| `INotificationService.cs` | Notification service interface |
| `PushNotificationService.cs` | Web Push (VAPID) notification implementation |
