import { Match } from '../types/index';

export const sampleMatches: Match[] = [
  // Upcoming matches
  {
    id: 'm1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    opposition: 'Riverside United',
    date: new Date('2025-12-13T15:00:00'),
    kickOffTime: new Date('2025-12-13T15:00:00'),
    meetTime: new Date('2025-12-13T14:15:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'County League Division 1',
    kit: {
      primary: '9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', // Vale Home Kit
      goalkeeper: '9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a' // Vale Goalkeeper Kit
    },
    status: 'scheduled',
    weather: {
      condition: 'Partly Cloudy',
      temperature: 12
    }
  },
  {
    id: 'm2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
    teamId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    opposition: 'Hillside Youth',
    date: new Date('2025-12-14T18:30:00'),
    kickOffTime: new Date('2025-12-14T18:30:00'),
    meetTime: new Date('2025-12-14T17:45:00'),
    location: 'Hillside Stadium',
    isHome: false,
    competition: 'Youth Cup - Quarter Final',
    kit: {
      primary: '9b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', // Vale Away Kit
      goalkeeper: '9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a' // Vale Goalkeeper Kit
    },
    status: 'scheduled'
  },
  {
    id: 'm15u1p2c3-o4m5-i6n7-g8m9-a0t1c2h3e4s5',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    opposition: 'Oakwood Athletic',
    date: new Date('2025-12-20T14:00:00'),
    kickOffTime: new Date('2025-12-20T14:00:00'),
    meetTime: new Date('2025-12-20T13:15:00'),
    location: 'Oakwood Stadium',
    isHome: false,
    competition: 'County League Division 1',
    kit: {
      primary: '9b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', // Vale Away Kit
      goalkeeper: '9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a' // Vale Goalkeeper Kit
    },
    status: 'scheduled'
  },
  {
    id: 'm16u2p3c4-o5m6-i7n8-g9m0-a1t2c3h4e5s6',
    teamId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    opposition: 'Greenfield Rangers',
    date: new Date('2025-12-21T11:00:00'),
    kickOffTime: new Date('2025-12-21T11:00:00'),
    meetTime: new Date('2025-12-21T10:15:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'Youth League',
    kit: {
      primary: '9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', // Vale Home Kit
      goalkeeper: '9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a' // Vale Goalkeeper Kit
    },
    status: 'scheduled'
  },
  {
    id: 'm17u3p4c5-o6m7-i8n9-g0m1-a2t3c4h5e6s7',
    teamId: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    opposition: 'Brookside United',
    date: new Date('2025-12-27T15:30:00'),
    kickOffTime: new Date('2025-12-27T15:30:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'County Cup - Round 3',
    status: 'scheduled'
  },
  {
    id: 'm18u4p5c6-o7m8-i9n0-g1m2-a3t4c5h6e7s8',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    opposition: 'Meadowbank FC',
    date: new Date('2026-01-03T15:00:00'),
    kickOffTime: new Date('2026-01-03T15:00:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'County League Division 1',
    status: 'scheduled'
  },
  {
    id: 'm19u5p6c7-o8m9-i0n1-g2m3-a4t5c6h7e8s9',
    teamId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    opposition: 'Fairview Athletic',
    date: new Date('2026-01-10T13:30:00'),
    kickOffTime: new Date('2026-01-10T13:30:00'),
    location: 'Fairview Park',
    isHome: false,
    competition: 'Youth League',
    status: 'scheduled'
  },
  {
    id: 'm20u6p7c8-o9m0-i1n2-g3m4-a5t6c7h8e9s0',
    teamId: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    opposition: 'Westside Warriors',
    date: new Date('2026-01-17T14:00:00'),
    kickOffTime: new Date('2026-01-17T14:00:00'),
    location: 'Westside Arena',
    isHome: false,
    competition: 'County League Division 2',
    status: 'scheduled'
  },
  
  // Past matches with results
  {
    id: 'm3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    opposition: 'Parkside Rangers',
    date: new Date('2024-12-01T15:00:00'),
    kickOffTime: new Date('2024-12-01T15:00:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'County League Division 1',
    kit: {
      primary: '9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', // Vale Home Kit
      goalkeeper: '9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a' // Vale Goalkeeper Kit
    },
    status: 'completed',
    score: {
      home: 3,
      away: 1
    },
    lineup: {
      formationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
      starting: [
        { playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', position: 'GK' },
        { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', position: 'CB' },
        { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', position: 'CB' },
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', position: 'CM' },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', position: 'ST' }
      ],
      substitutes: ['p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b'],
      substitutions: [
        { minute: 75, playerOut: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', playerIn: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b' }
      ]
    },
    report: {
      summary: 'Dominant performance from the Reds with excellent teamwork. Strong defensive display kept Rangers at bay.',
      goalScorers: [
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', minute: 23, assist: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f' },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', minute: 67, assist: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b' },
        { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', minute: 82 }
      ],
      cards: [
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', type: 'yellow', minute: 55, reason: 'Tactical foul' }
      ],
      injuries: [],
      performanceRatings: [
        { playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', rating: 8.5 },
        { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', rating: 8.0 },
        { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', rating: 8.5 },
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', rating: 7.5 },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', rating: 9.5 }
      ],
      playerOfTheMatch: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a'
    },
    weather: {
      condition: 'Clear',
      temperature: 10
    }
  },
  {
    id: 'm4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9',
    teamId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    opposition: 'Hillside Athletic',
    date: new Date('2024-12-01T13:00:00'),
    kickOffTime: new Date('2024-12-01T13:00:00'),
    location: 'Hillside Park',
    isHome: false,
    competition: 'Youth League',
    status: 'completed',
    kit: {
      primary: 'Away Kit'
    },
    score: {
      home: 2,
      away: 2
    },
    lineup: {
      formationId: 'f2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7',
      starting: [
        { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', position: 'ST' },
        { playerId: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', position: 'CM' },
        { playerId: 'p31b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', position: 'CB' }
      ],
      substitutes: []
    },
    report: {
      summary: 'Hard-fought draw away from home. The Whites came from 2-0 down to secure a point.',
      goalScorers: [
        { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', minute: 65 },
        { playerId: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', minute: 88 }
      ],
      cards: [],
      injuries: [],
      performanceRatings: [
        { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', rating: 8.0 },
        { playerId: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', rating: 8.5 },
        { playerId: 'p31b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', rating: 7.5 }
      ],
      playerOfTheMatch: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c'
    }
  },
  {
    id: 'm5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    opposition: 'Meadow United',
    date: new Date('2024-11-24T15:00:00'),
    kickOffTime: new Date('2024-11-24T15:00:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'County League Division 1',
    status: 'completed',
    kit: {
      primary: 'Home Kit'
    },
    score: {
      home: 4,
      away: 0
    },
    lineup: {
      formationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
      starting: [
        { playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', position: 'GK' },
        { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', position: 'CB' },
        { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', position: 'CB' },
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', position: 'CM' },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', position: 'ST' }
      ],
      substitutes: ['p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b']
    },
    report: {
      summary: 'Comprehensive victory with a clean sheet. Outstanding performance from the whole team.',
      goalScorers: [
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', minute: 12, assist: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f' },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', minute: 34, assist: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d' },
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', minute: 56 },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', minute: 79 }
      ],
      cards: [],
      injuries: [],
      performanceRatings: [
        { playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', rating: 8.5 },
        { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', rating: 8.0 },
        { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', rating: 8.0 },
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', rating: 8.5 },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', rating: 10.0 }
      ],
      playerOfTheMatch: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a'
    }
  },
  {
    id: 'm6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1',
    teamId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    opposition: 'Brookfield Youth',
    date: new Date('2024-11-23T10:00:00'),
    kickOffTime: new Date('2024-11-23T10:00:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'Youth League',
    status: 'completed',
    score: {
      home: 2,
      away: 1
    },
    lineup: {
      formationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
      starting: [
        { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', position: 'ST' },
        { playerId: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', position: 'CM' },
        { playerId: 'p31b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', position: 'CB' }
      ],
      substitutes: []
    },
    report: {
      summary: 'Great win at home with solid team performance. All players contributed well.',
      goalScorers: [
        { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', minute: 34 },
        { playerId: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', minute: 67, assist: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b' }
      ],
      cards: [],
      injuries: [],
      performanceRatings: [
        { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', rating: 8.5 },
        { playerId: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', rating: 8.0 },
        { playerId: 'p31b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', rating: 7.5 }
      ],
      playerOfTheMatch: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b'
    }
  },
  {
    id: 'm7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    opposition: 'Oakwood Eagles',
    date: new Date('2024-11-20T09:30:00'),
    kickOffTime: new Date('2024-11-20T09:30:00'),
    location: 'Oakwood Recreation Ground',
    isHome: false,
    competition: 'Friendly',
    status: 'completed',
    score: {
      home: 3,
      away: 3
    },
    lineup: {
      formationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
      starting: [
        { playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', position: 'GK' },
        { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', position: 'CB' },
        { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', position: 'CB' },
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', position: 'CM' },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', position: 'ST' }
      ],
      substitutes: ['p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b']
    },
    report: {
      summary: 'Exciting match with both teams showing great spirit. All players got plenty of game time and experience.',
      goalScorers: [
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', minute: 15 },
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', minute: 45 },
        { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', minute: 78 }
      ],
      cards: [
        { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', type: 'yellow', minute: 32, reason: 'Persistent fouling' },
        { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', type: 'yellow', minute: 68, reason: 'Dissent' }
      ],
      injuries: [
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', minute: 52, description: 'Ankle sprain', severity: 'minor' }
      ],
      performanceRatings: [
        { playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', rating: 7.0 },
        { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', rating: 7.5 },
        { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', rating: 8.0 },
        { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', rating: 7.5 },
        { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', rating: 8.0 }
      ],
      playerOfTheMatch: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e'
    }
  },
  // Seniors Team matches - Carlos Rodriguez
  {
    id: 'm8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3',
    teamId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    opposition: 'Riverside United',
    date: new Date('2024-12-01T15:00:00'),
    kickOffTime: new Date('2024-12-01T15:00:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'County League Division 1',
    status: 'completed',
    kit: {
      primary: 'Home Kit'
    },
    score: {
      home: 3,
      away: 1
    },
    lineup: {
      formationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
      starting: [
        { playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', position: 'ST' }
      ],
      substitutes: []
    },
    report: {
      summary: 'Dominant performance with Carlos scoring two goals. Team controlled the game throughout.',
      goalScorers: [
        { playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', minute: 23 },
        { playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', minute: 67 }
      ],
      cards: [],
      injuries: [],
      performanceRatings: [
        { playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', rating: 9.0 }
      ],
      playerOfTheMatch: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c'
    },
    weather: {
      condition: 'Clear',
      temperature: 10
    }
  },
  {
    id: 'm9c0d1e2-f3a4-b5c6-d7e8-f9a0b1c2d3e4',
    teamId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    opposition: 'Hillside Athletic',
    date: new Date('2024-11-24T15:00:00'),
    kickOffTime: new Date('2024-11-24T15:00:00'),
    location: 'Hillside Park',
    isHome: false,
    competition: 'County League Division 1',
    status: 'completed',
    kit: {
      primary: 'Away Kit'
    },
    score: {
      home: 2,
      away: 2
    },
    lineup: {
      formationId: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
      starting: [
        { playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', position: 'ST' }
      ],
      substitutes: []
    },
    report: {
      summary: 'Hard-fought draw away from home. Carlos scored a crucial equalizer in the dying minutes.',
      goalScorers: [
        { playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', minute: 88 }
      ],
      cards: [],
      injuries: [],
      performanceRatings: [
        { playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', rating: 7.5 }
      ],
      playerOfTheMatch: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c'
    },
    weather: {
      condition: 'Rainy',
      temperature: 8
    }
  }
];

export const getMatchesByTeamId = (teamId: string): Match[] => {
  return sampleMatches.filter(match => match.teamId === teamId);
};

export const getUpcomingMatches = (teamId?: string, limit?: number): Match[] => {
  const now = new Date();
  let matches = sampleMatches.filter(match => 
    match.status === 'scheduled' && match.date > now
  );
  
  if (teamId) {
    matches = matches.filter(match => match.teamId === teamId);
  }
  
  matches = matches.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (limit) {
    matches = matches.slice(0, limit);
  }
  
  return matches;
};

export const getUpcomingMatchesByTeamIds = (teamIds: string[], limit?: number): Match[] => {
  const now = new Date();
  let matches = sampleMatches.filter(match => 
    match.status === 'scheduled' && 
    match.date > now &&
    teamIds.includes(match.teamId)
  );
  
  matches = matches.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (limit) {
    matches = matches.slice(0, limit);
  }
  
  return matches;
};

export const getPastMatches = (): Match[] => {
  const now = new Date();
  return sampleMatches.filter(match => match.date <= now).sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const getPlayerRecentPerformances = (playerId: string, limit: number = 5) => {
  const now = new Date();
  const completedMatches = sampleMatches
    .filter(match => 
      match.status === 'completed' && 
      match.date <= now &&
      match.report?.performanceRatings?.some(rating => rating.playerId === playerId)
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  return completedMatches.map(match => {
    const rating = match.report!.performanceRatings!.find(r => r.playerId === playerId);
    return {
      matchId: match.id,
      opposition: match.opposition,
      date: match.date,
      rating: rating?.rating || 0,
      isHome: match.isHome
    };
  });
};
