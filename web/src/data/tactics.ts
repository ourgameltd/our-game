import { Formation, TacticalPositionOverride, PlayerDirection } from '../types';
import { getFormationById } from './formations';

/**
 * Sample Tactics Data
 * 
 * Demonstrates inheritance chain: Base Formation → Club Tactic → Age Group Tactic → Team Tactic
 * 
 * Note: The Tactic type is now unified with Formation. User-created tactics have:
 * - isSystemFormation: false (or undefined)
 * - parentFormationId: points to a base system formation
 * - scope: defines visibility (club, ageGroup, or team level)
 */

// Type alias for backward compatibility
type Tactic = Formation;

export const sampleTactics: Formation[] = [
  // Club-Level Tactic: High Press 4-4-2
  {
    id: 't1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    name: 'High Press 4-4-2',
    parentFormationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // 4-4-2 Classic
    squadSize: 11,
    scope: {
      type: 'club',
      clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b', // Vale FC
    },
    positionOverrides: {
      6: { // CM (left)
        direction: 'S',
      },
      7: { // CM (right)
        direction: 'S',
      },
      9: { // ST (left)
        y: 85, // Push higher up the pitch
        direction: 'N',
      },
      10: { // ST (right)
        y: 85, // Push higher up the pitch
        direction: 'N',
      },
    },
    principles: [
      {
        id: 'p1-press-high',
        title: 'Press High',
        description: 'Immediately press the opposition when they have the ball in their defensive third. Force them to play long or make mistakes.',
        positionIndices: [9, 10], // Strikers
      },
      {
        id: 'p1-compact-midfield',
        title: 'Stay Compact',
        description: 'Keep distances between units tight. No more than 10 yards between each line of defense.',
        positionIndices: [], // All players
      },
      {
        id: 'p1-quick-transition',
        title: 'Quick Transition',
        description: 'When we win the ball, look to play forward immediately. Maximum 3 touches before a forward pass.',
        positionIndices: [5, 6, 7, 8], // Midfielders and wingers
      },
      {
        id: 'p1-force-wide',
        title: 'Force Play Wide',
        description: 'Block central passing lanes to force opposition to play wide where we can trap the ball.',
        positionIndices: [6, 7, 9, 10], // Central midfielders and strikers
      },
    ],
    summary: `Vale FC's signature high-pressing system designed to win the ball back quickly in the opponent's half. The strikers initiate aggressive pressing on opposition center backs while the midfield stays compact to support. When we win the ball, we look to transition quickly and attack immediately. This system works best against teams that build from the back and requires the whole team to press and recover as a unit.`,
    style: 'High Press',
    createdBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
    createdAt: '2024-09-01T00:00:00.000Z',
    updatedAt: '2024-09-15T00:00:00.000Z',
    tags: ['pressing', 'attacking', '4-4-2'],
  },

  // Team-Level Tactic: 2015 Blues High Press (inherits from club tactic)
  {
    id: 't2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    name: '2015 Blues High Press',
    parentFormationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // 4-4-2 Classic
    parentTacticId: 't1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // Inherits from club's High Press 4-4-2
    squadSize: 11,
    scope: {
      type: 'team',
      clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b', // Vale FC
      ageGroupId: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', // 2014s age group
      teamId: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', // Blues team
    },
    positionOverrides: {
      5: { // LM
        x: 18, // Slightly narrower to support press
        direction: 'NE',
      },
      6: { // CM (left)
        x: 38, // Slightly adjusted for specific player strengths
      },
      8: { // RM
        x: 82, // Slightly narrower to support press
        direction: 'NW',
      },
      9: { // ST (left)
        x: 33, // Adjusted for specific player (faster, more agile)
      },
      10: { // ST (right)
        x: 67, // Adjusted for specific player (stronger, better hold-up)
      },
    },
    principles: [
      {
        id: 'p2-run-in-behind',
        title: 'Run In Behind',
        description: 'Use pace to exploit space behind the defensive line. Make diagonal runs when pressing is triggered.',
        positionIndices: [9], // Left striker
      },
      {
        id: 'p2-hold-up-play',
        title: 'Hold-Up Play',
        description: 'Receive with back to goal and bring teammates into play. Be the target for long balls.',
        positionIndices: [10], // Right striker
      },
      {
        id: 'p2-inside-cuts',
        title: 'Cut Inside When Pressing',
        description: 'Move inside to cut passing lanes when strikers initiate the press.',
        positionIndices: [5, 8], // Wingers
      },
      {
        id: 'p2-playmaker',
        title: 'Playmaking from Deep',
        description: 'Look for creative passes through the lines when we win possession.',
        positionIndices: [6], // Left CM
      },
    ],
    summary: `A team-specific adaptation of Vale FC's high press system, optimized for the Blues squad's strengths. Our pacey left striker exploits space in behind while the target right striker holds up play and brings others into the game. The wingers have been moved narrower to support the press more effectively, and our creative left CM has added playmaking responsibilities to unlock defences when we win possession.`,
    style: 'High Press',
    createdBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
    createdAt: '2024-09-20T00:00:00.000Z',
    updatedAt: '2024-10-05T00:00:00.000Z',
    tags: ['pressing', 'attacking', 'youth', '4-4-2'],
  },

  // Additional Club-Level Tactic: Defensive 4-2-3-1
  {
    id: 't3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    name: 'Compact 4-2-3-1',
    parentFormationId: 'f4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9', // 4-2-3-1
    squadSize: 11,
    scope: {
      type: 'club',
      clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b', // Vale FC
    },
    positionOverrides: {
      5: { // CDM (left)
        direction: 'S',
      },
      6: { // CDM (right)
        direction: 'S',
      },
      7: { // LM
        y: 55, // Deeper to help defend
        direction: 'SW',
      },
      9: { // RM
        y: 55, // Deeper to help defend
        direction: 'SE',
      },
    },
    principles: [
      {
        id: 'p3-shield-back-four',
        title: 'Shield the Back Four',
        description: 'Position between the opposition and our defense. Screen passes and break up play.',
        positionIndices: [5, 6], // CDMs
      },
      {
        id: 'p3-track-back',
        title: 'Track Back',
        description: 'When opposition has the ball, drop deep to form a solid block of 8 outfield players.',
        positionIndices: [7, 9], // Wide midfielders
      },
      {
        id: 'p3-counter-attack',
        title: 'Counter Attack',
        description: 'When we win the ball, look to release the striker quickly on the counter.',
        positionIndices: [], // All players
      },
      {
        id: 'p3-stay-narrow',
        title: 'Stay Narrow',
        description: 'Protect the central areas. Force opposition to play wide and cross.',
        positionIndices: [2, 3, 5, 6], // CBs and CDMs
      },
    ],
    summary: `A solid defensive setup using the 4-2-3-1 formation with emphasis on compactness and organization. The double pivot of two holding midfielders protects the back four while the wide players track back to help defend. When we win the ball, we look to break quickly on the counter. This system is ideal against stronger opposition, when protecting a lead, or in away games requiring solid defensive structure.`,
    style: 'Defensive',
    createdBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
    createdAt: '2024-09-10T00:00:00.000Z',
    updatedAt: '2024-09-10T00:00:00.000Z',
    tags: ['defensive', 'compact', '4-2-3-1'],
  },
];

/**
 * Get tactic by ID
 */
export const getTacticById = (id: string): Tactic | undefined => {
  return sampleTactics.find(tactic => tactic.id === id);
};

/**
 * Resolved position after applying all inheritance
 */
export interface ResolvedPosition {
  position: string;
  x: number;
  y: number;
  direction?: PlayerDirection;
  sourceFormationId: string;
  overriddenBy?: string[];
}

/**
 * Get resolved positions for a tactic
 * Recursively merges parent formation + parent tactic + current overrides
 */
export const getResolvedPositions = (tactic: Tactic): ResolvedPosition[] => {
  // Start with base formation
  if (!tactic.parentFormationId) {
    // This is a system formation, return its positions directly
    return (tactic.positions || []).map((pos) => ({
      position: pos.position,
      x: pos.x,
      y: pos.y,
      direction: pos.direction,
      sourceFormationId: tactic.id,
      overriddenBy: [],
    }));
  }
  
  const baseFormation = getFormationById(tactic.parentFormationId);
  
  if (!baseFormation || !baseFormation.positions) {
    console.error(`Base formation ${tactic.parentFormationId} not found for tactic ${tactic.id}`);
    return [];
  }

  // Initialize resolved positions from base formation
  const resolvedPositions: ResolvedPosition[] = baseFormation.positions.map((pos) => ({
    position: pos.position,
    x: pos.x,
    y: pos.y,
    sourceFormationId: baseFormation.id,
    overriddenBy: [],
  }));

  // Helper function to apply overrides from a tactic
  const applyOverrides = (
    positions: ResolvedPosition[],
    overrides: Record<number, TacticalPositionOverride>,
    tacticId: string
  ): void => {
    Object.entries(overrides).forEach(([indexStr, override]) => {
      const index = parseInt(indexStr, 10);
      if (isNaN(index) || index >= positions.length) return;

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
      if (override.direction !== undefined) {
        position.direction = override.direction;
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
  if (tactic.positionOverrides) {
    applyOverrides(resolvedPositions, tactic.positionOverrides, tactic.id);
  }

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

    // Club tactics are available to the club and all its children
    if (scope.type === 'club' && scope.clubId === clubId) {
      return true;
    }

    // Age group tactics are available to that age group and its teams
    if (scope.type === 'ageGroup' && scope.clubId === clubId) {
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
    if (scope.type === 'team' && 
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
  if (!tactic.positionOverrides) {
    return false;
  }
  
  const override = tactic.positionOverrides[positionIndex];
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
  // For other fields, simple comparison
  const parentValue = parentPosition[field as keyof ResolvedPosition];
  return override[field] !== parentValue;
};

/**
 * Override Information (for UI display and reset functionality)
 */
export interface OverrideInfo {
  positionIndex: number;
  position: string;
  field: keyof TacticalPositionOverride;
  originalValue: unknown;
  overriddenValue: unknown;
  tacticId: string;
  tacticName: string;
}

/**
 * Get list of all overrides for display/reset functionality
 */
export const getOverriddenFieldsList = (tactic: Tactic): OverrideInfo[] => {
  const overrides: OverrideInfo[] = [];
  
  if (!tactic.parentFormationId) {
    return overrides;
  }
  
  const baseFormation = getFormationById(tactic.parentFormationId);
  
  if (!baseFormation || !baseFormation.positions) {
    return overrides;
  }
  
  if (!tactic.positionOverrides) {
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
  Object.entries(tactic.positionOverrides).forEach(([indexStr, override]) => {
    const index = parseInt(indexStr, 10);
    if (isNaN(index) || index >= baseFormation.positions!.length) return;

    const basePosition = baseFormation.positions![index];
    const parentPosition = parentResolved?.[index];

    // Check each field
    const fields: Array<keyof TacticalPositionOverride> = [
      'x', 'y', 'direction'
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
 * Filter tactics by club ID (excludes system formations)
 */
export const getTacticsByClubId = (clubId: string): Tactic[] => {
  return sampleTactics.filter(tactic => {
    if (tactic.scope.type === 'system') return false;
    return 'clubId' in tactic.scope && tactic.scope.clubId === clubId;
  });
};

/**
 * Filter tactics by age group ID
 */
export const getTacticsByAgeGroupId = (ageGroupId: string): Tactic[] => {
  return sampleTactics.filter(tactic => 
    tactic.scope.type === 'ageGroup' && tactic.scope.ageGroupId === ageGroupId
  );
};

/**
 * Filter tactics by team ID
 */
export const getTacticsByTeamId = (teamId: string): Tactic[] => {
  return sampleTactics.filter(tactic => 
    tactic.scope.type === 'team' && tactic.scope.teamId === teamId
  );
};
