/**
 * User API Client
 * 
 * Provides API calls for user profile operations.
 */

import { apiClient, UserProfile, UpdateCurrentUserRequest } from './client';

export type { UserProfile, UpdateCurrentUserRequest };

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

/**
 * Update current authenticated user's profile
 * @param request - Profile update data
 * @returns Updated user profile
 */
export async function updateCurrentUser(request: UpdateCurrentUserRequest): Promise<UserProfile> {
  const response = await apiClient.users.updateCurrentUser(request);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to update profile');
  }
  return response.data!;
}