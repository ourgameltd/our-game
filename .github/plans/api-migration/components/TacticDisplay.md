# Migration Plan: TacticDisplay Component

## File
`web/src/components/tactics/TacticDisplay.tsx`

## Priority
**Low** — Only imports a TypeScript type; no runtime data dependency.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `ResolvedPosition` | `@/data/tactics` | TypeScript type import only — used for prop typing |

## Proposed API Changes

### No API endpoint needed
This is a **type-only import**. The `ResolvedPosition` type needs to be moved to the shared types directory.

### Recommended Action
Move the `ResolvedPosition` type definition to `web/src/types/` and update the import. Coordinate with `PrinciplePanel.tsx` which has the same dependency.

## Implementation Checklist

- [ ] Move `ResolvedPosition` type to `web/src/types/` (coordinate with PrinciplePanel migration)
- [ ] Update import path in `TacticDisplay.tsx`
- [ ] Verify TypeScript compilation passes
- [ ] Verify tactic pitch rendering still works

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `ResolvedPosition` type | `@/types` | Type-only — no runtime change |

## Dependencies

- `PrinciplePanel.tsx` — same type import, migrate together
- `TacticDisplay.stories.tsx` — imports runtime functions from `@/data/tactics` (separate migration)
- Parent pages pass tactic data and resolved positions via props

## Notes
- Zero runtime impact — purely TypeScript type relocation
- The component itself is a pure rendering component that takes all data via props
- `ResolvedPosition` may be representable via API DTOs once tactics endpoints exist
