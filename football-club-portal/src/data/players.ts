import { Player } from '../types/index';
import { getTeamsByAgeGroupId } from './teams';

export const samplePlayers: Player[] = [
  // Reds Team Players (2014 Age Group)
  {
    id: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'],
    parentIds: ['1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'],
    firstName: 'Oliver',
    lastName: 'Thompson',
    nickname: 'The Wall',
    dateOfBirth: new Date('2014-03-15'),
    photo: 'https://placehold.co/150/4A90E2/FFFFFF?text=OT',
    preferredPositions: ['GK'],
    attributes: {
      // Skills
      ballControl: 45,
      crossing: 35,
      weakFoot: 40,
      dribbling: 40,
      finishing: 30,
      freeKick: 35,
      heading: 42,
      longPassing: 48,
      longShot: 38,
      penalties: 50,
      shortPassing: 52,
      shotPower: 40,
      slidingTackle: 38,
      standingTackle: 40,
      volleys: 35,
      // Physical
      acceleration: 55,
      agility: 62,
      balance: 58,
      jumping: 60,
      pace: 54,
      reactions: 68,
      sprintSpeed: 53,
      stamina: 60,
      strength: 48,
      // Mental
      aggression: 45,
      attackingPosition: 35,
      awareness: 65,
      communication: 72,
      composure: 60,
      defensivePositioning: 60,
      interceptions: 42,
      marking: 40,
      positivity: 68,
      positioning: 70,
      vision: 50
    },
    overallRating: 50,
    evaluations: [
      {
        id: 'eval1-p9',
        playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'reactions', rating: 68, notes: 'Excellent shot-stopping reflexes' },
          { name: 'positioning', rating: 70, notes: 'Good positioning for age' },
          { name: 'composure', rating: 60, notes: 'Calm under pressure' }
        ],
        overallRating: 50,
        coachNotes: 'Oliver is a reliable goalkeeper with excellent reflexes. His positioning has improved significantly this season.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ],
    medicalInfo: {
      allergies: ['Pollen'],
      emergencyContacts: [
        {
          id: 'ec-1',
          name: 'Sarah Thompson',
          phone: '+44 7890 123456',
          relationship: 'Mother',
          isPrimary: true
        },
        {
          id: 'ec-2',
          name: 'David Thompson',
          phone: '+44 7891 234567',
          relationship: 'Father',
          isPrimary: false
        }
      ]
    }
  },
  {
    id: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'],
    parentIds: ['2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e'],
    firstName: 'James',
    lastName: 'Wilson',
    dateOfBirth: new Date('2014-07-22'),
    preferredPositions: ['CB', 'RB'],
    attributes: {
      // Skills
      ballControl: 52,
      crossing: 45,
      weakFoot: 42,
      dribbling: 48,
      finishing: 38,
      freeKick: 40,
      heading: 65,
      longPassing: 50,
      longShot: 42,
      penalties: 45,
      shortPassing: 55,
      shotPower: 48,
      slidingTackle: 60,
      standingTackle: 62,
      volleys: 40,
      // Physical
      acceleration: 58,
      agility: 54,
      balance: 56,
      jumping: 64,
      pace: 57,
      reactions: 58,
      sprintSpeed: 56,
      stamina: 62,
      strength: 60,
      // Mental
      aggression: 55,
      attackingPosition: 40,
      awareness: 62,
      communication: 65,
      composure: 58,
      defensivePositioning: 68,
      interceptions: 60,
      marking: 62,
      positivity: 58,
      positioning: 60,
      vision: 48
    },
    overallRating: 54,
    evaluations: [
      {
        id: 'eval1-p10',
        playerId: 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'marking', rating: 65, notes: 'Strong 1v1 defender' },
          { name: 'heading', rating: 65, notes: 'Dominant in the air' },
          { name: 'standingTackle', rating: 62, notes: 'Good timing on tackles' }
        ],
        overallRating: 56,
        coachNotes: 'James is a solid defender with good physical presence. His reading of the game continues to improve.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ],
    medicalInfo: {
      conditions: ['Asthma'],
      emergencyContacts: [
        {
          id: 'ec-3',
          name: 'Emma Wilson',
          phone: '+44 7892 345678',
          relationship: 'Mother',
          isPrimary: true
        }
      ]
    }
  },
  {
    id: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'],
    parentIds: ['3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f'],
    firstName: 'Lucas',
    lastName: 'Martinez',
    nickname: 'Lucky',
    dateOfBirth: new Date('2014-04-20'),
    photo: 'https://placehold.co/150/E94B3C/FFFFFF?text=LM',
    preferredPositions: ['CB', 'LB'],
    attributes: {
      // Skills
      ballControl: 58,
      crossing: 48,
      weakFoot: 45,
      dribbling: 52,
      finishing: 42,
      freeKick: 50,
      heading: 62,
      longPassing: 56,
      longShot: 48,
      penalties: 50,
      shortPassing: 60,
      shotPower: 50,
      slidingTackle: 58,
      standingTackle: 60,
      volleys: 45,
      // Physical
      acceleration: 60,
      agility: 58,
      balance: 60,
      jumping: 62,
      pace: 59,
      reactions: 60,
      sprintSpeed: 58,
      stamina: 65,
      strength: 58,
      // Mental
      aggression: 52,
      attackingPosition: 70,
      awareness: 62,
      communication: 55,
      composure: 60,
      defensivePositioning: 38,
      interceptions: 35,
      marking: 40,
      positivity: 62,
      positioning: 68,
      vision: 55
    },
    overallRating: 56,
    evaluations: [
      {
        id: 'eval1-p11',
        playerId: 'p11c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'interceptions', rating: 64, notes: 'Reads the game well' },
          { name: 'shortPassing', rating: 60, notes: 'Good distribution from the back' },
          { name: 'positioning', rating: 65, notes: 'Excellent defensive awareness' }
        ],
        overallRating: 58,
        coachNotes: 'Lucas is developing into an excellent ball-playing defender. His composure on the ball is impressive.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  {
    id: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'],
    parentIds: ['4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a'],
    firstName: 'Ethan',
    lastName: 'Davies',
    dateOfBirth: new Date('2014-05-18'),
    preferredPositions: ['CM', 'CAM'],
    attributes: {
      // Skills
      ballControl: 65,
      crossing: 55,
      weakFoot: 58,
      dribbling: 62,
      finishing: 52,
      freeKick: 60,
      heading: 48,
      longPassing: 62,
      longShot: 58,
      penalties: 55,
      shortPassing: 68,
      shotPower: 55,
      slidingTackle: 48,
      standingTackle: 50,
      volleys: 52,
      // Physical
      acceleration: 62,
      agility: 64,
      balance: 62,
      jumping: 52,
      pace: 60,
      reactions: 62,
      sprintSpeed: 59,
      stamina: 68,
      strength: 50,
      // Mental
      aggression: 48,
      attackingPosition: 58,
      awareness: 65,
      communication: 70,
      composure: 62,
      defensivePositioning: 55,
      interceptions: 52,
      marking: 50,
      positivity: 75,
      positioning: 60,
      vision: 68
    },
    overallRating: 57,
    evaluations: [
      {
        id: 'eval1-p12',
        playerId: 'p12d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'vision', rating: 70, notes: 'Excellent playmaker' },
          { name: 'shortPassing', rating: 68, notes: 'Very accurate passer' },
          { name: 'stamina', rating: 68, notes: 'Covers ground well' }
        ],
        overallRating: 59,
        coachNotes: 'Ethan is the creative hub of the team. His vision and passing ability are exceptional for his age.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  {
    id: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'],
    parentIds: ['5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'],
    firstName: 'Noah',
    lastName: 'Anderson',
    nickname: 'Rocket',
    dateOfBirth: new Date('2014-06-10'),
    photo: 'https://placehold.co/150/6FCF97/FFFFFF?text=NA',
    preferredPositions: ['ST', 'CF'],
    attributes: {
      // Skills
      ballControl: 68,
      crossing: 48,
      weakFoot: 52,
      dribbling: 66,
      finishing: 72,
      freeKick: 55,
      heading: 58,
      longPassing: 48,
      longShot: 62,
      penalties: 68,
      shortPassing: 62,
      shotPower: 65,
      slidingTackle: 35,
      standingTackle: 38,
      volleys: 60,
      // Physical
      acceleration: 70,
      agility: 68,
      balance: 66,
      jumping: 60,
      pace: 68,
      reactions: 68,
      sprintSpeed: 67,
      stamina: 62,
      strength: 55,
      // Mental
      aggression: 52,
      attackingPosition: 72,
      awareness: 66,
      composure: 65,
      defensivePositioning: 65,
      interceptions: 35,
      marking: 32,
      positioning: 70,
      vision: 62,
      positivity: 60,
      communication: 60
    },
    overallRating: 62,
    evaluations: [
      {
        id: 'eval1-p13',
        playerId: 'p13e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'finishing', rating: 72, notes: 'Natural goal scorer' },
          { name: 'attackingPosition', rating: 72, notes: 'Excellent movement in the box' },
          { name: 'acceleration', rating: 70, notes: 'Quick off the mark' }
        ],
        overallRating: 62,
        coachNotes: 'Noah is our top scorer and shows real promise as a striker. His finishing and positioning are outstanding.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  {
    id: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'],
    parentIds: ['6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c'],
    firstName: 'Charlie',
    lastName: 'Roberts',
    nickname: 'Flash',
    dateOfBirth: new Date('2014-11-03'),
    preferredPositions: ['ST', 'RW'],
    isArchived: true,
    attributes: {
      // Skills
      ballControl: 62,
      crossing: 58,
      weakFoot: 55,
      dribbling: 65,
      finishing: 64,
      freeKick: 52,
      heading: 52,
      longPassing: 50,
      longShot: 58,
      penalties: 60,
      shortPassing: 58,
      shotPower: 60,
      slidingTackle: 38,
      standingTackle: 40,
      volleys: 56,
      // Physical
      acceleration: 68,
      agility: 66,
      balance: 64,
      jumping: 56,
      pace: 66,
      reactions: 64,
      sprintSpeed: 65,
      stamina: 64,
      strength: 52,
      // Mental
      aggression: 58,
      attackingPosition: 48,
      awareness: 68,
      communication: 75,
      composure: 62,
      defensivePositioning: 70,
      interceptions: 68,
      marking: 65,
      positivity: 60,
      positioning: 65,
      vision: 58
    },
    overallRating: 59,
    evaluations: [
      {
        id: 'eval1-p29',
        playerId: 'p29f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'acceleration', rating: 68, notes: 'Very quick' },
          { name: 'dribbling', rating: 65, notes: 'Good close control' },
          { name: 'finishing', rating: 64, notes: 'Clinical finisher' }
        ],
        overallRating: 59,
        coachNotes: 'Charlie is a versatile attacker who can play across the front line. His pace is a real asset.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  
  // Whites Team Players (2014 Age Group)
  {
    id: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'],
    parentIds: ['7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d'],
    firstName: 'William',
    lastName: 'Brown',
    dateOfBirth: new Date('2014-04-12'),
    photo: 'https://placehold.co/150/F5A623/FFFFFF?text=WB',
    preferredPositions: ['CM', 'CDM'],
    attributes: {
      // Skills
      ballControl: 60,
      crossing: 52,
      weakFoot: 50,
      dribbling: 58,
      finishing: 48,
      freeKick: 55,
      heading: 55,
      longPassing: 62,
      longShot: 55,
      penalties: 52,
      shortPassing: 65,
      shotPower: 52,
      slidingTackle: 58,
      standingTackle: 60,
      volleys: 50,
      // Physical
      acceleration: 58,
      agility: 60,
      balance: 60,
      jumping: 58,
      pace: 57,
      reactions: 62,
      sprintSpeed: 56,
      stamina: 70,
      strength: 58,
      // Mental
      aggression: 50,
      attackingPosition: 52,
      awareness: 68,
      composure: 65,
      defensivePositioning: 65,
      interceptions: 64,
      marking: 60,
      positioning: 65,
      vision: 66,
      positivity: 60,
      communication: 60
    },
    overallRating: 59,
    evaluations: [
      {
        id: 'eval1-p30',
        playerId: 'p30a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'stamina', rating: 70, notes: 'Tireless worker' },
          { name: 'awareness', rating: 68, notes: 'Excellent game reading' },
          { name: 'vision', rating: 66, notes: 'Good playmaking ability' }
        ],
        overallRating: 59,
        coachNotes: 'William is the engine of the team. His work rate and awareness make him invaluable in midfield.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  {
    id: 'p31b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'],
    parentIds: ['8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e'],
    firstName: 'Harry',
    lastName: 'Taylor',
    dateOfBirth: new Date('2014-08-07'),
    preferredPositions: ['CB', 'CDM'],
    isArchived: true,
    attributes: {
      // Skills
      ballControl: 50,
      crossing: 42,
      weakFoot: 40,
      dribbling: 45,
      finishing: 35,
      freeKick: 42,
      heading: 62,
      longPassing: 52,
      longShot: 45,
      penalties: 48,
      shortPassing: 55,
      shotPower: 48,
      slidingTackle: 62,
      standingTackle: 65,
      volleys: 40,
      // Physical
      acceleration: 54,
      agility: 52,
      balance: 55,
      jumping: 65,
      pace: 53,
      reactions: 58,
      sprintSpeed: 52,
      stamina: 62,
      strength: 65,
      // Mental
      aggression: 52,
      attackingPosition: 55,
      awareness: 58,
      communication: 62,
      composure: 54,
      defensivePositioning: 60,
      interceptions: 56,
      marking: 58,
      positivity: 55,
      positioning: 56,
      vision: 50
    },
    overallRating: 53,
    evaluations: [
      {
        id: 'eval1-p31',
        playerId: 'p31b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'marking', rating: 68, notes: 'Strong defender' },
          { name: 'interceptions', rating: 65, notes: 'Good reading of play' },
          { name: 'strength', rating: 65, notes: 'Physical presence' }
        ],
        overallRating: 55,
        coachNotes: 'Harry is a strong, physical defender who rarely loses his battles. A real leader at the back.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  
  // Blues Team Players (2014 Age Group)
  {
    id: 'p32c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'],
    parentIds: ['9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f'],
    firstName: 'Mason',
    lastName: 'Evans',
    dateOfBirth: new Date('2014-02-20'),
    photo: 'https://placehold.co/150/9013FE/FFFFFF?text=ME',
    preferredPositions: ['RW', 'LW'],
    attributes: {
      // Skills
      ballControl: 66,
      crossing: 64,
      weakFoot: 60,
      dribbling: 70,
      finishing: 58,
      freeKick: 56,
      heading: 45,
      longPassing: 52,
      longShot: 58,
      penalties: 55,
      shortPassing: 62,
      shotPower: 58,
      slidingTackle: 35,
      standingTackle: 38,
      volleys: 54,
      // Physical
      acceleration: 72,
      agility: 70,
      balance: 68,
      jumping: 52,
      pace: 70,
      reactions: 66,
      sprintSpeed: 71,
      stamina: 64,
      strength: 48,
      // Mental
      aggression: 42,
      attackingPosition: 70,
      awareness: 60,
      communication: 58,
      composure: 58,
      defensivePositioning: 42,
      interceptions: 40,
      marking: 38,
      positivity: 72,
      positioning: 68,
      vision: 62
    },
    overallRating: 59,
    evaluations: [
      {
        id: 'eval1-p32',
        playerId: 'p32c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'acceleration', rating: 72, notes: 'Electric pace' },
          { name: 'dribbling', rating: 70, notes: 'Excellent 1v1 ability' },
          { name: 'crossing', rating: 64, notes: 'Good delivery' }
        ],
        overallRating: 60,
        coachNotes: 'Mason is an exciting winger with great pace and dribbling. He can beat defenders with ease.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  {
    id: 'p33d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'],
    parentIds: ['0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a'],
    firstName: 'Alexander',
    lastName: 'White',
    dateOfBirth: new Date('2014-06-14'),
    preferredPositions: ['CAM', 'CM'],
    attributes: {
      // Skills
      ballControl: 70,
      crossing: 58,
      weakFoot: 62,
      dribbling: 68,
      finishing: 60,
      freeKick: 65,
      heading: 48,
      longPassing: 66,
      longShot: 64,
      penalties: 62,
      shortPassing: 72,
      shotPower: 60,
      slidingTackle: 42,
      standingTackle: 45,
      volleys: 58,
      // Physical
      acceleration: 62,
      agility: 66,
      balance: 65,
      jumping: 50,
      pace: 60,
      reactions: 68,
      sprintSpeed: 59,
      stamina: 66,
      strength: 48,
      // Mental
      aggression: 40,
      attackingPosition: 72,
      awareness: 68,
      communication: 68,
      composure: 65,
      defensivePositioning: 45,
      interceptions: 48,
      marking: 42,
      positivity: 78,
      positioning: 70,
      vision: 75
    },
    overallRating: 61,
    evaluations: [
      {
        id: 'eval1-p33',
        playerId: 'p33d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'vision', rating: 75, notes: 'Exceptional vision and creativity' },
          { name: 'shortPassing', rating: 72, notes: 'Pinpoint passing' },
          { name: 'ballControl', rating: 70, notes: 'Silky touch' }
        ],
        overallRating: 63,
        coachNotes: 'Alexander is our most technically gifted player. His vision and passing range set him apart.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  {
    id: 'p34e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'],
    parentIds: ['1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b'],
    firstName: 'George',
    lastName: 'Harris',
    dateOfBirth: new Date('2014-10-28'),
    photo: 'https://placehold.co/150/50E3C2/FFFFFF?text=GH',
    preferredPositions: ['LB', 'CB'],
    attributes: {
      // Skills
      ballControl: 55,
      crossing: 52,
      weakFoot: 48,
      dribbling: 54,
      finishing: 40,
      freeKick: 45,
      heading: 58,
      longPassing: 54,
      longShot: 46,
      penalties: 48,
      shortPassing: 58,
      shotPower: 48,
      slidingTackle: 60,
      standingTackle: 62,
      volleys: 42,
      // Physical
      acceleration: 64,
      agility: 62,
      balance: 60,
      jumping: 58,
      pace: 62,
      reactions: 60,
      sprintSpeed: 63,
      stamina: 68,
      strength: 56,
      // Mental
      aggression: 58,
      attackingPosition: 38,
      awareness: 60,
      communication: 63,
      composure: 56,
      defensivePositioning: 65,
      interceptions: 58,
      marking: 60,
      positivity: 52,
      positioning: 58,
      vision: 45
    },
    overallRating: 52,
    evaluations: [
      {
        id: 'eval1-p34',
        playerId: 'p34e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a',
        evaluatedBy: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
        evaluatedAt: new Date('2024-11-15'),
        attributes: [
          { name: 'stamina', rating: 68, notes: 'Gets up and down well' },
          { name: 'marking', rating: 64, notes: 'Solid defender' },
          { name: 'pace', rating: 62, notes: 'Good recovery speed' }
        ],
        overallRating: 57,
        coachNotes: 'George is a dependable full-back who combines defensive solidity with good attacking support.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      }
    ]
  },
  
  // Player referenced in report cards
  {
    id: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    teamIds: ['d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a'],
    parentIds: ['2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c'],
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    nickname: 'El Matador',
    dateOfBirth: new Date('2012-04-15'),
    preferredPositions: ['ST', 'CF'],
    attributes: {
      // Skills
      ballControl: 75,
      crossing: 58,
      weakFoot: 62,
      dribbling: 72,
      finishing: 80,
      freeKick: 65,
      heading: 62,
      longPassing: 58,
      longShot: 70,
      penalties: 75,
      shortPassing: 68,
      shotPower: 72,
      slidingTackle: 40,
      standingTackle: 42,
      volleys: 70,
      // Physical
      acceleration: 75,
      agility: 73,
      balance: 72,
      jumping: 65,
      pace: 74,
      reactions: 76,
      sprintSpeed: 73,
      stamina: 68,
      strength: 62,
      // Mental
      aggression: 55,
      attackingPosition: 82,
      awareness: 74,
      composure: 75,
      defensivePositioning: 75,
      interceptions: 40,
      marking: 38,
      positioning: 80,
      vision: 68,
      positivity: 60,
      communication: 60
    },
    overallRating: 70,
    evaluations: [
      {
        id: 'eval1-p21',
        playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
        evaluatedBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
        evaluatedAt: new Date('2024-11-01'),
        attributes: [
          { name: 'finishing', rating: 80, notes: 'World-class finishing ability for his age' },
          { name: 'attackingPosition', rating: 82, notes: 'Always in the right place' },
          { name: 'positioning', rating: 80, notes: 'Excellent striker instincts' }
        ],
        overallRating: 70,
        coachNotes: 'Carlos is an exceptional talent. 12 goals in 10 games speaks for itself. His natural finishing ability is outstanding.',
        period: {
          start: new Date('2024-09-01'),
          end: new Date('2024-11-30')
        }
      },
      {
        id: 'eval2-p21',
        playerId: 'p21a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
        evaluatedBy: 'c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f',
        evaluatedAt: new Date('2024-08-15'),
        attributes: [
          { name: 'finishing', rating: 76, notes: 'Improving rapidly' },
          { name: 'attackingPosition', rating: 78, notes: 'Good movement' },
          { name: 'positioning', rating: 76, notes: 'Learning quickly' }
        ],
        overallRating: 67,
        coachNotes: 'Carlos has made excellent progress. His finishing is improving with every game.',
        period: {
          start: new Date('2024-06-01'),
          end: new Date('2024-08-31')
        }
      }
    ]
  }
];

export const getPlayerById = (id: string): Player | undefined => {
  return samplePlayers.find(player => player.id === id);
};

export const getPlayersByTeamId = (teamId: string): Player[] => {
  return samplePlayers.filter(player => player.teamIds.includes(teamId));
};

export const getPlayersByClubId = (clubId: string): Player[] => {
  return samplePlayers.filter(player => player.clubId === clubId);
};

export const getPlayersByAgeGroupId = (ageGroupId: string): Player[] => {
  const teams = getTeamsByAgeGroupId(ageGroupId);
  const teamIds = teams.map(team => team.id);
  return samplePlayers.filter(player => 
    player.teamIds.some(teamId => teamIds.includes(teamId))
  );
};



