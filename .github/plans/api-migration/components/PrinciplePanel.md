# Migration Plan: PrinciplePanel Component

## File
`web/src/components/tactics/PrinciplePanel.tsx`

## Priority
**Low** — Only imports a TypeScript type; no runtime data dependency.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `ResolvedPosition` | `@/data/tactics` | TypeScript type import only — used for prop typing |

## Proposed API Changes

### No API endpoint needed
This is a **type-only import**. The `ResolvedPosition` type just needs to be moved to the shared types directory.

### Recommended Action
Move the `ResolvedPosition` type definition to `web/src/types/index.ts` (or a dedicated `web/src/types/tactics.ts`) and update the import.

## Implementation Checklist

- [ ] Move `ResolvedPosition` type to `web/src/types/` (or add to existing types file)
- [ ] Update import path in `PrinciplePanel.tsx`
- [ ] Update import path in all other consumers of `ResolvedPosition` type
- [ ] Verify TypeScript compilation passes

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `ResolvedPosition` type | `@/types` | Type-only — no runtime change |

## Dependencies

- `TacticDisplay.tsx` also imports `ResolvedPosition` type from `@/data/tactics`
- `TacticDisplay.stories.tsx` imports `getResolvedPositions` function (runtime dependency)
- `AddEditTacticPage.tsx` and `TacticDetailPage.tsx` import `getResolvedPositions` function

## Notes
- Zero runtime impact — this is purely a TypeScript type relocation
- Should be done alongside the `TacticDisplay.tsx` type migration
- The `ResolvedPosition` type may already exist in or be derivable from API DTOs
