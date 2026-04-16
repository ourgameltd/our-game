---
domain: Frontend
technology: [React 18, TypeScript, React Router 6]
categories: [Pages, Routing, UI]
related:
  - web/src/App.tsx
  - web/src/components/
  - web/src/api/hooks.ts
---

# pages

Page-level route components. Each domain folder contains the page components rendered by React Router. Top-level pages handle cross-cutting features.

## Top-level Pages

| File | Route | Purpose |
|---|---|---|
| `HomePage.tsx` | `/` | Dashboard landing page |
| `NotificationsPage.tsx` | `/notifications` | Notification centre |
| `HelpSupportPage.tsx` | `/help` | Help and support page |
| `InviteAcceptPage.tsx` | `/invite/:token` | Invite redemption flow |

## Domain Folders

| Folder | Purpose |
|---|---|
| `ageGroups/` | Age group management pages |
| `auth/` | Authentication pages (login, register, password reset) |
| `clubs/` | Club overview and management pages |
| `coaches/` | Coach profile and certification pages |
| `drills/` | Drill library and builder pages |
| `matches/` | Match scheduling, lineups, and report pages |
| `players/` | Player profiles, attributes, and development pages |
| `profile/` | User profile management pages |
| `public/` | Public-facing pages (club page, fan view) |
| `tactics/` | Tactics and formation management pages |
| `teams/` | Team overview and roster pages |

## Recent Updates

- Team training session edit page now supports a dedicated session category selector and displays the selected session category beside the page title.
- Drill form reference-link add action now uses shared add-button styling for visual consistency with other add actions.
