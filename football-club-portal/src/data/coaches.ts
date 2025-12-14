import { Coach } from '../types/index';

export const sampleCoaches: Coach[] = [
  // Vale of Leven FC Coaches
  {
    id: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b', // Vale of Leven FC
    firstName: 'Michael',
    lastName: 'Robertson',
    dateOfBirth: new Date('1978-05-12'),
    photo: 'https://placehold.co/150/2C3E50/FFFFFF?text=MR',
    email: 'michael.robertson@valefc.com',
    phone: '+44 7700 900123',
    associationId: 'SFA-24781',
    hasAccount: true,
    role: 'head-coach',
    biography: 'Experienced youth coach with over 15 years developing young talent. Former professional player with Vale of Leven FC and passionate about grassroots football development.',
    specializations: ['Youth Development', 'Tactical Training', 'Team Building'],
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'], // 2014 Reds
  },
  {
    id: 'c2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    firstName: 'Sarah',
    lastName: 'McKenzie',
    dateOfBirth: new Date('1985-09-23'),
    photo: 'https://placehold.co/150/8E44AD/FFFFFF?text=SM',
    email: 'sarah.mckenzie@valefc.com',
    phone: '+44 7700 900124',
    associationId: 'SFA-31245',
    hasAccount: false,
    role: 'assistant-coach',
    biography: 'Dedicated assistant coach with expertise in fitness and conditioning. Former semi-professional player committed to player welfare and development.',
    specializations: ['Fitness Training', 'Player Welfare', 'Set Pieces'],
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'], // 2014 Reds
  },
  {
    id: 'c3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    firstName: 'David',
    lastName: 'Campbell',
    dateOfBirth: new Date('1982-11-08'),
    photo: 'https://placehold.co/150/16A085/FFFFFF?text=DC',
    email: 'david.campbell@valefc.com',
    phone: '+44 7700 900125',
    associationId: 'SFA-28934',
    hasAccount: true,
    role: 'goalkeeper-coach',
    biography: 'Former professional goalkeeper with over 200 appearances. Specializes in goalkeeper development and technical training for all age groups.',
    specializations: ['Goalkeeper Training', 'Shot Stopping', 'Distribution'],
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'], // 2014 Reds & Blues
  },
  {
    id: 'c4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    firstName: 'Emma',
    lastName: 'Wilson',
    dateOfBirth: new Date('1990-03-17'),
    photo: 'https://placehold.co/150/E74C3C/FFFFFF?text=EW',
    email: 'emma.wilson@valefc.com',
    phone: '+44 7700 900126',
    associationId: 'SFA-34567',
    hasAccount: false,
    role: 'head-coach',
    biography: 'Young and dynamic coach with a focus on modern coaching methodologies. Passionate about developing well-rounded players both on and off the pitch.',
    specializations: ['Technical Skills', 'Game Intelligence', 'Youth Psychology'],
    teamIds: ['b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'], // 2014 Blues
  },
  {
    id: 'c5a6b7c8-d9e0-f1a2-b3c4-d5e6f7a8b9c0',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    firstName: 'James',
    lastName: 'Anderson',
    dateOfBirth: new Date('1975-07-30'),
    photo: 'https://placehold.co/150/3498DB/FFFFFF?text=JA',
    email: 'james.anderson@valefc.com',
    phone: '+44 7700 900127',
    associationId: 'SFA-21456',
    hasAccount: true,
    role: 'head-coach',
    biography: 'Veteran coach with extensive experience in Scottish football. Known for developing young talent and building strong team cultures.',
    specializations: ['Team Leadership', 'Defensive Organization', 'Match Analysis'],
    teamIds: ['1a2b3c4d-5e6f-a7b8-c9d0-e1f2a3b4c5d6'], // Senior Team
  },
  {
    id: 'c6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1',
    clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    firstName: 'Laura',
    lastName: 'Thomson',
    dateOfBirth: new Date('1988-12-05'),
    photo: 'https://placehold.co/150/F39C12/FFFFFF?text=LT',
    email: 'laura.thomson@valefc.com',
    phone: '+44 7700 900128',
    associationId: 'SFA-32789',
    hasAccount: false,
    role: 'fitness-coach',
    biography: 'Sports science specialist focusing on youth player physical development and injury prevention.',
    specializations: ['Physical Development', 'Injury Prevention', 'Nutrition'],
    teamIds: ['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'], // Multiple teams
  },
];

// Helper functions to filter coaches
export const getCoachesByClub = (clubId: string): Coach[] => {
  return sampleCoaches.filter(coach => coach.clubId === clubId && !coach.isArchived);
};

export const getCoachesByTeam = (teamId: string): Coach[] => {
  return sampleCoaches.filter(coach => coach.teamIds.includes(teamId) && !coach.isArchived);
};

export const getCoachById = (coachId: string): Coach | undefined => {
  return sampleCoaches.find(coach => coach.id === coachId);
};

export const getCoachesByAgeGroup = (ageGroupId: string, teams: any[]): Coach[] => {
  const ageGroupTeamIds = teams
    .filter(team => team.ageGroupId === ageGroupId)
    .map(team => team.id);
  
  return sampleCoaches.filter(coach => 
    coach.teamIds.some(teamId => ageGroupTeamIds.includes(teamId)) && !coach.isArchived
  );
};
