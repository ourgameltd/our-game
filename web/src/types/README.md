---
domain: Frontend
technology: [TypeScript]
categories: [Type Definitions, Interfaces]
related:
  - web/src/api/index.ts
---

# types

TypeScript type definitions and interfaces used across the application.

## Recent Notes

- `TrainingSession` includes a session-specific category model (`Whole Part Whole`, `Skills Practice`, `Circuits`, `Scenario`) to keep session planning taxonomy separate from drill categories.

## Files

| File | Purpose |
|---|---|
| `index.ts` | Comprehensive type definitions (~700 lines) covering all domain models: clubs, teams, players, matches, formations, drills, tactics, development plans, notifications, and more |
