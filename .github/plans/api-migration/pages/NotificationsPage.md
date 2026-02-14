# Migration Plan: NotificationsPage

## File
`web/src/pages/NotificationsPage.tsx`

## Priority
**Low** — Only imports reference data for notification type color mapping.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `getNotificationTypeColors` | `@/data/referenceData` | Returns color classes for different notification types (info, warning, success, error) |

## Proposed API Changes

### No API endpoint needed for the color mapping
`getNotificationTypeColors` is a UI utility that maps notification type strings to Tailwind CSS color classes. This should remain client-side.

### Notification Data API (Future)
Notification content itself will need an API endpoint:
```
GET /api/notifications?page=1&pageSize=20
```

But the color mapping for types is purely a frontend concern.

### Recommended Action
Move `getNotificationTypeColors` to a shared constants/utils module.

## Implementation Checklist

- [ ] Move `getNotificationTypeColors` to shared constants or utils module
- [ ] Update import path in `NotificationsPage.tsx`
- [ ] Verify notification type badges display correct colors
- [ ] Future: Create `GET /api/notifications` endpoint for actual notification data
- [ ] Future: Create `useNotifications()` hook for fetching notification data

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `getNotificationTypeColors` | Shared constant/util | No API call — UI color mapping |

## Dependencies

- No other files currently import `getNotificationTypeColors`
- Notification data is currently not served by any API endpoint

## Notes
- This page likely shows hardcoded/demo notifications — the notification content will need its own API migration
- The color mapping function is a pure UI utility and should stay client-side
- Simple import path change for the reference data
