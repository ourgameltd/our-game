import { User } from '@/types';

/**
 * Mock current user data for demo purposes.
 * In a real application, this would come from authentication/session context.
 * 
 * This user is:
 * - A coach assigned to teams in the 2014s age group
 * - A parent of a player (Oliver Thompson)
 * - Has access to Vale Football Club
 */
export const currentUser: User = {
  id: 'user-demo-123',
  email: 'demo.user@example.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'coach', // Can be: 'admin' | 'coach' | 'player' | 'parent' | 'fan'
  clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b', // Vale FC
  staffId: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f', // John Smith (coach)
  childrenIds: ['p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5'], // Oliver Thompson
  photo: 'https://placehold.co/150/4A90E2/FFFFFF?text=DU',
  preferences: {
    notifications: true,
    theme: 'light',
    navigationStyle: 'modern',
  },
};

/**
 * Alternative user examples for testing different scenarios:
 */

// Example: Player user
export const playerUser: User = {
  id: 'user-player-456',
  email: 'player@example.com',
  firstName: 'Oliver',
  lastName: 'Thompson',
  role: 'player',
  clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
  playerId: 'p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
  photo: 'https://placehold.co/150/4A90E2/FFFFFF?text=OT',
  preferences: {
    notifications: true,
    theme: 'light',
    navigationStyle: 'modern',
  },
};

// Example: Parent user
export const parentUser: User = {
  id: 'user-parent-789',
  email: 'parent@example.com',
  firstName: 'Sarah',
  lastName: 'Thompson',
  role: 'parent',
  clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
  childrenIds: ['p9a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', 'p10b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d'],
  photo: 'https://placehold.co/150/4A90E2/FFFFFF?text=ST',
  preferences: {
    notifications: true,
    theme: 'light',
    navigationStyle: 'modern',
  },
};

// Example: Fan user
export const fanUser: User = {
  id: 'user-fan-101',
  email: 'fan@example.com',
  firstName: 'Mike',
  lastName: 'Anderson',
  role: 'fan',
  clubId: '8f4e9a2b-1c3d-4e5f-6a7b-8c9d0e1f2a3b',
  photo: 'https://placehold.co/150/4A90E2/FFFFFF?text=MA',
  preferences: {
    notifications: true,
    theme: 'light',
    navigationStyle: 'modern',
  },
};
