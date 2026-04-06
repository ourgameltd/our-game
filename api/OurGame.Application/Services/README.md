---
domain: Business Logic
technology: [.NET 8, Azure Communication Services, Web Push]
categories: [Email, Push Notifications, External Services]
related:
  - infrastructure/main.bicep
---

# Services

Service implementations for external integrations.

## Files

| File | Purpose |
|---|---|
| `IEmailService.cs` | Email service interface |
| `AcsEmailService.cs` | Azure Communication Services email implementation |
| `INotificationService.cs` | Notification service interface |
| `PushNotificationService.cs` | Web Push (VAPID) notification implementation |
