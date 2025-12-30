import { Tactic, TacticScope } from '../types/index';

export const sampleTactics: Tactic[] = [
  // Club-level tactics
  {
    id: 't1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    name: 'Vale Attacking 4-4-2',
    style: 'attacking',
    scope: 'club',
    clubId: 'club1',
    parentFormationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // 4-4-2 Classic
    squadSize: 11,
    summary: `## Attacking Philosophy
This tactic emphasizes high pressing and quick transitions. Full-backs push high to provide width while midfielders support the strikers.

### Key Principles
- High defensive line
- Quick vertical passes
- Overload the box on crosses`,
    positionRoles: [
      {
        position: 'GK',
        role: 'Sweeper Keeper',
        duties: ['Quick distribution', 'Rush out to sweep', 'Support build-up play'],
        instructions: 'Play short passes when possible'
      },
      {
        position: 'LB',
        role: 'Attacking Full-Back',
        duties: ['Overlap winger', 'Deliver crosses', 'Track back on counter'],
        instructions: 'Get forward at every opportunity'
      },
      {
        position: 'CB',
        role: 'Ball-Playing Defender',
        duties: ['Start attacks from back', 'Step up with ball', 'Cover space'],
        instructions: 'Look for forward passes'
      }
    ],
    relationships: [
      {
        id: 'rel1',
        fromPosition: 'LB',
        toPosition: 'LM',
        type: 'overlap',
        description: 'Left-back overlaps left midfielder when in possession'
      },
      {
        id: 'rel2',
        fromPosition: 'CM',
        toPosition: 'ST',
        type: 'passing-lane',
        description: 'Central midfielders look for through balls to strikers'
      }
    ],
    tags: ['High Press', 'Wing Play', 'Quick Tempo'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: 't2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    name: 'Defensive 5-3-2',
    style: 'defensive',
    scope: 'club',
    clubId: 'club1',
    parentFormationId: 'f12f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', // 5-3-2
    squadSize: 11,
    summary: `## Defensive Solidity
A compact defensive block designed to frustrate opponents and hit on the counter-attack.

### Key Principles
- Low defensive line
- Compact shape
- Quick transitions on turnover`,
    positionRoles: [
      {
        position: 'CB',
        role: 'Central Defender',
        duties: ['Hold defensive line', 'Win aerial duels', 'Clear danger'],
        instructions: 'Stay tight and organized'
      },
      {
        position: 'LWB',
        role: 'Wing-Back',
        duties: ['Track opposition wingers', 'Support counter-attacks', 'Tuck inside when needed'],
        instructions: 'Defensive duties first'
      }
    ],
    tags: ['Low Block', 'Counter-Attack', 'Defensive'],
    createdAt: new Date('2024-02-01')
  },

  // Age group tactics (7-a-side for youth)
  {
    id: 't3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    name: '2014s Possession 2-3-1',
    style: 'possession',
    scope: 'ageGroup',
    clubId: 'club1',
    ageGroupId: 'ag1',
    parentFormationId: 'f8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3', // 2-3-1
    squadSize: 7,
    summary: `## Youth Development Focus
Teaching young players to keep the ball and make smart decisions.

### Learning Objectives
- Short passing combinations
- Movement off the ball
- Patience in possession`,
    positionRoles: [
      {
        position: 'GK',
        role: 'Goalkeeper',
        duties: ['Distribute to defenders', 'Communicate with team', 'Positioning'],
        instructions: 'Look for short passes to defenders'
      },
      {
        position: 'CB',
        role: 'Defender',
        duties: ['Receive from goalkeeper', 'Pass to midfield', 'Stay close together'],
        instructions: 'Keep it simple, pass and move'
      },
      {
        position: 'CM',
        role: 'Central Midfielder',
        duties: ['Link defense to attack', 'Keep the ball moving', 'Support striker'],
        instructions: 'Always show for the ball'
      }
    ],
    tags: ['Youth', 'Development', 'Possession'],
    createdAt: new Date('2024-03-10')
  },

  // Team-level tactics
  {
    id: 't4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9',
    name: 'Reds High Press 3-3-2',
    style: 'high-press',
    scope: 'team',
    clubId: 'club1',
    ageGroupId: 'ag1',
    teamId: 'team1',
    parentFormationId: 'f5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0', // 3-3-2
    parentTacticId: 't3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8', // Inherits from age group tactic
    squadSize: 9,
    summary: `## Aggressive Pressing
Building on our age group possession principles, but with more aggressive pressing triggers.

### Pressing Zones
- Force play wide
- Trap on touchlines
- Win ball in final third`,
    positionRoles: [
      {
        position: 'CB',
        role: 'Pressing Defender',
        duties: ['Step up to press', 'Cover for teammates', 'Win second balls'],
        instructions: 'Be aggressive when pressing trigger activates'
      },
      {
        position: 'ST',
        role: 'Pressing Forward',
        duties: ['Press goalkeeper', 'Force passes wide', 'Lead the press'],
        instructions: 'Press immediately when opponent receives ball'
      }
    ],
    relationships: [
      {
        id: 'rel3',
        fromPosition: 'ST',
        toPosition: 'LM',
        type: 'press-trigger',
        description: 'When striker presses, left midfielder closes passing lane'
      },
      {
        id: 'rel4',
        fromPosition: 'ST',
        toPosition: 'RM',
        type: 'press-trigger',
        description: 'When striker presses, right midfielder closes passing lane'
      }
    ],
    tags: ['High Press', 'Aggressive', 'Team-Specific'],
    createdAt: new Date('2024-04-05')
  },

  // More examples across different squad sizes
  {
    id: 't5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0',
    name: '5-a-side Diamond Press',
    style: 'high-press',
    scope: 'club',
    clubId: 'club1',
    parentFormationId: 'fbe2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6', // 1-2-1 (5-a-side)
    squadSize: 5,
    summary: `## Small-Sided Pressing
High-energy pressing for 5-a-side format.

### Key Points
- Close spaces quickly
- Force mistakes
- Counter at pace`,
    tags: ['5-a-side', 'Youth', 'High Energy'],
    createdAt: new Date('2024-05-01')
  },

  {
    id: 't6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1',
    name: 'Senior Counter-Attack 4-3-3',
    style: 'counter-attack',
    scope: 'team',
    clubId: 'club1',
    ageGroupId: 'ag-senior',
    teamId: 'team-senior',
    parentFormationId: 'f2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7', // 4-3-3 Attack
    squadSize: 11,
    summary: `## Clinical Counter-Attacking
Absorb pressure and strike quickly with pace on the counter.

### Counter-Attack Principles
- Compact defensive shape
- Quick transitions
- Exploit space in behind`,
    positionRoles: [
      {
        position: 'CDM',
        role: 'Defensive Midfielder',
        duties: ['Shield back four', 'Win ball', 'Launch counters'],
        instructions: 'Quick forward passes when winning possession'
      },
      {
        position: 'LW',
        role: 'Inside Forward',
        duties: ['Stay high and wide', 'Run in behind', 'Cut inside to shoot'],
        instructions: 'Exploit space on counter-attacks'
      },
      {
        position: 'RW',
        role: 'Inside Forward',
        duties: ['Stay high and wide', 'Run in behind', 'Cut inside to shoot'],
        instructions: 'Exploit space on counter-attacks'
      }
    ],
    tags: ['Counter-Attack', 'Direct', 'Pace'],
    createdAt: new Date('2024-06-01')
  }
];

export const getTacticById = (id: string): Tactic | undefined => {
  return sampleTactics.find(tactic => tactic.id === id);
};

export const getTacticsByScope = (scope: TacticScope, contextId?: string): Tactic[] => {
  return sampleTactics.filter(tactic => {
    if (tactic.scope !== scope) return false;
    
    switch (scope) {
      case 'club':
        return tactic.clubId === contextId;
      case 'ageGroup':
        return tactic.ageGroupId === contextId;
      case 'team':
        return tactic.teamId === contextId;
      default:
        return false;
    }
  });
};

export const getTacticsByClub = (clubId: string): Tactic[] => {
  return sampleTactics.filter(tactic => tactic.clubId === clubId);
};

export const getTacticsBySquadSize = (squadSize: number): Tactic[] => {
  return sampleTactics.filter(tactic => tactic.squadSize === squadSize);
};

export const getTacticsByParentFormation = (formationId: string): Tactic[] => {
  return sampleTactics.filter(tactic => tactic.parentFormationId === formationId);
};

export const getAvailableParentTactics = (
  scope: TacticScope,
  clubId?: string,
  ageGroupId?: string
): Tactic[] => {
  // Get tactics from higher scopes that can be used as parents
  const availableTactics: Tactic[] = [];

  if (scope === 'team' && ageGroupId) {
    // Team can inherit from age group or club
    availableTactics.push(
      ...sampleTactics.filter(t => 
        (t.scope === 'ageGroup' && t.ageGroupId === ageGroupId) ||
        (t.scope === 'club' && t.clubId === clubId)
      )
    );
  } else if (scope === 'ageGroup' && clubId) {
    // Age group can inherit from club
    availableTactics.push(
      ...sampleTactics.filter(t => t.scope === 'club' && t.clubId === clubId)
    );
  }

  return availableTactics;
};
