/**
 * User API Client
 * 
 * Provides API calls for user profile operations.
 */

import { apiClient, UserProfile } from './client';

export type { UserProfile };

/**
 * Get current authenticated user's profile
 * @returns Current user's profile information
 */
export async function getCurrentUser(): Promise<UserProfile> {
  console.log('getCurrentUser: Making request to /api/v1/users/me');
  
  try {
    const result = await apiClient.users.getCurrentUser();
    console.log('getCurrentUser: Result:', result);
    
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to fetch current user');
    }

    return result.data;
  } catch (error) {
    console.error('getCurrentUser: Error:', error);
    throw error;
  }
}