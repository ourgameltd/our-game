import { Tactic, ResolvedPosition, OverrideInfo, TacticalPositionOverride } from '../types';
import { getFormationById } from './formations';

/**
 * Sample Tactics Data
 * 
 * Demonstrates inheritance chain: Base Formation → Club Tactic → Team Tactic
 */

export const sampleTactics: Tactic[] = [
  // Club-Level Tactic: High Press 4-4-2
  {
    id: 't1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    name: 'High Press 4-4-2',
    baseFormationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // 4-4-2 Classic
    scope: {
      level: 'club',
      clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b', // Vale FC
    },
    positionOverrides: [
      undefined, // GK - no override
      undefined, // LB - no override
      undefined, // CB - no override
      undefined, // CB - no override
      undefined, // RB - no override
      undefined, // LM - no override
      { // CM (left) - index 6
        attackingDirection: 'balanced',
        defensiveDirection: 'defensive',
        focusAreas: ['Press opposition midfield', 'Quick transitions'],
      },
      { // CM (right) - index 7
        attackingDirection: 'balanced',
        defensiveDirection: 'defensive',
        focusAreas: ['Press opposition midfield', 'Support attacks'],
      },
      undefined, // RM - no override
      { // ST (left) - index 9
        y: 85, // Push higher up the pitch
        attackingDirection: 'attacking',
        defensiveDirection: 'balanced',
        focusAreas: ['Press center backs', 'Force play wide', 'Clinical finishing'],
      },
      { // ST (right) - index 10
        y: 85, // Push higher up the pitch
        attackingDirection: 'attacking',
        defensiveDirection: 'balanced',
        focusAreas: ['Press center backs', 'Force play wide', 'Hold-up play'],
      },
    ],
    relationships: [
      {
        fromPositionIndex: 6, // CM (left)
        toPositionIndex: 7, // CM (right)
        type: 'passing-lane',
        description: 'Central midfield partnership - quick interchanges',
        priority: 'primary',
      },
      {
        fromPositionIndex: 6, // CM (left)
        toPositionIndex: 9, // ST (left)
        type: 'passing-lane',
        description: 'Thread balls through to striker',
        priority: 'secondary',
      },
      {
        fromPositionIndex: 7, // CM (right)
        toPositionIndex: 10, // ST (right)
        type: 'passing-lane',
        description: 'Thread balls through to striker',
        priority: 'secondary',
      },
      {
        fromPositionIndex: 9, // ST (left)
        toPositionIndex: 10, // ST (right)
        type: 'combination',
        description: 'Striker partnership - one-twos and overlaps',
        priority: 'primary',
      },
    ],
    summary: `## High Press Philosophy

Vale FC's signature high-pressing system designed to win the ball back quickly in the opponent's half.

### Key Principles
- **Aggressive Pressing**: Strikers initiate the press on opposition center backs
- **Compact Shape**: Midfield stays tight to support the press
- **Quick Transitions**: Win the ball and attack immediately
- **Team Effort**: Everyone works together to press and recover

### When to Use
- Against teams that build from the back
- When we have high energy and fitness
- In games where we need to dominate possession

### Coaching Points
- Press as a unit, not individuals
- Force play into wide areas where we can trap the ball
- Quick recovery when press is broken`,
    createdBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-15'),
  },

  // Team-Level Tactic: 2015 Blues High Press (inherits from club tactic)
  {
    id: 't2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    name: '2015 Blues High Press',
    baseFormationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // 4-4-2 Classic
    parentTacticId: 't1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // Inherits from club's High Press 4-4-2
    scope: {
      level: 'team',
      clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b', // Vale FC
      ageGroupId: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', // 2014s age group
      teamId: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', // Blues team
    },
    positionOverrides: [
      undefined, // GK - no override
      undefined, // LB - no override
      undefined, // CB - no override
      undefined, // CB - no override
      undefined, // RB - no override
      { // LM - index 5
        x: 18, // Slightly narrower to support press
        attackingDirection: 'attacking',
        focusAreas: ['Cut passing lanes', 'Quick overlaps'],
      },
      { // CM (left) - index 6
        x: 38, // Slightly adjusted for specific player strengths
        focusAreas: ['Press opposition midfield', 'Quick transitions', 'Playmaking from deep'],
      },
      undefined, // CM (right) - inherit from parent
      { // RM - index 8
        x: 82, // Slightly narrower to support press
        attackingDirection: 'attacking',
        focusAreas: ['Cut passing lanes', 'Quick overlaps'],
      },
      { // ST (left) - index 9
        x: 33, // Adjusted for specific player (faster, more agile)
        focusAreas: ['Press center backs', 'Force play wide', 'Clinical finishing', 'Use pace to run in behind'],
      },
      { // ST (right) - index 10
        x: 67, // Adjusted for specific player (stronger, better hold-up)
        focusAreas: ['Press center backs', 'Force play wide', 'Hold-up play', 'Target for long balls'],
      },
    ],
    relationships: [
      // Inherits all relationships from parent, plus additional ones:
      {
        fromPositionIndex: 9, // ST (left)
        toPositionIndex: 10, // ST (right)
        type: 'combination',
        description: 'Striker partnership - left striker runs in behind, right striker holds up',
        priority: 'primary',
      },
      {
        fromPositionIndex: 5, // LM
        toPositionIndex: 9, // ST (left)
        type: 'support',
        description: 'Winger supports striker runs',
        priority: 'secondary',
      },
      {
        fromPositionIndex: 8, // RM
        toPositionIndex: 10, // ST (right)
        type: 'support',
        description: 'Winger supports striker hold-up',
        priority: 'secondary',
      },
    ],
    summary: `## 2015 Blues Adapted High Press

Team-specific adaptation of Vale FC's high press system, optimized for the Blues squad's strengths.

### Team-Specific Adjustments
- **Pacey Left Striker**: Exploits space in behind with speed
- **Target Right Striker**: Holds up play and brings others into the game
- **Narrower Wingers**: Support the press more effectively
- **Creative Left CM**: Added playmaking responsibilities

### Player Roles
- Left Striker: Runner in behind
- Right Striker: Target man
- Left CM: Deep-lying playmaker
- Wingers: Inside forwards when pressing

### Training Focus
- Striker combination play
- Winger positioning during press
- Quick transition drills`,
    createdBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-10-05'),
  },

  // Additional Club-Level Tactic: Defensive 4-2-3-1
  {
    id: 't3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    name: 'Compact 4-2-3-1',
    baseFormationId: 'f4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9', // 4-2-3-1
    scope: {
      level: 'club',
      clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b', // Vale FC
    },
    positionOverrides: [
      undefined, // GK
      undefined, // LB
      undefined, // CB
      undefined, // CB
      undefined, // RB
      { // CDM (left) - index 5
        defensiveDirection: 'defensive',
        focusAreas: ['Shield back four', 'Break up play'],
      },
      { // CDM (right) - index 6
        defensiveDirection: 'defensive',
        focusAreas: ['Shield back four', 'Break up play'],
      },
      { // LM - index 7
        y: 55, // Deeper to help defend
        defensiveDirection: 'defensive',
        focusAreas: ['Track back', 'Defensive width'],
      },
      undefined, // CAM
      { // RM - index 9
        y: 55, // Deeper to help defend
        defensiveDirection: 'defensive',
        focusAreas: ['Track back', 'Defensive width'],
      },
      undefined, // ST
    ],
    relationships: [
      {
        fromPositionIndex: 5, // CDM (left)
        toPositionIndex: 6, // CDM (right)
        type: 'cover',
        description: 'Double pivot - cover each other',
        priority: 'primary',
      },
      {
        fromPositionIndex: 7, // LM
        toPositionIndex: 1, // LB
        type: 'support',
        description: 'Winger drops to support full-back',
        priority: 'primary',
      },
      {
        fromPositionIndex: 9, // RM
        toPositionIndex: 4, // RB
        type: 'support',
        description: 'Winger drops to support full-back',
        priority: 'primary',
      },
    ],
    summary: `## Compact Defensive System

A solid defensive setup using the 4-2-3-1 formation with emphasis on compactness and organization.

### Key Principles
- **Compact Shape**: Stay tight as a unit
- **Double Pivot**: Two holding midfielders protect defense
- **Wide Players Track**: Wingers help defend
- **Counter Attack**: Quick breaks when we win the ball

### When to Use
- Against stronger opposition
- When protecting a lead
- Away games requiring solid defense`,
    createdBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-10'),
  },
];

/**
 * Get tactic by ID
 */
export const getTacticById = (id: string): Tactic | undefined => {
  return sampleTactics.find(tactic => tactic.id === id);
};

/**
 * Get resolved positions for a tactic
 * Recursively merges parent formation + parent tactic + current overrides
 */
export const getResolvedPositions = (tactic: Tactic): ResolvedPosition[] => {
  // Start with base formation
  const baseFormation = getFormationById(tactic.baseFormationId);
  
  if (!baseFormation) {
    console.error(`Base formation ${tactic.baseFormationId} not found for tactic ${tactic.id}`);
    return [];
  }

  // Initialize resolved positions from base formation
  const resolvedPositions: ResolvedPosition[] = baseFormation.positions.map((pos, index) => ({
    position: pos.position,
    x: pos.x,
    y: pos.y,
    sourceFormationId: baseFormation.id,
    overriddenBy: [],
  }));

  // Helper function to apply overrides from a tactic
  const applyOverrides = (
    positions: ResolvedPosition[],
    overrides: (TacticalPositionOverride | undefined)[] | undefined,
    tacticId: string
  ): void => {
    if (!overrides) return;

    overrides.forEach((override, index) => {
      if (!override || index >= positions.length) return;

      const position = positions[index];
      let modified = false;

      if (override.x !== undefined) {
        position.x = override.x;
        modified = true;
      }
      if (override.y !== undefined) {
        position.y = override.y;
        modified = true;
      }
      if (override.attackingDirection !== undefined) {
        position.attackingDirection = override.attackingDirection;
        modified = true;
      }
      if (override.defensiveDirection !== undefined) {
        position.defensiveDirection = override.defensiveDirection;
        modified = true;
      }
      if (override.focusAreas !== undefined) {
        // Merge focus areas rather than replacing
        position.focusAreas = [
          ...(position.focusAreas || []),
          ...override.focusAreas,
        ];
        modified = true;
      }

      if (modified && !position.overriddenBy?.includes(tacticId)) {
        position.overriddenBy = [...(position.overriddenBy || []), tacticId];
      }
    });
  };

  // If there's a parent tactic, recursively get its resolved positions first
  if (tactic.parentTacticId) {
    const parentTactic = getTacticById(tactic.parentTacticId);
    if (parentTactic) {
      // Get parent's resolved positions
      const parentResolved = getResolvedPositions(parentTactic);
      
      // Apply parent's resolved positions to our positions
      parentResolved.forEach((parentPos, index) => {
        if (index < resolvedPositions.length) {
          resolvedPositions[index] = {
            ...parentPos,
            overriddenBy: [...(parentPos.overriddenBy || [])],
          };
        }
      });
    }
  }

  // Apply current tactic's overrides
  applyOverrides(resolvedPositions, tactic.positionOverrides, tactic.id);

  return resolvedPositions;
};

/**
 * Get tactics available for a given scope
 * Returns all tactics accessible at the scope (includes parent scopes)
 */
export const getTacticsAvailableForScope = (
  clubId: string,
  ageGroupId?: string,
  teamId?: string
): Tactic[] => {
  return sampleTactics.filter(tactic => {
    const scope = tactic.scope;

    // Global tactics are available to everyone
    if (scope.level === 'global') {
      return true;
    }

    // Club tactics are available to the club and all its children
    if (scope.level === 'club' && scope.clubId === clubId) {
      return true;
    }

    // Age group tactics are available to that age group and its teams
    if (scope.level === 'age-group' && scope.clubId === clubId) {
      // If we're looking at team scope, check if team's age group matches
      if (teamId && ageGroupId && scope.ageGroupId === ageGroupId) {
        return true;
      }
      // If we're looking at age group scope, check direct match
      if (!teamId && ageGroupId && scope.ageGroupId === ageGroupId) {
        return true;
      }
    }

    // Team tactics are only available to that specific team
    if (scope.level === 'team' && 
        scope.clubId === clubId && 
        scope.ageGroupId === ageGroupId &&
        scope.teamId === teamId) {
      return true;
    }

    return false;
  });
};

/**
 * Check if a specific field is overridden from parent
 */
export const isFieldOverridden = (
  tactic: Tactic,
  positionIndex: number,
  field: keyof TacticalPositionOverride
): boolean => {
  // Check if current tactic has an override for this position
  const override = tactic.positionOverrides?.[positionIndex];
  if (!override || override[field] === undefined) {
    return false;
  }

  // If there's no parent, any value is an override from the base formation
  if (!tactic.parentTacticId) {
    return true;
  }

  // Compare with parent's value
  const parentTactic = getTacticById(tactic.parentTacticId);
  if (!parentTactic) {
    return true; // If parent not found, consider it overridden
  }

  const parentResolved = getResolvedPositions(parentTactic);
  const parentPosition = parentResolved[positionIndex];
  
  if (!parentPosition) {
    return true;
  }

  // Compare values based on field type
  if (field === 'focusAreas') {
    // For arrays, check if they're different
    const currentAreas = override[field] as string[] | undefined;
    const parentAreas = parentPosition[field];
    
    if (!currentAreas && !parentAreas) return false;
    if (!currentAreas || !parentAreas) return true;
    
    return JSON.stringify(currentAreas) !== JSON.stringify(parentAreas);
  }

  // For other fields, simple comparison
  return override[field] !== parentPosition[field as keyof ResolvedPosition];
};

/**
 * Get list of all overrides for display/reset functionality
 */
export const getOverriddenFieldsList = (tactic: Tactic): OverrideInfo[] => {
  const overrides: OverrideInfo[] = [];
  const baseFormation = getFormationById(tactic.baseFormationId);
  
  if (!baseFormation) {
    return overrides;
  }

  // Get parent resolved positions if parent exists
  let parentResolved: ResolvedPosition[] | null = null;
  if (tactic.parentTacticId) {
    const parentTactic = getTacticById(tactic.parentTacticId);
    if (parentTactic) {
      parentResolved = getResolvedPositions(parentTactic);
    }
  }

  // Check each position for overrides
  tactic.positionOverrides?.forEach((override, index) => {
    if (!override || index >= baseFormation.positions.length) return;

    const basePosition = baseFormation.positions[index];
    const parentPosition = parentResolved?.[index];

    // Check each field
    const fields: Array<keyof TacticalPositionOverride> = [
      'x', 'y', 'attackingDirection', 'defensiveDirection', 'focusAreas'
    ];

    fields.forEach(field => {
      if (override[field] !== undefined) {
        const originalValue = parentPosition 
          ? parentPosition[field as keyof ResolvedPosition]
          : (field === 'x' || field === 'y' ? basePosition[field] : undefined);

        overrides.push({
          positionIndex: index,
          position: basePosition.position,
          field,
          originalValue,
          overriddenValue: override[field],
          tacticId: tactic.id,
          tacticName: tactic.name,
        });
      }
    });
  });

  return overrides;
};

/**
 * Filter tactics by club ID
 */
export const getTacticsByClubId = (clubId: string): Tactic[] => {
  return sampleTactics.filter(tactic => tactic.scope.clubId === clubId);
};

/**
 * Filter tactics by age group ID
 */
export const getTacticsByAgeGroupId = (ageGroupId: string): Tactic[] => {
  return sampleTactics.filter(tactic => tactic.scope.ageGroupId === ageGroupId);
};

/**
 * Filter tactics by team ID
 */
export const getTacticsByTeamId = (teamId: string): Tactic[] => {
  return sampleTactics.filter(tactic => tactic.scope.teamId === teamId);
};
