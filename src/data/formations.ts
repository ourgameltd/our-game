import { Formation } from '../types/index';

// Helper to create system formation with default scope
const createSystemFormation = (formation: Omit<Formation, 'scope' | 'isSystemFormation'>): Formation => ({
  ...formation,
  isSystemFormation: true,
  scope: { type: 'system' }
});


export const sampleFormations: Formation[] = [
  // 11-a-side formations
  createSystemFormation({
    id: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    name: '4-4-2 Classic',
    system: '4-4-2',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'LM', x: 20, y: 55 },
      { position: 'CM', x: 40, y: 50 },
      { position: 'CM', x: 60, y: 50 },
      { position: 'RM', x: 80, y: 55 },
      { position: 'ST', x: 35, y: 80 },
      { position: 'ST', x: 65, y: 80 }
    ],
    summary: 'Traditional 4-4-2 formation with two strikers and flat midfield',
    tags: [
      'Direct play through the middle',
      'Wide play using full-backs',
      'Two strikers working in partnership'
    ]
  }),
  createSystemFormation({
    id: 'f2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    name: '4-3-3 Attack',
    system: '4-3-3',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'CDM', x: 50, y: 40 },
      { position: 'CM', x: 35, y: 55 },
      { position: 'CM', x: 65, y: 55 },
      { position: 'LW', x: 15, y: 75 },
      { position: 'ST', x: 50, y: 85 },
      { position: 'RW', x: 85, y: 75 }
    ],
    summary: 'Attacking 4-3-3 with wingers and central striker',
    tags: [
      'Width provided by wingers',
      'Central striker as focal point',
      'Defensive midfielder shields back four'
    ]
  }),
  createSystemFormation({
    id: 'f3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    name: '3-5-2',
    system: '3-5-2',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 20 },
      { position: 'CB', x: 50, y: 15 },
      { position: 'CB', x: 70, y: 20 },
      { position: 'LWB', x: 15, y: 45 },
      { position: 'CM', x: 35, y: 50 },
      { position: 'CM', x: 50, y: 45 },
      { position: 'CM', x: 65, y: 50 },
      { position: 'RWB', x: 85, y: 45 },
      { position: 'ST', x: 40, y: 80 },
      { position: 'ST', x: 60, y: 80 }
    ],
    summary: 'Three at the back with wing-backs providing width',
    tags: [
      'Wing-backs push high',
      'Central midfield control',
      'Two strikers partnership'
    ]
  }),
  createSystemFormation({
    id: 'f4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9',
    name: '4-2-3-1',
    system: '4-2-3-1',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'CDM', x: 40, y: 40 },
      { position: 'CDM', x: 60, y: 40 },
      { position: 'LM', x: 20, y: 60 },
      { position: 'CAM', x: 50, y: 65 },
      { position: 'RM', x: 80, y: 60 },
      { position: 'ST', x: 50, y: 85 }
    ],
    summary: 'Modern formation with two holding midfielders and attacking midfielder',
    tags: [
      'Double pivot in midfield',
      'Attacking midfielder supports striker',
      'Wide players cut inside'
    ]
  }),
  
  // 9-a-side formations
  createSystemFormation({
    id: 'f5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0',
    name: '3-3-2',
    system: '3-3-2',
    squadSize: 9,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 22 },
      { position: 'CB', x: 50, y: 18 },
      { position: 'CB', x: 70, y: 22 },
      { position: 'LM', x: 25, y: 50 },
      { position: 'CM', x: 50, y: 48 },
      { position: 'RM', x: 75, y: 50 },
      { position: 'ST', x: 40, y: 80 },
      { position: 'ST', x: 60, y: 80 }
    ],
    summary: 'Solid 9-a-side formation with three defenders and two strikers',
    tags: [
      'Strong defensive shape',
      'Midfield control in center',
      'Two strikers partnership'
    ]
  }),
  createSystemFormation({
    id: 'f6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1',
    name: '2-3-3',
    system: '2-3-3',
    squadSize: 9,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 35, y: 22 },
      { position: 'CB', x: 65, y: 22 },
      { position: 'LM', x: 25, y: 50 },
      { position: 'CM', x: 50, y: 48 },
      { position: 'RM', x: 75, y: 50 },
      { position: 'LW', x: 25, y: 75 },
      { position: 'ST', x: 50, y: 82 },
      { position: 'RW', x: 75, y: 75 }
    ],
    summary: 'Attacking 9-a-side formation with wide players',
    tags: [
      'Width in attack',
      'Two solid center backs',
      'Central striker supported by wingers'
    ]
  }),
  createSystemFormation({
    id: 'f7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2',
    name: '3-2-3',
    system: '3-2-3',
    squadSize: 9,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 22 },
      { position: 'CB', x: 50, y: 18 },
      { position: 'CB', x: 70, y: 22 },
      { position: 'CM', x: 40, y: 48 },
      { position: 'CM', x: 60, y: 48 },
      { position: 'LW', x: 25, y: 75 },
      { position: 'ST', x: 50, y: 82 },
      { position: 'RW', x: 75, y: 75 }
    ],
    summary: 'Balanced 9-a-side with three at the back',
    tags: [
      'Three center backs for stability',
      'Two central midfielders',
      'Attacking width with wingers'
    ]
  }),
  
  // 7-a-side formations
  createSystemFormation({
    id: 'f8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3',
    name: '2-3-1',
    system: '2-3-1',
    squadSize: 7,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 35, y: 25 },
      { position: 'CB', x: 65, y: 25 },
      { position: 'LM', x: 25, y: 52 },
      { position: 'CM', x: 50, y: 50 },
      { position: 'RM', x: 75, y: 52 },
      { position: 'ST', x: 50, y: 82 }
    ],
    summary: 'Classic 7-a-side formation with two defenders and lone striker',
    tags: [
      'Two solid defenders',
      'Strong midfield presence',
      'Support striker from midfield'
    ]
  }),
  createSystemFormation({
    id: 'f9c0d1e2-f3a4-b5c6-d7e8-f9a0b1c2d3e4',
    name: '2-2-2',
    system: '2-2-2',
    squadSize: 7,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 35, y: 25 },
      { position: 'CB', x: 65, y: 25 },
      { position: 'CM', x: 40, y: 52 },
      { position: 'CM', x: 60, y: 52 },
      { position: 'ST', x: 40, y: 82 },
      { position: 'ST', x: 60, y: 82 }
    ],
    summary: 'Balanced 7-a-side with two strikers',
    tags: [
      'Balanced shape throughout',
      'Two strikers working together',
      'Central midfield partnership'
    ]
  }),
  createSystemFormation({
    id: 'fad1e2f3-a4b5-c6d7-e8f9-a0b1c2d3e4f5',
    name: '3-2-1',
    system: '3-2-1',
    squadSize: 7,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 25 },
      { position: 'CB', x: 50, y: 22 },
      { position: 'CB', x: 70, y: 25 },
      { position: 'CM', x: 40, y: 52 },
      { position: 'CM', x: 60, y: 52 },
      { position: 'ST', x: 50, y: 82 }
    ],
    summary: 'Defensive 7-a-side with three at the back',
    tags: [
      'Three defenders for security',
      'Two central midfielders',
      'Lone striker'
    ]
  }),
  
  // 4-a-side formations (for young players)
  createSystemFormation({
    id: 'f4a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
    name: '1-2-1',
    system: '1-2-1',
    squadSize: 4,
    positions: [
      { position: 'CB', x: 50, y: 25 },
      { position: 'CM', x: 35, y: 55 },
      { position: 'CM', x: 65, y: 55 },
      { position: 'ST', x: 50, y: 85 }
    ],
    summary: 'Basic 4-a-side formation with one defender and two midfielders',
    tags: [
      'Single defender covers back',
      'Two players share attacking duties',
      'Encourage passing and movement'
    ]
  }),
  createSystemFormation({
    id: 'f4b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
    name: '2-1-1',
    system: '2-1-1',
    squadSize: 4,
    positions: [
      { position: 'CB', x: 35, y: 30 },
      { position: 'CB', x: 65, y: 30 },
      { position: 'CM', x: 50, y: 60 },
      { position: 'ST', x: 50, y: 85 }
    ],
    summary: 'Defensive 4-a-side with two defenders',
    tags: [
      'Two defenders provide security',
      'Central midfielder links play',
      'Focus on defensive shape'
    ]
  }),
  createSystemFormation({
    id: 'f4c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7',
    name: '1-1-1-1',
    system: '1-1-1-1',
    squadSize: 4,
    positions: [
      { position: 'CB', x: 50, y: 25 },
      { position: 'CM', x: 50, y: 50 },
      { position: 'CAM', x: 50, y: 70 },
      { position: 'ST', x: 50, y: 88 }
    ],
    summary: 'Simple line formation ideal for teaching positioning',
    tags: [
      'Clear positional roles',
      'Easy to understand spacing',
      'Develops fundamental awareness'
    ]
  }),
  createSystemFormation({
    id: 'f4d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8',
    name: '1-2-1 (All Attack)',
    system: '1-2-1',
    squadSize: 4,
    positions: [
      { position: 'CM', x: 50, y: 35 },
      { position: 'LM', x: 30, y: 60 },
      { position: 'RM', x: 70, y: 60 },
      { position: 'ST', x: 50, y: 85 }
    ],
    summary: 'Attacking 4-a-side encouraging forward play and creativity',
    tags: [
      'All players push forward',
      'Develops attacking mindset',
      'Promotes teamwork and passing'
    ]
  }),
  createSystemFormation({
    id: 'f4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9',
    name: '1-2-1 Diamond',
    system: '1-2-1',
    squadSize: 4,
    positions: [
      { position: 'CB', x: 50, y: 25 },
      { position: 'LM', x: 30, y: 55 },
      { position: 'RM', x: 70, y: 55 },
      { position: 'ST', x: 50, y: 85 }
    ],
    summary: 'Diamond shape teaching width and support play',
    tags: [
      'Wide players provide options',
      'Creates triangles for passing',
      'Teaches width and support'
    ]
  }),
  
  // 5-a-side formations
  createSystemFormation({
    id: 'fbe2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6',
    name: '1-2-1',
    system: '1-2-1',
    squadSize: 5,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 50, y: 30 },
      { position: 'CM', x: 35, y: 55 },
      { position: 'CM', x: 65, y: 55 },
      { position: 'ST', x: 50, y: 82 }
    ],
    summary: 'Classic 5-a-side diamond formation',
    tags: [
      'One defender sweeps behind',
      'Two midfielders control center',
      'Lone striker up front'
    ]
  }),
  createSystemFormation({
    id: 'fcf3a4b5-c6d7-e8f9-a0b1-c2d3e4f5a6b7',
    name: '2-1-1',
    system: '2-1-1',
    squadSize: 5,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 35, y: 30 },
      { position: 'CB', x: 65, y: 30 },
      { position: 'CM', x: 50, y: 55 },
      { position: 'ST', x: 50, y: 82 }
    ],
    summary: 'Defensive 5-a-side with two defenders',
    tags: [
      'Two defenders provide cover',
      'Central midfielder links play',
      'Target striker'
    ]
  }),
  createSystemFormation({
    id: 'fda4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8',
    name: '1-1-2',
    system: '1-1-2',
    squadSize: 5,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 50, y: 30 },
      { position: 'CM', x: 50, y: 55 },
      { position: 'ST', x: 40, y: 82 },
      { position: 'ST', x: 60, y: 82 }
    ],
    summary: 'Attacking 5-a-side with two strikers',
    tags: [
      'Single defender',
      'Midfielder supports attack',
      'Two strikers partnership'
    ]
  }),
  
  // Additional 11-a-side formations
  createSystemFormation({
    id: 'f10d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    name: '4-1-4-1',
    system: '4-1-4-1',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'CDM', x: 50, y: 38 },
      { position: 'LM', x: 20, y: 58 },
      { position: 'CM', x: 40, y: 55 },
      { position: 'CM', x: 60, y: 55 },
      { position: 'RM', x: 80, y: 58 },
      { position: 'ST', x: 50, y: 85 }
    ],
    summary: 'Defensive 4-1-4-1 with holding midfielder protecting the back four',
    tags: [
      'Deep-lying midfielder shields defense',
      'Wide midfielders provide width',
      'Lone striker holds up play'
    ]
  }),
  createSystemFormation({
    id: 'f11e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
    name: '3-4-3',
    system: '3-4-3',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 20 },
      { position: 'CB', x: 50, y: 15 },
      { position: 'CB', x: 70, y: 20 },
      { position: 'LM', x: 20, y: 50 },
      { position: 'CM', x: 40, y: 48 },
      { position: 'CM', x: 60, y: 48 },
      { position: 'RM', x: 80, y: 50 },
      { position: 'LW', x: 25, y: 78 },
      { position: 'ST', x: 50, y: 85 },
      { position: 'RW', x: 75, y: 78 }
    ],
    summary: 'Attacking 3-4-3 with three center backs and wide forwards',
    tags: [
      'Three center backs cover width',
      'Flat midfield four',
      'Attacking trio up front'
    ]
  }),
  createSystemFormation({
    id: 'f12f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
    name: '5-3-2',
    system: '5-3-2',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LWB', x: 15, y: 28 },
      { position: 'CB', x: 33, y: 18 },
      { position: 'CB', x: 50, y: 15 },
      { position: 'CB', x: 67, y: 18 },
      { position: 'RWB', x: 85, y: 28 },
      { position: 'CM', x: 35, y: 52 },
      { position: 'CM', x: 50, y: 50 },
      { position: 'CM', x: 65, y: 52 },
      { position: 'ST', x: 40, y: 82 },
      { position: 'ST', x: 60, y: 82 }
    ],
    summary: 'Very defensive formation with five defenders and wing-backs',
    tags: [
      'Five-man defensive line',
      'Wing-backs provide width',
      'Counter-attacking through strikers'
    ]
  }),
  createSystemFormation({
    id: 'f13a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    name: '4-5-1',
    system: '4-5-1',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'LM', x: 18, y: 55 },
      { position: 'CM', x: 35, y: 50 },
      { position: 'CM', x: 50, y: 48 },
      { position: 'CM', x: 65, y: 50 },
      { position: 'RM', x: 82, y: 55 },
      { position: 'ST', x: 50, y: 85 }
    ],
    summary: 'Compact 4-5-1 with packed midfield',
    tags: [
      'Five-man midfield controls center',
      'Difficult to break down',
      'Quick transitions to attack'
    ]
  }),
  createSystemFormation({
    id: 'f14b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
    name: '4-3-2-1',
    system: '4-3-2-1',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'CDM', x: 50, y: 40 },
      { position: 'CM', x: 38, y: 52 },
      { position: 'CM', x: 62, y: 52 },
      { position: 'CAM', x: 38, y: 70 },
      { position: 'CAM', x: 62, y: 70 },
      { position: 'ST', x: 50, y: 88 }
    ],
    summary: 'Christmas tree formation with two attacking midfielders',
    tags: [
      'Holding midfielder anchors',
      'Two playmakers behind striker',
      'Fluid attacking movement'
    ]
  }),
  createSystemFormation({
    id: 'f15c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
    name: '4-4-1-1',
    system: '4-4-1-1',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'LM', x: 20, y: 52 },
      { position: 'CM', x: 40, y: 48 },
      { position: 'CM', x: 60, y: 48 },
      { position: 'RM', x: 80, y: 52 },
      { position: 'CAM', x: 50, y: 70 },
      { position: 'ST', x: 50, y: 88 }
    ],
    summary: 'Variation of 4-4-2 with attacking midfielder',
    tags: [
      'Solid midfield four',
      'Number 10 supports striker',
      'Can switch to 4-4-2 easily'
    ]
  }),
  
  // Additional 9-a-side formations
  createSystemFormation({
    id: 'f16d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
    name: '3-4-1',
    system: '3-4-1',
    squadSize: 9,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 22 },
      { position: 'CB', x: 50, y: 18 },
      { position: 'CB', x: 70, y: 22 },
      { position: 'LM', x: 22, y: 50 },
      { position: 'CM', x: 40, y: 48 },
      { position: 'CM', x: 60, y: 48 },
      { position: 'RM', x: 78, y: 50 },
      { position: 'ST', x: 50, y: 82 }
    ],
    summary: 'Defensive 9-a-side with strong midfield',
    tags: [
      'Three solid center backs',
      'Four-man midfield',
      'Lone striker holds up play'
    ]
  }),
  createSystemFormation({
    id: 'f17e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
    name: '2-4-2',
    system: '2-4-2',
    squadSize: 9,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 35, y: 22 },
      { position: 'CB', x: 65, y: 22 },
      { position: 'LM', x: 22, y: 50 },
      { position: 'CM', x: 40, y: 48 },
      { position: 'CM', x: 60, y: 48 },
      { position: 'RM', x: 78, y: 50 },
      { position: 'ST', x: 40, y: 80 },
      { position: 'ST', x: 60, y: 80 }
    ],
    summary: 'Balanced 9-a-side with strong midfield presence',
    tags: [
      'Two center backs',
      'Four-man midfield dominance',
      'Two strikers for attacking threat'
    ]
  }),
  
  // Additional 7-a-side formations
  createSystemFormation({
    id: 'f18f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
    name: '1-3-2',
    system: '1-3-2',
    squadSize: 7,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 50, y: 25 },
      { position: 'LM', x: 28, y: 52 },
      { position: 'CM', x: 50, y: 50 },
      { position: 'RM', x: 72, y: 52 },
      { position: 'ST', x: 40, y: 82 },
      { position: 'ST', x: 60, y: 82 }
    ],
    summary: 'Attacking 7-a-side with one defender',
    tags: [
      'Single sweeper at back',
      'Midfield three controls game',
      'Two strikers partnership'
    ]
  }),
  createSystemFormation({
    id: 'f19a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
    name: '2-1-3',
    system: '2-1-3',
    squadSize: 7,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 35, y: 25 },
      { position: 'CB', x: 65, y: 25 },
      { position: 'CM', x: 50, y: 50 },
      { position: 'LW', x: 28, y: 78 },
      { position: 'ST', x: 50, y: 85 },
      { position: 'RW', x: 72, y: 78 }
    ],
    summary: 'Very attacking 7-a-side with front three',
    tags: [
      'Two center backs provide base',
      'Central midfielder links play',
      'Three forwards attacking threat'
    ]
  }),
  
  // Experimental & Unusual Formations from Recent Football History
  createSystemFormation({
    id: 'f20b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
    name: '3-3-1-3 (Gasperini)',
    system: '3-3-1-3',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 20 },
      { position: 'CB', x: 50, y: 15 },
      { position: 'CB', x: 70, y: 20 },
      { position: 'LWB', x: 15, y: 48 },
      { position: 'CM', x: 50, y: 42 },
      { position: 'RWB', x: 85, y: 48 },
      { position: 'CAM', x: 50, y: 62 },
      { position: 'LW', x: 20, y: 78 },
      { position: 'ST', x: 50, y: 85 },
      { position: 'RW', x: 80, y: 78 }
    ],
    summary: "Atalanta's ultra-attacking system under Gasperini with aggressive wing-backs",
    tags: [
      'Wing-backs push extremely high',
      'Single pivot midfielder',
      'Front four overloads opposition',
      'High pressing intensity'
    ]
  }),
  createSystemFormation({
    id: 'f21c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
    name: '2-7-2 (Bielsa)',
    system: '2-7-2',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 38, y: 20 },
      { position: 'CB', x: 62, y: 20 },
      { position: 'LWB', x: 12, y: 42 },
      { position: 'CDM', x: 35, y: 38 },
      { position: 'CDM', x: 65, y: 38 },
      { position: 'CM', x: 28, y: 55 },
      { position: 'CM', x: 50, y: 58 },
      { position: 'CM', x: 72, y: 55 },
      { position: 'RWB', x: 88, y: 42 },
      { position: 'ST', x: 40, y: 82 },
      { position: 'ST', x: 60, y: 82 }
    ],
    summary: "Marcelo Bielsa's man-marking system with extreme midfield overload",
    tags: [
      'Man-marking across the pitch',
      'Seven-man midfield dominance',
      'Ultra-high intensity pressing',
      'Rapid transitions'
    ]
  }),
  createSystemFormation({
    id: 'f22d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
    name: '4-2-2-2 (Rangnick)',
    system: '4-2-2-2',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'CDM', x: 40, y: 42 },
      { position: 'CDM', x: 60, y: 42 },
      { position: 'CAM', x: 38, y: 65 },
      { position: 'CAM', x: 62, y: 65 },
      { position: 'ST', x: 40, y: 85 },
      { position: 'ST', x: 60, y: 85 }
    ],
    summary: "Ralf Rangnick's gegenpressing system with compact diamond midfield",
    tags: [
      'Immediate counter-pressing',
      'Compact diamond shape',
      'Two strikers press together',
      'Quick vertical passes'
    ]
  }),
  createSystemFormation({
    id: 'f23e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
    name: '2-3-5 (Inverted Fullbacks)',
    system: '2-3-5',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 35, y: 20 },
      { position: 'CB', x: 65, y: 20 },
      { position: 'LB', x: 28, y: 42 },
      { position: 'CDM', x: 50, y: 40 },
      { position: 'RB', x: 72, y: 42 },
      { position: 'LW', x: 12, y: 70 },
      { position: 'CAM', x: 38, y: 72 },
      { position: 'CAM', x: 62, y: 72 },
      { position: 'RW', x: 88, y: 70 },
      { position: 'ST', x: 50, y: 88 }
    ],
    summary: "Manchester City's inverted fullbacks creating 2-3-5 in possession",
    tags: [
      'Fullbacks invert into midfield',
      'Five attackers in final third',
      'Numerical superiority high up',
      'Possession-based control'
    ]
  }),
  createSystemFormation({
    id: 'f24f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b',
    name: '4-6-0 (False Nine)',
    system: '4-6-0',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'CDM', x: 50, y: 42 },
      { position: 'LM', x: 25, y: 58 },
      { position: 'CM', x: 40, y: 55 },
      { position: 'CM', x: 60, y: 55 },
      { position: 'RM', x: 75, y: 58 },
      { position: 'CF', x: 50, y: 75 }
    ],
    summary: "Spain Euro 2012 'false nine' system with no traditional striker",
    tags: [
      'False nine drops deep',
      'Overload midfield areas',
      'Continuous movement',
      'Possession dominance'
    ]
  }),
  createSystemFormation({
    id: 'f25a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c',
    name: '3-1-6 (De Zerbi)',
    system: '3-1-6',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 18 },
      { position: 'CB', x: 50, y: 15 },
      { position: 'CB', x: 70, y: 18 },
      { position: 'CDM', x: 50, y: 35 },
      { position: 'LWB', x: 18, y: 55 },
      { position: 'CM', x: 38, y: 52 },
      { position: 'CM', x: 62, y: 52 },
      { position: 'RWB', x: 82, y: 55 },
      { position: 'LW', x: 25, y: 78 },
      { position: 'RW', x: 75, y: 78 }
    ],
    summary: "Roberto De Zerbi's ultra-attacking positional play system",
    tags: [
      'Build-up with six attackers',
      'Single pivot orchestrates',
      'Extreme width and overloads',
      'Technical superiority'
    ]
  }),
  createSystemFormation({
    id: 'f26b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
    name: '4-4-2 Diamond',
    system: '4-4-2',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'CDM', x: 50, y: 40 },
      { position: 'CM', x: 35, y: 55 },
      { position: 'CM', x: 65, y: 55 },
      { position: 'CAM', x: 50, y: 68 },
      { position: 'ST', x: 40, y: 85 },
      { position: 'ST', x: 60, y: 85 }
    ],
    summary: "Carlo Ancelotti's diamond midfield overwhelming central areas",
    tags: [
      'Dominate central corridor',
      'Number 10 creates space',
      'Narrow attacking shape',
      'Full-backs provide width'
    ]
  }),
  createSystemFormation({
    id: 'f27c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e',
    name: '3-2-4-1 (Pyramid)',
    system: '3-2-4-1',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'CB', x: 30, y: 20 },
      { position: 'CB', x: 50, y: 15 },
      { position: 'CB', x: 70, y: 20 },
      { position: 'CM', x: 40, y: 42 },
      { position: 'CM', x: 60, y: 42 },
      { position: 'LW', x: 20, y: 65 },
      { position: 'CAM', x: 40, y: 68 },
      { position: 'CAM', x: 60, y: 68 },
      { position: 'RW', x: 80, y: 65 },
      { position: 'ST', x: 50, y: 88 }
    ],
    summary: 'Modern interpretation of WM formation with four attacking midfielders',
    tags: [
      'Retro pyramid structure',
      'Four creative playmakers',
      'Wide forwards cut inside',
      'Lone striker target man'
    ]
  }),
  createSystemFormation({
    id: 'f28d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
    name: '4-1-3-2 (Conte)',
    system: '4-1-3-2',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LB', x: 20, y: 25 },
      { position: 'CB', x: 40, y: 20 },
      { position: 'CB', x: 60, y: 20 },
      { position: 'RB', x: 80, y: 25 },
      { position: 'CDM', x: 50, y: 40 },
      { position: 'LM', x: 30, y: 58 },
      { position: 'CAM', x: 50, y: 62 },
      { position: 'RM', x: 70, y: 58 },
      { position: 'ST', x: 40, y: 82 },
      { position: 'ST', x: 60, y: 82 }
    ],
    summary: "Antonio Conte's transition from back three to aggressive 4-1-3-2",
    tags: [
      'Quick transitions forward',
      'Wing-backs become wingers',
      'Striker partnership',
      'Direct vertical play'
    ]
  }),
  createSystemFormation({
    id: 'f29e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a',
    name: '5-2-3 (Mourinho Low Block)',
    system: '5-2-3',
    squadSize: 11,
    positions: [
      { position: 'GK', x: 50, y: 5 },
      { position: 'LWB', x: 15, y: 30 },
      { position: 'CB', x: 33, y: 22 },
      { position: 'CB', x: 50, y: 18 },
      { position: 'CB', x: 67, y: 22 },
      { position: 'RWB', x: 85, y: 30 },
      { position: 'CDM', x: 40, y: 45 },
      { position: 'CDM', x: 60, y: 45 },
      { position: 'LW', x: 30, y: 70 },
      { position: 'ST', x: 50, y: 75 },
      { position: 'RW', x: 70, y: 70 }
    ],
    summary: "José Mourinho's defensive masterclass turning to counter-attack",
    tags: [
      'Deep defensive block',
      'Five defenders + two shields',
      'Rapid counter-attacks',
      'Clinical transitions'
    ]
  })
];

export const getFormationById = (id: string): Formation | undefined => {
  return sampleFormations.find(formation => formation.id === id);
};

export const getFormationsBySquadSize = (squadSize: number): Formation[] => {
  return sampleFormations.filter(formation => formation.squadSize === squadSize);
};
