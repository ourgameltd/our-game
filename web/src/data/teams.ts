import { Team } from '@/types';

export const sampleTeams: Team[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    ageGroupId: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Reds',
    shortName: 'RDS',
    level: 'youth',
    season: '2024/25',
    coachIds: ['c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f'],
    playerIds: ['p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b'],
    playerAssignments: [
      { playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', squadNumber: 1 },  // GK
      { playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', squadNumber: 4 },  // CB
      { playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', squadNumber: 7 },  // Midfielder
      { playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', squadNumber: 9 },  // Forward
      { playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', squadNumber: 10 }, // Forward
      { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', squadNumber: 11 }  // Winger
    ],
    colors: {
      primary: '#DC2626', // Red
      secondary: '#FFFFFF'
    },
    isArchived: false
  },
  {
    id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    ageGroupId: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Whites',
    shortName: 'WTS',
    level: 'youth',
    season: '2024/25',
    coachIds: ['c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f'],
    playerIds: ['p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', 'p31b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d'],
    playerAssignments: [
      { playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', squadNumber: 7 },
      { playerId: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', squadNumber: 8 },
      { playerId: 'p31b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', squadNumber: 9 }
    ],
    colors: {
      primary: '#F3F4F6', // Light gray/white
      secondary: '#1F2937'
    },
    isArchived: false
  },
  {
    id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    ageGroupId: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Blues',
    shortName: 'BLS',
    level: 'youth',
    season: '2024/25',
    coachIds: ['c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f'],
    playerIds: ['p32c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e', 'p33d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f', 'p34e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a'],
    playerAssignments: [
      { playerId: 'p32c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e', squadNumber: 2 },
      { playerId: 'p33d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f', squadNumber: 5 },
      { playerId: 'p34e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a', squadNumber: 6 }
    ],
    colors: {
      primary: '#2563EB', // Blue
      secondary: '#FFFFFF'
    },
    isArchived: true
  },
  {
    id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    ageGroupId: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    name: 'Reds',
    shortName: 'RDS',
    level: 'youth',
    season: '2024/25',
    coachIds: ['c2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a'],
    playerIds: [],
    colors: {
      primary: '#DC2626',
      secondary: '#FFFFFF'
    },
    isArchived: false
  },
  {
    id: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    ageGroupId: '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    name: 'First Team',
    shortName: 'FT',
    level: 'senior',
    season: '2024/25',
    coachIds: ['c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f'],
    playerIds: [],
    colors: {
      primary: '#1a472a',
      secondary: '#ffd700'
    },
    isArchived: false
  },
  {
    id: 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    ageGroupId: '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
    name: 'Greens',
    shortName: 'GRN',
    level: 'youth',
    season: '2023/24',
    coachIds: ['c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f'],
    playerIds: [],
    colors: {
      primary: '#16A34A',
      secondary: '#FFFFFF'
    },
    isArchived: true
  }
];

export const getTeamsByClubId = (clubId: string): Team[] => {
  return sampleTeams.filter(team => team.clubId === clubId && !team.isArchived);
};

export const getTeamsByAgeGroupId = (ageGroupId: string): Team[] => {
  return sampleTeams.filter(team => team.ageGroupId === ageGroupId && !team.isArchived);
};

export const getTeamById = (id: string): Team | undefined => {
  return sampleTeams.find(team => team.id === id);
};

export const getTeamsByIds = (ids: string[]): Team[] => {
  return sampleTeams.filter(team => ids.includes(team.id));
};

export const getPlayerSquadNumber = (teamId: string, playerId: string): number | undefined => {
  const team = getTeamById(teamId);
  if (!team?.playerAssignments) return undefined;
  const assignment = team.playerAssignments.find(a => a.playerId === playerId);
  return assignment?.squadNumber;
};

