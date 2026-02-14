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
  UpdateAgeGroupRequest,
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
  AgeGroupDevelopmentPlanSummaryDto,
  AgeGroupDevelopmentPlanPlayerDto,
  AgeGroupDevelopmentPlanGoalSummaryDto,
  AgeGroupDevelopmentPlanPeriodDto,
  DevelopmentPlanDto,
  DevelopmentGoalDto,
  CreateDevelopmentPlanRequest,
  CreateDevelopmentGoalRequest,
  UpdateDevelopmentPlanRequest,
  UpdateDevelopmentGoalRequest,
  PlayerDto,
  PlayerTeamMinimalDto,
  UpdatePlayerRequest,
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
  useAgeGroupDevelopmentPlans,
  useTacticsByScope,
  useDrillsByScope,
  useDrillTemplatesByScope,
  usePlayer,
  useDevelopmentPlan,
  useUpdateAgeGroup,
  useUpdatePlayer,
} from './hooks';
export type { ApiError, UseMutationState } from './hooks';

// User API
export { getCurrentUser } from './users';
export type { UserProfile as UserProfileType } from './users';
