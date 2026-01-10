import { TrainingSession, Drill, DrillTemplate } from '../types/index';

export const sampleDrills: Drill[] = [
  {
    id: 'd1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    name: 'Passing Triangle',
    description: 'Three players form a triangle and practice quick one-touch passing',
    duration: 10,
    category: 'technical',
    attributes: ['shortPassing', 'ballControl', 'communication', 'awareness'],
    equipment: ['Cones', 'Balls'],
    instructions: [
      'Set up three cones in a triangle, 10 yards apart',
      'One player at each cone with one ball',
      'Pass clockwise, move to next cone',
      'After 5 minutes, switch to counter-clockwise',
      'Progress to two-touch, then one-touch'
    ],
    variations: [
      'Increase distance between cones',
      'Use both feet',
      'Add a defender in the middle'
    ],
    links: [
      {
        url: 'https://www.youtube.com/watch?v=example1',
        title: 'Passing Triangle Tutorial - Pro Coach Tips',
        type: 'youtube'
      }
    ]
  },
  {
    id: 'd2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    name: 'Dribbling Gates',
    description: 'Players dribble through small gates to improve close control',
    duration: 15,
    category: 'technical',
    attributes: ['dribbling', 'ballControl', 'agility', 'acceleration'],
    equipment: ['Cones', 'Balls'],
    instructions: [
      'Set up 10-15 small gates (2 cones, 2 yards apart) in area',
      'Each player with a ball',
      'Dribble through as many gates as possible in time limit',
      'Can only go through each gate once',
      'Use different surfaces of foot'
    ],
    links: [
      {
        url: 'https://www.instagram.com/reel/example',
        title: 'Dribbling Gates Demo',
        type: 'instagram'
      },
      {
        url: 'https://www.tiktok.com/@coach/video/example',
        title: 'Quick Dribbling Tips',
        type: 'tiktok'
      }
    ]
  },
  {
    id: 'd3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    name: '5v5 Possession',
    description: 'Small-sided game focusing on keeping possession',
    duration: 20,
    category: 'tactical',
    attributes: ['shortPassing', 'positioning', 'awareness', 'vision', 'ballControl'],
    equipment: ['Cones', 'Balls', 'Bibs'],
    instructions: [
      'Mark out 30x30 yard area',
      '5v5 in the area',
      'Team scores a point for 10 consecutive passes',
      'Can add neutrals to make easier',
      'Rotate teams every 5 minutes'
    ]
  },
  {
    id: 'd4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9',
    name: 'Finishing Circuit',
    description: 'Rotate through different finishing scenarios',
    duration: 20,
    category: 'technical',
    attributes: ['finishing', 'shotPower', 'composure', 'attackingPosition', 'volleys'],
    equipment: ['Goals', 'Balls', 'Cones'],
    instructions: [
      'Set up 4 stations around penalty area',
      'Station 1: Through ball and finish',
      'Station 2: Cross and finish',
      'Station 3: Turn and shoot',
      'Station 4: 1v1 with goalkeeper',
      'Players rotate through stations'
    ]
  },
  {
    id: 'd5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0',
    name: 'Defensive Shape',
    description: 'Practice maintaining defensive formation',
    duration: 15,
    category: 'tactical',
    attributes: ['defensivePositioning', 'marking', 'communication', 'interceptions', 'awareness'],
    equipment: ['Cones', 'Balls', 'Bibs'],
    instructions: [
      'Set up half pitch',
      'Defensive unit (4 or 5 players)',
      'Attackers try to break through',
      'Focus on holding shape and moving as a unit',
      'Coach calls out scenarios'
    ]
  },
  {
    id: 'd6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1',
    name: 'Sprint Intervals',
    description: 'High-intensity sprint training to build speed and endurance',
    duration: 20,
    category: 'physical',
    attributes: ['pace', 'sprintSpeed', 'stamina', 'acceleration'],
    equipment: ['Cones'],
    instructions: [
      'Mark 40-yard distance',
      'Sprint full speed, jog back recovery',
      '10 repetitions',
      'Focus on explosive starts',
      '2-minute rest between sets'
    ]
  },
  {
    id: 'd7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2',
    name: '1v1 Defending',
    description: 'Practice individual defensive techniques',
    duration: 15,
    category: 'technical',
    attributes: ['standingTackle', 'slidingTackle', 'balance', 'strength', 'positioning'],
    equipment: ['Cones', 'Balls', 'Bibs'],
    instructions: [
      'Set up 15x15 yard area with goal',
      'Attacker starts with ball',
      'Defender closes down and defends',
      'Work on jockeying and timing',
      'Switch roles after each attempt'
    ]
  },
  {
    id: 'd8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3',
    name: 'Crossing & Finishing',
    description: 'Wide players deliver crosses for strikers to finish',
    duration: 20,
    category: 'technical',
    attributes: ['crossing', 'finishing', 'heading', 'attackingPosition', 'timing'],
    equipment: ['Goals', 'Balls', 'Cones'],
    instructions: [
      'Set up wide positions both sides',
      'Queue of crossers, queue of finishers',
      'Vary cross types: low, high, cut-back',
      'Finishers attack near and far post',
      'Rotate positions every 5 minutes'
    ]
  }
];

export const sampleTrainingSessions: TrainingSession[] = [
  // Upcoming sessions for team a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d (Reds - 2017s)
  {
    id: 's0a1b2c3-d4e5-f6a7-b8c9-c0d1e2f3a4b5',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    date: new Date('2025-12-28T10:00:00'),
    meetTime: new Date('2025-12-28T09:30:00'),
    duration: 75,
    location: 'Community Sports Ground - Pitch 2',
    focusAreas: ['Passing & Movement', 'Build-up Play', 'Team Shape'],
    drillIds: ['d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'd2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7', 'd3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8'],
    // Example: Session using Technical Foundation template plus an ad-hoc 5v5 Possession drill
    sessionDrills: [
      { drillId: 'd1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', source: 'template', templateId: 'dt1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', order: 1 }, // Passing Triangle from template
      { drillId: 'd2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7', source: 'template', templateId: 'dt1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', order: 2 }, // Dribbling Gates from template
      { drillId: 'd3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8', source: 'adhoc', order: 3 }, // 5v5 Possession added manually
    ],
    appliedTemplates: [
      {
        templateId: 'dt1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
        appliedAt: new Date('2025-12-20T14:30:00'),
        drillIds: ['d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'd2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7']
      }
    ],
    coachIds: ['c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'],
    notes: `Post-Christmas training session! Let's shake off those mince pies 🎄

Session Plan:
- Warm up (10 mins): Light jog, dynamic stretches
- Passing drills (20 mins): Triangle passing, wall passes
- Possession game (25 mins): 5v5 with target players
- Cool down (20 mins): Match simulation and stretches

Remember to wrap up warm - forecast is cold but dry!
Please bring water and a positive attitude after the festive break.`,
    status: 'scheduled'
  },
  {
    id: 's1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    date: new Date('2025-01-08T18:00:00'),
    meetTime: new Date('2025-01-08T17:30:00'),
    duration: 90,
    location: 'Community Sports Ground - Pitch 1',
    focusAreas: ['Tactical Awareness', 'Set Pieces', 'Defensive Shape'],
    drillIds: ['d3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8', 'd5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0', 'd7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2'],
    // Example: Defensive Fundamentals template with an extra possession drill
    sessionDrills: [
      { drillId: 'd7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2', source: 'template', templateId: 'dt5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', order: 1 }, // 1v1 Defending
      { drillId: 'd5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0', source: 'template', templateId: 'dt5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', order: 2 }, // Defensive Shape
      { drillId: 'd3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8', source: 'adhoc', order: 3 }, // 5v5 Possession (ad-hoc)
    ],
    appliedTemplates: [
      {
        templateId: 'dt5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
        appliedAt: new Date('2025-01-05T10:00:00'),
        drillIds: ['d7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2', 'd5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0']
      }
    ],
    coachIds: ['c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'c2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7'],
    notes: `Session Plan:
- Warm up (15 mins): Dynamic stretches, passing combinations
- Main session (60 mins): Defensive shape work, corner routines
- Cool down (15 mins): Static stretches, team talk

Focus on defensive organization ahead of the cup match on Saturday. 
Please bring water bottles and arrive on time.

Equipment: Cones, bibs, portable goals needed.`,
    status: 'scheduled'
  },
  {
    id: 's2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    date: new Date('2025-01-15T18:00:00'),
    meetTime: new Date('2025-01-15T17:45:00'),
    duration: 75,
    location: 'Community Sports Ground - Pitch 2',
    focusAreas: ['Technical Skills', 'Finishing', 'First Touch'],
    drillIds: ['d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'd2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7', 'd4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9'],
    // Example: Fully ad-hoc session with no template
    sessionDrills: [
      { drillId: 'd1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', source: 'adhoc', order: 1 }, // Passing Triangle
      { drillId: 'd2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7', source: 'adhoc', order: 2 }, // Dribbling Gates
      { drillId: 'd4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9', source: 'adhoc', order: 3 }, // Finishing Circuit
    ],
    coachIds: ['c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'],
    notes: `Focus on shooting technique this week. 

Bring shin pads - we'll be doing some competitive finishing drills.

Car pooling: James's dad offering lifts from the school - contact him if needed.`,
    status: 'scheduled'
  },
  {
    id: 's3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    date: new Date('2025-01-22T18:00:00'),
    duration: 60,
    location: 'Indoor Sports Hall',
    focusAreas: ['Passing', 'Movement', 'Quick Play'],
    drillIds: ['d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'd3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8'],
    coachIds: ['c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'c3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8'],
    notes: `Indoor session due to weather forecast - pitch likely to be waterlogged.

IMPORTANT: Non-marking trainers required for indoor hall.

Focus on quick passing in tight spaces - perfect for futsal-style play.`,
    status: 'scheduled'
  },
  
  // Upcoming sessions for team b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e (Blues - 2017s)
  {
    id: 's8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3',
    teamId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    date: new Date('2025-01-10T17:30:00'),
    meetTime: new Date('2025-01-10T17:15:00'),
    duration: 60,
    location: 'Community Sports Ground - Pitch 3',
    focusAreas: ['Ball Control', 'Dribbling', 'Fun Games'],
    drillIds: ['d2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7'],
    coachIds: ['c2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7'],
    notes: `Relaxed session this week. Focus on enjoyment and ball mastery.

Please remember to bring snacks for after training - it's Oscar's birthday celebration!`,
    status: 'scheduled'
  },
  
  // Upcoming sessions for team d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a (2016s)
  {
    id: 's9c0d1e2-f3a4-b5c6-d7e8-f9a0b1c2d3e4',
    teamId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    date: new Date('2025-01-09T18:30:00'),
    meetTime: new Date('2025-01-09T18:00:00'),
    duration: 90,
    location: 'Community Sports Ground - Main Pitch',
    focusAreas: ['Match Preparation', 'Possession', 'Pressing'],
    drillIds: ['d3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8', 'd5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0'],
    coachIds: ['c3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8', 'c4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9'],
    notes: `Pre-match training session. League match on Sunday vs Riverside FC.

Focus areas:
1. High pressing triggers
2. Keeping possession under pressure  
3. Quick transitions

Formation: 4-3-3 - will work on movements`,
    status: 'scheduled'
  },
  
  // Past completed sessions with full data
  {
    id: 's4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    date: new Date('2024-12-18T18:00:00'),
    meetTime: new Date('2024-12-18T17:30:00'),
    duration: 90,
    location: 'Community Sports Ground - Pitch 1',
    focusAreas: ['Attacking Play', 'Finishing', 'Crossing'],
    drillIds: ['d3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8', 'd4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9'],
    coachIds: ['c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'c2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7'],
    attendance: [
      { playerId: 'p1a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', status: 'confirmed' },
      { playerId: 'p2b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', status: 'confirmed' },
      { playerId: 'p3c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', status: 'confirmed', notes: 'Left early - minor injury' },
      { playerId: 'p4d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', status: 'declined', notes: 'Illness' },
      { playerId: 'p5e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', status: 'confirmed' },
      { playerId: 'p6f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', status: 'confirmed' }
    ],
    notes: `Good session overall. 

Highlights:
- Great finishing from Jake and Olivia
- Need to work on timing of runs
- Crossing accuracy improving

Next session: Focus on defensive transition`,
    status: 'completed',
    isLocked: true
  },
  {
    id: 's5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    date: new Date('2024-12-11T18:00:00'),
    meetTime: new Date('2024-12-11T17:30:00'),
    duration: 75,
    location: 'Community Sports Ground - Pitch 1',
    focusAreas: ['Possession', 'Transition', 'Communication'],
    drillIds: ['d1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'd3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8'],
    coachIds: ['c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'],
    attendance: [
      { playerId: 'p1a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', status: 'confirmed' },
      { playerId: 'p2b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', status: 'confirmed' },
      { playerId: 'p3c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', status: 'confirmed' },
      { playerId: 'p4d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', status: 'confirmed' },
      { playerId: 'p5e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', status: 'declined', notes: 'School trip' },
      { playerId: 'p6f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', status: 'confirmed' }
    ],
    notes: `Excellent session! Communication much improved from last week.

Players responding well to possession drills - keeping the ball much better under pressure.`,
    status: 'completed',
    isLocked: true
  },
  {
    id: 's6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1',
    teamId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    date: new Date('2024-12-13T17:30:00'),
    duration: 60,
    location: 'Community Sports Ground - Pitch 3',
    focusAreas: ['Dribbling', 'Control', '1v1 Skills'],
    drillIds: ['d2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7'],
    coachIds: ['c2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7'],
    attendance: [
      { playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', status: 'confirmed' },
      { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', status: 'confirmed' },
      { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', status: 'confirmed' },
      { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', status: 'confirmed' },
      { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', status: 'confirmed' }
    ],
    notes: 'All players showed great attitude. Ethan particularly impressive with ball control. Need more work on weak foot.',
    status: 'completed',
    isLocked: true
  },
  {
    id: 's7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2',
    teamId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    date: new Date('2024-12-05T18:30:00'),
    meetTime: new Date('2024-12-05T18:00:00'),
    duration: 90,
    location: 'Community Sports Ground - Main Pitch',
    focusAreas: ['Match Review', 'Set Pieces', 'Goalkeeper Training'],
    drillIds: ['d4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9', 'd5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0'],
    coachIds: ['c3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8', 'c4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9'],
    attendance: [
      { playerId: 'p14f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', status: 'confirmed' },
      { playerId: 'p15a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', status: 'confirmed' },
      { playerId: 'p16b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', status: 'confirmed' },
      { playerId: 'p17c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e', status: 'declined', notes: 'Family commitment' },
      { playerId: 'p18d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f', status: 'confirmed' }
    ],
    notes: `Post-match analysis from Saturday's 3-1 win.

Worked on:
- Corner routines (both attacking and defending)
- GK distribution
- Free kick wall positioning

Players very engaged - good tactical understanding developing.`,
    status: 'completed',
    isLocked: true
  }
];

export const getTrainingSessionsByTeamId = (teamId: string): TrainingSession[] => {
  return sampleTrainingSessions.filter(session => session.teamId === teamId);
};

export const getTrainingSessionsByClubId = (teamIds: string[]): TrainingSession[] => {
  return sampleTrainingSessions.filter(session => teamIds.includes(session.teamId));
};

export const getUpcomingTrainingSessions = (): TrainingSession[] => {
  const now = new Date();
  return sampleTrainingSessions
    .filter(session => session.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getDrillById = (id: string): Drill | undefined => {
  return sampleDrills.find(drill => drill.id === id);
};

// Drill Templates - Reusable session plans
export const sampleDrillTemplates: DrillTemplate[] = [
  {
    id: 'dt1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
    name: 'Technical Foundation',
    description: 'Focus on fundamental ball skills - passing, dribbling, and first touch',
    drillIds: [
      'd1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // Passing Triangle
      'd2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7', // Dribbling Gates
    ],
    attributes: ['shortPassing', 'ballControl', 'dribbling', 'agility', 'communication'],
    totalDuration: 25,
    category: 'technical',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    isPublic: true
  },
  {
    id: 'dt2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Possession Play',
    description: 'Small-sided games focusing on keeping the ball and building play',
    drillIds: [
      'd3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8', // 5v5 Possession
      'd1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // Passing Triangle
    ],
    attributes: ['shortPassing', 'positioning', 'awareness', 'vision', 'ballControl', 'communication'],
    totalDuration: 30,
    category: 'tactical',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    isPublic: true
  },
  {
    id: 'dt3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    name: 'Shooting & Finishing',
    description: 'Improve accuracy and confidence in front of goal',
    drillIds: [
      'd4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9', // Finishing Circuit
      'd8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3', // Crossing & Finishing
    ],
    attributes: ['finishing', 'shotPower', 'composure', 'crossing', 'heading', 'attackingPosition'],
    totalDuration: 40,
    category: 'technical',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    isPublic: true
  },
  {
    id: 'dt4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    name: 'High Intensity Conditioning',
    description: 'Build fitness and endurance through game-realistic exercises',
    drillIds: [
      'd6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1', // Sprint Intervals
    ],
    attributes: ['pace', 'sprintSpeed', 'stamina', 'acceleration'],
    totalDuration: 20,
    category: 'physical',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    isPublic: true
  },
  {
    id: 'dt5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
    name: 'Defensive Fundamentals',
    description: '1v1 defending and team defensive shape',
    drillIds: [
      'd7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2', // 1v1 Defending
      'd5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0', // Defensive Shape
    ],
    attributes: ['standingTackle', 'slidingTackle', 'defensivePositioning', 'marking', 'communication', 'interceptions'],
    totalDuration: 30,
    category: 'tactical',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    isPublic: true
  },
  {
    id: 'dt6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
    name: 'Complete Session - Youth',
    description: 'Full 60-minute session covering all aspects for youth players',
    drillIds: [
      'd2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7', // Dribbling Gates (15min)
      'd1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', // Passing Triangle (10min)
      'd3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8', // 5v5 Possession (20min)
      'd4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9', // Finishing Circuit (20min)
    ],
    attributes: ['dribbling', 'ballControl', 'shortPassing', 'positioning', 'awareness', 'finishing', 'shotPower', 'composure'],
    totalDuration: 65,
    category: 'mixed',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    isPublic: true
  }
];

export const getDrillTemplateById = (id: string): DrillTemplate | undefined => {
  return sampleDrillTemplates.find(template => template.id === id);
};

export const getDrillTemplatesByClubId = (clubId: string): DrillTemplate[] => {
  return sampleDrillTemplates.filter(template => 
    template.clubId === clubId || !template.clubId // Include global templates
  );
};
