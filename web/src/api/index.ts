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
  AgeGroupCoachDto,
  AgeGroupCoachTeamDto,
  TeamWithStatsDto,
  TeamStatsDto,
  TeamOverviewDto,
  TeamOverviewTeamDto,
  TeamOverviewStatisticsDto,
  TeamMatchSummaryDto,
  TeamPerformerDto,
  TeamTrainingSessionDto,
  ClubPlayerDto,
  ClubPlayerAgeGroupDto,
  ClubPlayerTeamDto,
  ClubTeamDto,
  ClubTeamColorsDto,
  ClubCoachDto,
  ClubCoachTeamDto,
  ClubTrainingSessionDto,
  ClubTrainingSessionsDto,
  ClubMatchDto,
  ClubMatchesDto,
  ClubKitDto,
  ClubReportCardDto,
  ClubReportCardPlayerDto,
  ClubReportCardPeriodDto,
  ClubReportCardDevelopmentActionDto,
  ClubReportCardSimilarProfessionalDto,
  TacticScopeDto,
  TacticListDto,
  TacticsByScopeResponseDto,
  DrillLinkDto,
  DrillListDto,
  DrillsByScopeResponseDto,
  DrillTemplateListDto,
  DrillTemplatesByScopeResponseDto,
  ClubDevelopmentPlanDto,
  ClubDevelopmentPlanPlayerDto,
  ClubDevelopmentPlanGoalDto,
  ClubDevelopmentPlanPeriodDto,
  DevelopmentPlanDto,
  DevelopmentGoalDto,
  CreateDevelopmentPlanRequest,
  CreateDevelopmentGoalRequest,
  UpdateDevelopmentPlanRequest,
  UpdateDevelopmentGoalRequest,
  PlayerDto,
} from './client';

// React hooks
export {
  useMyTeams,
  useTeamOverview,
  useTeamsByAgeGroupId,
  useMyChildren,
  useClubById,
  useClubStatistics,
  useAgeGroupsByClubId,
  useAgeGroupById,
  useAgeGroupStatistics,
  useClubPlayers,
  useClubTeams,
  useClubCoaches,
  useClubTrainingSessions,
  useClubMatches,
  useClubKits,
  useClubReportCards,
  useClubDevelopmentPlans,
  useTacticsByScope,
  useDrillsByScope,
  useDrillTemplatesByScope,
  usePlayer,
  useDevelopmentPlan,
} from './hooks';

// User API
export { getCurrentUser } from './users';
export type { UserProfile as UserProfileType } from './users';
