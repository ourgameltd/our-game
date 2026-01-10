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
  AgeGroupDto,
  ClubSummaryDto,
  ApiResponse,
} from './client';

// React hooks
export {
  useClubs,
  useClub,
  useAgeGroups,
  useTeam,
  useTeamSquad,
  usePlayer,
  usePlayerAttributes,
  useMatch,
  useMatchLineup,
} from './hooks';
