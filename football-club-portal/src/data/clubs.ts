import { Club } from '../types';
import { getAssetUrl } from '../utils/assetHelpers';

export const sampleClubs: Club[] = [
  {
    id: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
    name: 'Vale Football Club',
    shortName: 'Vale FC',
    logo: getAssetUrl('/assets/vale-crest.jpg'),
    colors: {
      primary: '#1a472a',
      secondary: '#ffd700',
      accent: '#ffffff'
    },
    location: {
      city: 'Vale',
      country: 'England',
      venue: 'Community Sports Ground',
      address: '123 Football Lane, Vale'
    },
    founded: 1950,
    history: 'Founded in 1950, Vale Football Club has been a cornerstone of the local community for over 70 years. Starting as a small amateur team, we have grown to support players of all ages and abilities.',
    ethos: 'Vale FC is committed to providing an inclusive, welcoming environment where everyone can enjoy football. We believe in developing not just skilled players, but well-rounded individuals who embody the values of teamwork, respect, and perseverance.',
    principles: [
      'Inclusivity - Football for everyone, regardless of age, ability, or background',
      'Community - Building strong connections within our local area',
      'Development - Nurturing talent and personal growth at every level',
      'Respect - Treating everyone with dignity on and off the pitch',
      'Fun - Ensuring football remains enjoyable for all participants'
    ]
  },
  {
    id: '7d3c8b1a-0e2f-4d5e-6b7c-8d9e0f1a2b3c',
    name: 'Renton United',
    shortName: 'Renton',
    logo: getAssetUrl('/assets/renton-crest.jpg'),
    colors: {
      primary: '#CC0014',
      secondary: '#000000'
    },
    location: {
      city: 'Riverside',
      country: 'England',
      venue: 'Riverside Stadium'
    },
    founded: 1985,
    history: 'Riverside United was established in 1985 by a group of local enthusiasts.',
    ethos: 'Excellence through teamwork and dedication.'
  }
];

export const getClubById = (id: string): Club | undefined => {
  return sampleClubs.find(club => club.id === id);
};
