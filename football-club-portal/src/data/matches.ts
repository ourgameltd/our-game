import { Match } from '../types/index';

export const sampleMatches: Match[] = [
  // Upcoming matches
  {
    id: 'm1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    opposition: 'Riverside United',
    date: new Date('2024-12-08T15:00:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'County League Division 1',
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
    date: new Date('2024-12-10T18:30:00'),
    location: 'Hillside Stadium',
    isHome: false,
    competition: 'Youth Cup - Quarter Final',
    status: 'scheduled'
  },
  
  // Past matches with results
  {
    id: 'm3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8',
    teamId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    opposition: 'Parkside Rangers',
    date: new Date('2024-12-01T15:00:00'),
    location: 'Community Sports Ground',
    isHome: true,
    competition: 'County League Division 1',
    kit: {
      primary: 'Home Kit'
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
  }
];

export const getMatchesByTeamId = (teamId: string): Match[] => {
  return sampleMatches.filter(match => match.teamId === teamId);
};

export const getUpcomingMatches = (): Match[] => {
  const now = new Date();
  return sampleMatches.filter(match => match.date > now).sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getPastMatches = (): Match[] => {
  const now = new Date();
  return sampleMatches.filter(match => match.date <= now).sort((a, b) => b.date.getTime() - a.date.getTime());
};
