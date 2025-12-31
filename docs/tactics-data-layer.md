# Tactics System Data Layer

## Overview

The tactics data layer provides a comprehensive system for managing tactical formations and their inheritance across different organizational levels (club, age group, team). This implementation supports the tactics system feature with position overrides, tactical relationships, and scope-based access control.

## Architecture

### Type Hierarchy

```
Formation (base) → Club Tactic → Team Tactic
```

Each level can override positions and add tactical instructions while inheriting from parent levels.

### Type Definitions

Located in `src/types/index.ts`:

- **TacticalDirection**: Defines how a position behaves (`'attacking' | 'defensive' | 'balanced'`)
- **TacticalPositionOverride**: Allows overriding position coordinates and tactical instructions
- **TacticalRelationship**: Defines connections between positions (passing lanes, combinations)
- **TacticScope**: Controls where a tactic is accessible (global, club, age-group, team)
- **Tactic**: Main tactic interface with inheritance support
- **ResolvedPosition**: Fully resolved position after applying all inheritance
- **OverrideInfo**: Information about overrides for UI display

## Sample Data

Located in `src/data/tactics.ts`, includes:

1. **Club-Level Tactic**: "High Press 4-4-2"
   - Based on 4-4-2 Classic formation
   - Available to all teams in Vale FC
   - Pushes strikers higher (y: 85)
   - Defines central midfield partnerships

2. **Team-Level Tactic**: "2015 Blues High Press"
   - Inherits from club's High Press 4-4-2
   - Adds team-specific adjustments
   - Customizes striker positions for specific players
   - Adds additional relationships for wingers

3. **Additional Club Tactic**: "Compact 4-2-3-1"
   - Defensive setup for tougher opposition
   - Uses 4-2-3-1 formation as base
   - Emphasis on compactness

## Helper Functions

### Core Functions

#### `getTacticById(id: string): Tactic | undefined`
Retrieves a tactic by its unique ID.

#### `getResolvedPositions(tactic: Tactic): ResolvedPosition[]`
Recursively resolves all position overrides through the inheritance chain:
1. Starts with base formation positions
2. Applies parent tactic overrides (if parent exists)
3. Applies current tactic overrides
4. Tracks which tactics modified each position

**Key Features:**
- Recursive inheritance resolution
- Merges focus areas from all levels
- Tracks override sources
- Handles missing parents gracefully

#### `getTacticsAvailableForScope(clubId: string, ageGroupId?: string, teamId?: string): Tactic[]`
Returns all tactics accessible at a given scope level:
- Global tactics → available everywhere
- Club tactics → available to club and all children
- Age group tactics → available to age group and its teams
- Team tactics → available only to that team

### Utility Functions

#### `isFieldOverridden(tactic: Tactic, positionIndex: number, field: keyof TacticalPositionOverride): boolean`
Checks if a specific field differs from its parent value. Useful for:
- UI indicators showing what's customized
- Validation before saving
- Warning users about overrides

#### `getOverriddenFieldsList(tactic: Tactic): OverrideInfo[]`
Returns structured data about all overrides, including:
- Position and field being overridden
- Original value (from parent or formation)
- New value
- Which tactic applied the override

Perfect for:
- Reset functionality in UI
- Preview modals before applying changes
- Audit trails

### Scope Filters

- `getTacticsByClubId(clubId: string): Tactic[]`
- `getTacticsByAgeGroupId(ageGroupId: string): Tactic[]`
- `getTacticsByTeamId(teamId: string): Tactic[]`

Filter tactics by specific scope level.

## Usage Examples

### Example 1: Get resolved positions for a team tactic

```typescript
import { getTacticById, getResolvedPositions } from '@/data/tactics';

const tactic = getTacticById('t2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7');
if (tactic) {
  const positions = getResolvedPositions(tactic);
  // positions[9] = left striker with all inherited overrides applied
  console.log(positions[9]); 
  // {
  //   position: 'ST',
  //   x: 33,  // from team tactic
  //   y: 85,  // from club tactic
  //   attackingDirection: 'attacking',  // from club tactic
  //   focusAreas: ['Press center backs', 'Use pace to run in behind'],
  //   overriddenBy: ['t1a2b3c4...', 't2b3c4d5...']
  // }
}
```

### Example 2: Get tactics available to a team

```typescript
import { getTacticsAvailableForScope } from '@/data/tactics';

const tactics = getTacticsAvailableForScope(
  '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',  // Vale FC
  '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',  // 2014s age group
  'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'   // Blues team
);
// Returns: [Club High Press, Compact 4-2-3-1, 2015 Blues High Press]
```

### Example 3: Check if a field is overridden

```typescript
import { getTacticById, isFieldOverridden } from '@/data/tactics';

const tactic = getTacticById('t2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7');
if (tactic) {
  // Check if left striker's x position is overridden from parent
  const isOverridden = isFieldOverridden(tactic, 9, 'x');
  console.log(isOverridden); // true - team customized it
}
```

### Example 4: List all overrides for reset modal

```typescript
import { getTacticById, getOverriddenFieldsList } from '@/data/tactics';

const tactic = getTacticById('t2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7');
if (tactic) {
  const overrides = getOverriddenFieldsList(tactic);
  // Returns array of override info for UI display
  overrides.forEach(override => {
    console.log(`${override.position} ${override.field}: ${override.originalValue} → ${override.overriddenValue}`);
  });
}
```

## Inheritance Chain Example

```
4-4-2 Classic Formation (base)
├── Position 9: ST at x=35, y=80
│
└── Club: High Press 4-4-2
    ├── Overrides: y=85, attackingDirection='attacking'
    │
    └── Team: 2015 Blues High Press
        └── Overrides: x=33, adds focusAreas
        
Final Resolved Position:
{
  position: 'ST',
  x: 33,           // from team
  y: 85,            // from club
  attackingDirection: 'attacking',  // from club
  focusAreas: [
    'Press center backs',           // from club
    'Force play wide',              // from club
    'Clinical finishing',           // from club
    'Use pace to run in behind'     // from team
  ]
}
```

## Key Features

✅ **Inheritance Resolution**: Tactics can inherit from parent tactics, creating a flexible hierarchy
✅ **Scope-Based Access**: Control which tactics are available at different organizational levels
✅ **Position Overrides**: Override x/y coordinates and tactical instructions
✅ **Tactical Relationships**: Define passing lanes, combinations, and support patterns
✅ **Focus Areas**: Multiple tactical instructions per position
✅ **Markdown Summaries**: Rich tactical philosophy descriptions
✅ **Override Tracking**: Know which tactic modified each position
✅ **Graceful Fallbacks**: Handles missing parents and formations

## Integration Points

This data layer integrates with:
- **Formations System** (`src/data/formations.ts`): Base positions
- **Clubs/Teams** (`src/data/clubs.ts`, `src/data/teams.ts`): Scope references
- **Future UI Components**: For tactical planning and match preparation

## Testing

All functionality has been validated:
- ✓ Type definitions are complete
- ✓ Sample data demonstrates inheritance
- ✓ Helper functions implement required logic
- ✓ Data integrity (correct IDs and references)
- ✓ Graceful error handling

## Next Steps

Future enhancements could include:
- Player-specific tactical instructions
- Formation transitions during matches
- AI-suggested tactics based on opposition
- Tactical analysis and effectiveness tracking
- Export/import tactics between clubs
