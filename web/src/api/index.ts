/**
 * OurGame API
 * 
 * Export all API client functionality from a single entry point.
 * 
 * Usage:
 * ```typescript
 * import { apiClient, useMyTeams } from '@/api';
 * ```
 */

// Client and types
export { apiClient, getApiBaseUrl } from './client';
export type {
  ApiResponse,
  UserProfile,
  TeamListItemDto,
  TeamColorsDto,
  TeamClubDto,
  TeamCoachDto,
} from './client';

// React hooks
export {
  useMyTeams,
} from './hooks';

// User API
export { getCurrentUser } from './users';
export type { UserProfile as UserProfileType } from './users';
