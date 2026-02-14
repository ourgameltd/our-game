# Migration Plan: TacticDisplay.stories

## File
`web/src/stories/TacticDisplay.stories.tsx`

## Priority
**Low** — Storybook story file; development/documentation only, not production code.

## Current Static Data Usage

| Import | Source File | Usage |
|---|---|---|
| `sampleTactics` | `@/data/tactics` | Provides 3 sample tactic objects for story variants (High Press 4-4-2, Blues variant, Compact 4-2-3-1) |
| `getResolvedPositions` | `@/data/tactics` | Resolves positions with inheritance for story props |

## Proposed API Changes

### No API endpoint needed
This is a **Storybook story file** — stories use static mock data by design. Storybook runs independently of the API.

### Recommended Action
Create a dedicated Storybook mock/fixture file for tactic data instead of importing from the shared `data/` directory.

Options:
1. **Create story fixture**: `web/src/stories/fixtures/tactics.ts` with minimal sample data
2. **Inline mock data**: Define sample tactics directly in the story file
3. **Keep as-is**: If `data/` files are retained as dev seed data, stories can continue using them

## Implementation Checklist

- [ ] Decide on mock data strategy for stories (fixtures vs inline vs keep data/)
- [ ] If creating fixtures: Create `web/src/stories/fixtures/tactics.ts` with 2-3 sample tactics
- [ ] Move `ResolvedPosition` type to shared types (same as component migration)
- [ ] If `getResolvedPositions` stays client-side: can continue using it from a util, not data/
- [ ] Update imports
- [ ] Verify all story variants render correctly in Storybook

## Data Mapping

| Current (Static) | Target | Notes |
|---|---|---|
| `sampleTactics[0]` (High Press 4-4-2) | Story fixture or inline mock | First story variant |
| `sampleTactics[1]` (Blues variant) | Story fixture or inline mock | Inheritance variant |
| `sampleTactics[2]` (Compact 4-2-3-1) | Story fixture or inline mock | Second formation |
| `getResolvedPositions(tactic)` | Utility function (not data/) | Position resolution |

## Dependencies

- `TacticDisplay.tsx` component — the component being storied
- `PrinciplePanel.tsx` — type dependency on `ResolvedPosition`
- Stories should be self-contained with their own fixtures

## Notes
- Lowest priority — stories don't affect production functionality
- Stories should use minimal, focused mock data rather than full sample datasets
- The `ResolvedPosition` type migration is shared with component migrations
- Consider using Storybook's built-in args/controls for dynamic tactic manipulation
- If `data/` directory is kept for development purposes, stories can continue using it indefinitely
