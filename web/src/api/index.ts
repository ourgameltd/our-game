/**
 * OurGame API
 * 
 * Export all API client functionality from a single entry point.
 * 
 * Usage:
 * ```typescript
 * import { apiClient, useClub, useTeam } from '@/api';
 * ```
 */

// Client and types
export { apiClient, getApiBaseUrl } from './client';
export type {
  ClubDetailDto,
  TeamDetailDto,
  PlayerProfileDto,
  PlayerAttributesDto,
  MatchDto,
  MatchLineupDto,
  AgeGroupListItemDto,
  CoordinatorDto,
  ClubSummaryDto,
  ApiResponse,
} from './client';

// React hooks
export {
  useClubs,
  useClub,
  useClubAgeGroups,
  useAgeGroups,
  useTeam,
  useTeamSquad,
  usePlayer,
  usePlayerAttributes,
  useMatch,
  useMatchLineup,
} from './hooks';
