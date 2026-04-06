---
domain: Frontend
technology: [React 18, TypeScript 5.9, Vite 8, Tailwind CSS 4.2]
categories: [UI, SPA, Components, State Management]
related:
  - web/src/App.tsx
  - web/src/main.tsx
  - web/package.json
  - web/vite.config.ts
---

# src

React 18 application source code. Structured by feature domain with shared components, contexts, hooks, and utilities.

## Child Folders

| Folder | Purpose |
|---|---|
| `api/` | API client layer — generated TypeScript client, auth helpers, React Query hooks |
| `components/` | Reusable React components organised by domain (15 folders) |
| `pages/` | Page-level route components organised by domain (11 domain folders + top-level pages) |
| `contexts/` | React Context providers (Auth, Theme, Navigation, PageTitle, UserPreferences) |
| `hooks/` | Custom React hooks (invites, page titles, push notifications, social meta tags) |
| `data/` | Mock and static data files for development and fallbacks (16 domain files) |
| `constants/` | Application constant definitions |
| `types/` | TypeScript type definitions and interfaces |
| `utils/` | Utility functions (routes, colours, attributes, assets) |
| `stories/` | Storybook component stories |
| `styles/` | Global CSS styles |

## Key Files

| File | Purpose |
|---|---|
| `App.tsx` | Root React component with React Router configuration |
| `main.tsx` | Application entry point — renders App into DOM |
| `vite-env.d.ts` | Vite TypeScript environment declarations |
