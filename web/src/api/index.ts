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
  ClubDetailDto,
  ClubColorsDto,
  ClubLocationDto,
  ClubStatisticsDto,
  MatchSummaryDto,
  MatchScoreDto,
  AgeGroupListDto,
  AgeGroupDetailDto,
  AgeGroupStatisticsDto,
  AgeGroupPerformerDto,
  TeamWithStatsDto,
  TeamStatsDto,
} from './client';

// React hooks
export {
  useMyTeams,
  useMyChildren,
  useClubById,
  useClubStatistics,
  useAgeGroupsByClubId,
  useAgeGroupStatistics,
} from './hooks';

// User API
export { getCurrentUser } from './users';
export type { UserProfile as UserProfileType } from './users';
