import { Tactic, ResolvedPosition } from '@/types';

// Sample 11-a-side tactics
export const tactic442: Tactic = {
  id: 'tactic-442-basic',
  name: '4-4-2 Balanced',
  system: '4-4-2',
  squadSize: 11,
  positions: [
    { position: 'GK', x: 50, y: 130, direction: 'neutral' },
    { position: 'LB', x: 20, y: 105, direction: 'defensive' },
    { position: 'CB', x: 38, y: 110, direction: 'defensive' },
    { position: 'CB', x: 62, y: 110, direction: 'defensive' },
    { position: 'RB', x: 80, y: 105, direction: 'defensive' },
    { position: 'LM', x: 20, y: 75, direction: 'neutral' },
    { position: 'CM', x: 38, y: 70, direction: 'neutral' },
    { position: 'CM', x: 62, y: 70, direction: 'neutral' },
    { position: 'RM', x: 80, y: 75, direction: 'neutral' },
    { position: 'ST', x: 38, y: 25, direction: 'attacking' },
    { position: 'ST', x: 62, y: 25, direction: 'attacking' },
  ],
  relationships: [
    { fromIndex: 1, toIndex: 5, type: 'overlap', label: 'Overlap' },
    { fromIndex: 4, toIndex: 8, type: 'overlap', label: 'Overlap' },
    { fromIndex: 5, toIndex: 6, type: 'passing-lane' },
    { fromIndex: 6, toIndex: 7, type: 'passing-lane' },
    { fromIndex: 7, toIndex: 8, type: 'passing-lane' },
    { fromIndex: 6, toIndex: 9, type: 'passing-lane' },
    { fromIndex: 7, toIndex: 10, type: 'passing-lane' },
    { fromIndex: 2, toIndex: 3, type: 'cover' },
    { fromIndex: 9, toIndex: 10, type: 'combination', label: 'Link Up' },
  ],
  description: 'Classic 4-4-2 formation with balanced attacking and defensive play. Fullbacks overlap with wingers.',
};

export const tactic433: Tactic = {
  id: 'tactic-433-attacking',
  name: '4-3-3 Attack',
  system: '4-3-3',
  squadSize: 11,
  positions: [
    { position: 'GK', x: 50, y: 130, direction: 'neutral' },
    { position: 'LB', x: 20, y: 105, direction: 'attacking' },
    { position: 'CB', x: 38, y: 110, direction: 'defensive' },
    { position: 'CB', x: 62, y: 110, direction: 'defensive' },
    { position: 'RB', x: 80, y: 105, direction: 'attacking' },
    { position: 'CDM', x: 50, y: 85, direction: 'defensive' },
    { position: 'CM', x: 35, y: 65, direction: 'attacking' },
    { position: 'CM', x: 65, y: 65, direction: 'attacking' },
    { position: 'LW', x: 15, y: 35, direction: 'attacking' },
    { position: 'ST', x: 50, y: 20, direction: 'attacking' },
    { position: 'RW', x: 85, y: 35, direction: 'attacking' },
  ],
  relationships: [
    { fromIndex: 1, toIndex: 8, type: 'overlap', label: 'Overlap' },
    { fromIndex: 4, toIndex: 10, type: 'overlap', label: 'Overlap' },
    { fromIndex: 5, toIndex: 6, type: 'passing-lane' },
    { fromIndex: 5, toIndex: 7, type: 'passing-lane' },
    { fromIndex: 6, toIndex: 8, type: 'passing-lane' },
    { fromIndex: 7, toIndex: 10, type: 'passing-lane' },
    { fromIndex: 8, toIndex: 9, type: 'combination' },
    { fromIndex: 9, toIndex: 10, type: 'combination' },
    { fromIndex: 2, toIndex: 3, type: 'cover' },
    { fromIndex: 2, toIndex: 5, type: 'cover' },
    { fromIndex: 3, toIndex: 5, type: 'cover' },
  ],
  description: 'Attacking 4-3-3 with high pressing. Fullbacks push high to support wingers. CDM shields the defense.',
};

// Sample 7-a-side tactic
export const tactic7aside: Tactic = {
  id: 'tactic-7-231',
  name: '2-3-1 Formation',
  system: '2-3-1',
  squadSize: 7,
  positions: [
    { position: 'GK', x: 50, y: 130, direction: 'neutral' },
    { position: 'LB', x: 30, y: 105, direction: 'defensive' },
    { position: 'RB', x: 70, y: 105, direction: 'defensive' },
    { position: 'LM', x: 25, y: 70, direction: 'neutral' },
    { position: 'CM', x: 50, y: 65, direction: 'neutral' },
    { position: 'RM', x: 75, y: 70, direction: 'neutral' },
    { position: 'ST', x: 50, y: 25, direction: 'attacking' },
  ],
  relationships: [
    { fromIndex: 1, toIndex: 3, type: 'overlap' },
    { fromIndex: 2, toIndex: 5, type: 'overlap' },
    { fromIndex: 3, toIndex: 4, type: 'passing-lane' },
    { fromIndex: 4, toIndex: 5, type: 'passing-lane' },
    { fromIndex: 4, toIndex: 6, type: 'passing-lane' },
    { fromIndex: 3, toIndex: 6, type: 'combination' },
    { fromIndex: 5, toIndex: 6, type: 'combination' },
    { fromIndex: 1, toIndex: 2, type: 'cover' },
  ],
  description: 'Balanced 7-a-side formation with strong midfield control and attacking options.',
};

// Sample 5-a-side tactic
export const tactic5aside: Tactic = {
  id: 'tactic-5-211',
  name: '2-1-1 Formation',
  system: '2-1-1',
  squadSize: 5,
  positions: [
    { position: 'GK', x: 50, y: 130, direction: 'neutral' },
    { position: 'LB', x: 35, y: 95, direction: 'defensive' },
    { position: 'RB', x: 65, y: 95, direction: 'defensive' },
    { position: 'CM', x: 50, y: 55, direction: 'neutral' },
    { position: 'ST', x: 50, y: 20, direction: 'attacking' },
  ],
  relationships: [
    { fromIndex: 1, toIndex: 3, type: 'passing-lane' },
    { fromIndex: 2, toIndex: 3, type: 'passing-lane' },
    { fromIndex: 3, toIndex: 4, type: 'passing-lane' },
    { fromIndex: 1, toIndex: 4, type: 'combination' },
    { fromIndex: 2, toIndex: 4, type: 'combination' },
    { fromIndex: 1, toIndex: 2, type: 'cover' },
  ],
  description: 'Compact 5-a-side formation with defensive solidity and quick counter-attacks.',
};

// Tactic with inheritance (4-3-3 attacking inherits from 4-4-2 balanced)
export const tactic433Inherited: Tactic = {
  id: 'tactic-433-inherited',
  name: '4-3-3 from 4-4-2',
  system: '4-3-3',
  squadSize: 11,
  parentTacticId: 'tactic-442-basic',
  overriddenPositionIndices: [5, 6, 7, 8, 9, 10], // Override midfield and attack
  positions: [
    { position: 'GK', x: 50, y: 130, direction: 'neutral' },
    { position: 'LB', x: 20, y: 105, direction: 'defensive' },
    { position: 'CB', x: 38, y: 110, direction: 'defensive' },
    { position: 'CB', x: 62, y: 110, direction: 'defensive' },
    { position: 'RB', x: 80, y: 105, direction: 'defensive' },
    // Overridden positions
    { position: 'CDM', x: 50, y: 85, direction: 'defensive' },
    { position: 'CM', x: 35, y: 65, direction: 'attacking' },
    { position: 'CM', x: 65, y: 65, direction: 'attacking' },
    { position: 'LW', x: 15, y: 35, direction: 'attacking' },
    { position: 'ST', x: 50, y: 20, direction: 'attacking' },
    { position: 'RW', x: 85, y: 35, direction: 'attacking' },
  ],
  relationships: [
    { fromIndex: 5, toIndex: 6, type: 'passing-lane' },
    { fromIndex: 5, toIndex: 7, type: 'passing-lane' },
    { fromIndex: 6, toIndex: 8, type: 'combination' },
    { fromIndex: 7, toIndex: 10, type: 'combination' },
    { fromIndex: 8, toIndex: 9, type: 'passing-lane' },
    { fromIndex: 9, toIndex: 10, type: 'passing-lane' },
  ],
  description: 'Evolved from 4-4-2 to 4-3-3, inheriting defensive shape but with attacking midfield and wingers.',
};

// Helper function to resolve positions (for inheritance)
export function resolvePositions(tactic: Tactic, parentTactic?: Tactic): ResolvedPosition[] {
  const resolved: ResolvedPosition[] = [];

  for (let i = 0; i < tactic.positions.length; i++) {
    const position = tactic.positions[i];
    const isOverridden = tactic.overriddenPositionIndices?.includes(i) || false;
    const isInherited = !!parentTactic && !isOverridden;

    resolved.push({
      ...position,
      isInherited,
      isOverridden,
      parentTacticName: isInherited ? parentTactic?.name : undefined,
    });
  }

  return resolved;
}

export const sampleTactics = [tactic442, tactic433, tactic7aside, tactic5aside, tactic433Inherited];
