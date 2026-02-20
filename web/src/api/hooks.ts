/**
 * React hooks for OurGame API data fetching
 * 
 * These hooks provide a simple way to fetch data from the API with
 * loading states, error handling, and automatic refetching.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  ApiResponse,
  UserProfile,
  MyClubListItemDto,
  TeamListItemDto,
  TeamOverviewDto,
  TeamOverviewTeamDto,
  TeamWithStatsDto,
  ChildPlayerDto,
  ClubDetailDto,
  ClubStatisticsDto,
  AgeGroupListDto,
  AgeGroupDetailDto,
  AgeGroupStatisticsDto,
  AgeGroupPlayerDto,
  ClubPlayerDto,
  ClubTeamDto,
  ClubCoachDto,
  ClubTrainingSessionDto,
  ClubMatchesDto,
  ClubKitDto,
  ClubReportCardDto,
  ClubDevelopmentPlanDto,
  AgeGroupDevelopmentPlanSummaryDto,
  TeamDevelopmentPlanDto,
  TacticsByScopeResponseDto,
  DrillsByScopeResponseDto,
  DrillTemplatesByScopeResponseDto,
  DrillDetailDto,
  DrillTemplateDetailDto,
  CreateDrillRequest,
  UpdateDrillRequest,
  CreateDrillTemplateRequest,
  UpdateDrillTemplateRequest,
  PlayerDto,
  CoachDetailDto,
  DevelopmentPlanDetailDto,
  MatchDetailDto,
  TeamPlayerDto,
  TeamCoachDto,
  TeamMatchesDto,
  TeamTrainingSessionsDto,
  UpdateAgeGroupRequest,
  UpdatePlayerRequest,
  UpdateClubRequest,
  CreateMatchRequest,
  UpdateMatchRequest,
  CreateTeamRequest,
  UpdateTeamRequest,
  TacticDetailDto,
  CreateTacticRequest,
  UpdateTacticRequest,
  TrainingSessionDetailDto,
  CreateTrainingSessionRequest,
  UpdateTrainingSessionRequest,
  UpdateCoachRequest,
  PlayerAbilitiesDto,
  PlayerAbilityEvaluationDto,
  CreatePlayerAbilityEvaluationRequest,
  UpdatePlayerAbilityEvaluationRequest,
  PlayerRecentPerformanceDto,
  PlayerUpcomingMatchDto,
  PlayerReportSummaryDto,
  ReportCardDto,
  AssignTeamCoachRequest,
  UpdateTeamCoachRoleRequest,
  TeamKitsDto,
  TeamKitDto,
  CreateTeamKitRequest,
  UpdateTeamKitRequest,
} from './client';
import { TrainingSession, PlayerImage } from '@/types';

/**
 * Validates if an ID is valid for API calls.
 * Returns false for:
 * - undefined, null, or empty string
 * - String literals "undefined" or "null"
 * - Non-UUID format (basic check)
 */
function isValidId(id: string | undefined): id is string {
  if (!id || id === '' || id === 'undefined' || id === 'null') {
    return false;
  }
  // Basic UUID format check (allows both with and without dashes)
  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Generic hook state
interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Mutation error with validation details
export interface ApiError {
  message: string;
  statusCode?: number;
  validationErrors?: Record<string, string[]>;
}

// Generic mutation hook state
export interface UseMutationState<TData> {
  data: TData | null;
  isSubmitting: boolean;
  error: ApiError | null;
}

// Player album data with transformed photos
export interface PlayerAlbumData {
  playerId: string;
  playerName: string;
  photos: (PlayerImage & { thumbnail: string })[];
}

/**
 * Generic hook for API calls with loading/error states
 * @param fetchFn - Function to fetch data from API
 * @param dependencies - Dependencies array for useCallback
 * @param enabled - Whether to actually make the API call (defaults to true)
 */
function useApiCall<T>(
  fetchFn: () => Promise<{ data?: T; success?: boolean; statusCode?: number; error?: { message?: string } }>,
  dependencies: unknown[] = [],
  enabled: boolean = true
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      if (response.success && response.data) {
        setData(response.data);
      } else if (!response.success) {
        const error = new Error(response.error?.message || 'Request failed');
        (error as any).statusCode = response.statusCode;
        setError(error);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [...dependencies, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// ============================================================
// Team Hooks
// ============================================================

/**
 * Hook to fetch teams for the current authenticated user
 */
export function useMyTeams(): UseApiState<TeamListItemDto[]> {
  return useApiCall<TeamListItemDto[]>(
    () => apiClient.teams.getMyTeams(),
    []
  );
}

/**
 * Hook to fetch team players
 */
export function useTeamPlayers(teamId: string | undefined, includeArchived?: boolean): UseApiState<TeamPlayerDto[]> {
  return useApiCall<TeamPlayerDto[]>(
    () => apiClient.teams.getPlayers(teamId!, includeArchived),
    [teamId, includeArchived],
    isValidId(teamId)
  );
}

/**
 * Hook to fetch team coaches
 */
export function useTeamCoaches(teamId: string | undefined): UseApiState<TeamCoachDto[]> {
  return useApiCall<TeamCoachDto[]>(
    () => apiClient.teams.getCoaches(teamId!),
    [teamId],
    isValidId(teamId)
  );
}

/**
 * Hook to fetch development plans for a team
 */
export function useTeamDevelopmentPlans(teamId: string | undefined): UseApiState<TeamDevelopmentPlanDto[]> {
  return useApiCall<TeamDevelopmentPlanDto[]>(
    () => apiClient.teams.getDevelopmentPlans(teamId!),
    [teamId],
    isValidId(teamId)
  );
}

/**
 * Hook to fetch matches for a team with optional filtering
 */
export function useTeamMatches(
  teamId: string | undefined,
  options?: { status?: string; dateFrom?: string; dateTo?: string }
): UseApiState<TeamMatchesDto> {
  return useApiCall<TeamMatchesDto>(
    () => apiClient.teams.getMatches(teamId!, options),
    [teamId, options?.status, options?.dateFrom, options?.dateTo],
    isValidId(teamId)
  );
}

/**
 * Hook to fetch training sessions for a team with optional filtering
 */
export function useTeamTrainingSessions(
  teamId: string | undefined,
  options?: { status?: string; dateFrom?: string; dateTo?: string }
): UseApiState<TeamTrainingSessionsDto> {
  return useApiCall<TeamTrainingSessionsDto>(
    () => apiClient.teams.getTrainingSessions(teamId!, options),
    [teamId, options?.status, options?.dateFrom, options?.dateTo],
    isValidId(teamId)
  );
}

/**
 * Hook to fetch kits for a team
 */
export function useTeamKits(teamId: string | undefined): UseApiState<TeamKitsDto> {
  return useApiCall<TeamKitsDto>(
    () => apiClient.teams.getKits(teamId!),
    [teamId],
    isValidId(teamId)
  );
}

/**
 * Hook to fetch report cards for a team
 */
export function useTeamReportCards(teamId: string | undefined): UseApiState<ClubReportCardDto[]> {
  return useApiCall<ClubReportCardDto[]>(
    () => apiClient.teams.getReportCards(teamId!),
    [teamId],
    isValidId(teamId)
  );
}

/**
 * Hook to fetch team overview data.
 * Returns early with null data when teamId is undefined (e.g. create mode).
 */
export function useTeamOverview(teamId: string | undefined): UseApiState<TeamOverviewDto> {
  return useApiCall<TeamOverviewDto>(
    () => apiClient.teams.getOverview(teamId!),
    [teamId],
    isValidId(teamId)
  );
}

/**
 * Hook to fetch teams by age group ID with statistics
 */
export function useTeamsByAgeGroupId(ageGroupId: string | undefined): UseApiState<TeamWithStatsDto[]> {
  return useApiCall<TeamWithStatsDto[]>(
    () => apiClient.teams.getByAgeGroupId(ageGroupId!),
    [ageGroupId],
    isValidId(ageGroupId)
  );
}

// ============================================================
// User Hooks
// ============================================================

/**
 * Hook to fetch the current authenticated user's profile
 */
export function useCurrentUser(): UseApiState<UserProfile> {
  return useApiCall<UserProfile>(
    () => apiClient.users.getCurrentUser(),
    []
  );
}

/**
 * Hook to fetch clubs for the current authenticated user
 */
export function useMyClubs(): UseApiState<MyClubListItemDto[]> {
  return useApiCall<MyClubListItemDto[]>(
    () => apiClient.users.getMyClubs(),
    []
  );
}

/**
 * Hook to fetch children players for the current authenticated parent user
 */
export function useMyChildren(): UseApiState<ChildPlayerDto[]> {
  return useApiCall<ChildPlayerDto[]>(
    () => apiClient.users.getMyChildren(),
    []
  );
}

// ============================================================
// Club Hooks
// ============================================================

/**
 * Hook to fetch club details by ID
 */
export function useClubById(clubId: string | undefined): UseApiState<ClubDetailDto> {
  return useApiCall<ClubDetailDto>(
    () => apiClient.clubs.getClubById(clubId!),
    [clubId],
    isValidId(clubId)
  );
}

/** * Alias for useClubById for backward compatibility
 */
export function useClub(clubId: string | undefined): UseApiState<ClubDetailDto> {
  return useClubById(clubId);
}

/**
 * Hook to fetch club statistics
 */
export function useClubStatistics(clubId: string | undefined): UseApiState<ClubStatisticsDto> {
  return useApiCall<ClubStatisticsDto>(
    () => apiClient.clubs.getClubStatistics(clubId!),
    [clubId],
    isValidId(clubId)
  );
}

/**
 * Hook to fetch age groups by club ID
 */
export function useAgeGroupsByClubId(
  clubId: string | undefined,
  includeArchived: boolean = false
): UseApiState<AgeGroupListDto[]> {
  return useApiCall<AgeGroupListDto[]>(
    () => apiClient.clubs.getAgeGroups(clubId!, includeArchived),
    [clubId, includeArchived],
    isValidId(clubId)
  );
}

// ============================================================
// Age Group Hooks
// ============================================================

/**
 * Hook to fetch age group details by ID
 */
export function useAgeGroup(ageGroupId: string | undefined): UseApiState<AgeGroupDetailDto> {
  return useApiCall<AgeGroupDetailDto>(
    () => apiClient.ageGroups.getById(ageGroupId!),
    [ageGroupId],
    isValidId(ageGroupId)
  );
}

/**
 * Alias for useAgeGroup for backward compatibility
 */
export function useAgeGroupById(ageGroupId: string | undefined): UseApiState<AgeGroupDetailDto> {
  return useAgeGroup(ageGroupId);
}

/**
 * Hook to fetch age group statistics
 */
export function useAgeGroupStatistics(ageGroupId: string | undefined): UseApiState<AgeGroupStatisticsDto> {
  return useApiCall<AgeGroupStatisticsDto>(
    () => apiClient.ageGroups.getStatistics(ageGroupId!),
    [ageGroupId],
    isValidId(ageGroupId)
  );
}

/**
 * Hook to fetch players for an age group
 */
export function useAgeGroupPlayers(
  ageGroupId: string | undefined,
  includeArchived: boolean = false
): UseApiState<AgeGroupPlayerDto[]> {
  return useApiCall<AgeGroupPlayerDto[]>(
    () => apiClient.ageGroups.getPlayers(ageGroupId!, includeArchived),
    [ageGroupId, includeArchived],
    isValidId(ageGroupId)
  );
}

/**
 * Hook to fetch report cards for an age group
 */
export function useAgeGroupReportCards(ageGroupId: string | undefined): UseApiState<ClubReportCardDto[]> {
  return useApiCall<ClubReportCardDto[]>(
    () => apiClient.ageGroups.getReportCards(ageGroupId!),
    [ageGroupId],
    isValidId(ageGroupId)
  );
}

/**
 * Hook to fetch development plans for an age group
 */
export function useAgeGroupDevelopmentPlans(ageGroupId: string | undefined): UseApiState<AgeGroupDevelopmentPlanSummaryDto[]> {
  return useApiCall<AgeGroupDevelopmentPlanSummaryDto[]>(
    () => apiClient.ageGroups.getDevelopmentPlans(ageGroupId!),
    [ageGroupId],
    isValidId(ageGroupId)
  );
}

// ============================================================
// Club Players Hooks
// ============================================================

/**
 * Hook to fetch all players for a club
 */
export function useClubPlayers(
  clubId: string | undefined,
  includeArchived: boolean = false
): UseApiState<ClubPlayerDto[]> {
  return useApiCall<ClubPlayerDto[]>(
    () => apiClient.clubs.getPlayers(clubId!, includeArchived),
    [clubId, includeArchived],
    isValidId(clubId)
  );
}

/**
 * Hook to fetch all teams for a club
 */
export function useClubTeams(
  clubId: string | undefined,
  includeArchived: boolean = false
): UseApiState<ClubTeamDto[]> {
  return useApiCall<ClubTeamDto[]>(
    () => apiClient.clubs.getTeams(clubId!, includeArchived),
    [clubId, includeArchived],
    isValidId(clubId)
  );
}

/**
 * Hook to fetch all coaches for a club
 */
export function useClubCoaches(
  clubId: string | undefined,
  includeArchived: boolean = false
): UseApiState<ClubCoachDto[]> {
  return useApiCall<ClubCoachDto[]>(
    () => apiClient.clubs.getCoaches(clubId!, includeArchived),
    [clubId, includeArchived],
    isValidId(clubId)
  );
}

/**
 * Hook to fetch training sessions for a club with optional filtering
 * Returns ClubTrainingSessionDto directly as it includes team and age group metadata
 */
export function useClubTrainingSessions(
  clubId: string | undefined,
  options?: { ageGroupId?: string; teamId?: string; status?: 'upcoming' | 'past' | 'all' }
): UseApiState<{ sessions: ClubTrainingSessionDto[]; totalCount: number }> {
  return useApiCall<{ sessions: ClubTrainingSessionDto[]; totalCount: number }>(
    () => apiClient.clubs.getTrainingSessions(clubId!, options),
    [clubId, options?.ageGroupId, options?.teamId, options?.status],
    isValidId(clubId)
  );
}

/**
 * Hook to fetch matches for a club with optional filtering
 */
export function useClubMatches(
  clubId: string | undefined,
  options?: { ageGroupId?: string; teamId?: string; status?: 'upcoming' | 'past' | 'scheduled' | 'completed' | 'cancelled' | 'all' }
): UseApiState<ClubMatchesDto> {
  return useApiCall<ClubMatchesDto>(
    () => apiClient.clubs.getMatches(clubId!, options),
    [clubId, options?.ageGroupId, options?.teamId, options?.status],
    isValidId(clubId)
  );
}

/**
 * Hook to fetch kits for a club
 */
export function useClubKits(clubId: string | undefined): UseApiState<ClubKitDto[]> {
  return useApiCall<ClubKitDto[]>(
    () => apiClient.clubs.getKits(clubId!),
    [clubId],
    isValidId(clubId)
  );
}

/**
 * Hook to fetch report cards for a club
 */
export function useClubReportCards(clubId: string | undefined): UseApiState<ClubReportCardDto[]> {
  return useApiCall<ClubReportCardDto[]>(
    () => apiClient.clubs.getReportCards(clubId!),
    [clubId],
    isValidId(clubId)
  );
}

/**
 * Hook to fetch development plans for a club
 */
export function useClubDevelopmentPlans(clubId: string | undefined): UseApiState<ClubDevelopmentPlanDto[]> {
  return useApiCall<ClubDevelopmentPlanDto[]>(
    () => apiClient.clubs.getDevelopmentPlans(clubId!),
    [clubId],
    isValidId(clubId)
  );
}

// ============================================================
// Tactics Hooks
// ============================================================

/**
 * Hook to fetch tactics by scope (club, age group, or team level)
 * Automatically determines the appropriate API call based on provided IDs
 */
export function useTacticsByScope(
  clubId: string | undefined,
  ageGroupId?: string,
  teamId?: string
): UseApiState<TacticsByScopeResponseDto> {
  // Enabled when at least clubId is valid
  const enabled = isValidId(clubId);
  
  return useApiCall<TacticsByScopeResponseDto>(
    () => {
      if (teamId && ageGroupId) {
        return apiClient.tactics.getByTeam(clubId!, ageGroupId, teamId);
      }
      if (ageGroupId) {
        return apiClient.tactics.getByAgeGroup(clubId!, ageGroupId);
      }
      return apiClient.tactics.getByClub(clubId!);
    },
    [clubId, ageGroupId, teamId],
    enabled
  );
}

// ============================================================
// Drills Hooks
// ============================================================

/**
 * Hook to fetch drills by scope (club, age group, or team level)
 * Automatically determines the appropriate API call based on provided IDs
 */
export function useDrillsByScope(
  clubId: string | undefined,
  ageGroupId?: string,
  teamId?: string,
  options?: { category?: string; search?: string }
): UseApiState<DrillsByScopeResponseDto> {
  // Enabled when at least clubId is valid
  const enabled = isValidId(clubId);
  
  return useApiCall<DrillsByScopeResponseDto>(
    () => {
      if (teamId && ageGroupId) {
        return apiClient.drills.getByTeam(clubId!, ageGroupId, teamId, options);
      }
      if (ageGroupId) {
        return apiClient.drills.getByAgeGroup(clubId!, ageGroupId, options);
      }
      return apiClient.drills.getByClub(clubId!, options);
    },
    [clubId, ageGroupId, teamId, options?.category, options?.search],
    enabled
  );
}

/**
 * Hook to fetch a drill by ID with full detail.
 * Only fetches if drillId is defined.
 */
export function useDrill(drillId: string | undefined): UseApiState<DrillDetailDto> {
  return useApiCall<DrillDetailDto>(
    () => apiClient.drills.getById(drillId!),
    [drillId],
    isValidId(drillId)
  );
}

/**
 * Hook to create a drill.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useCreateDrill(): UseMutationState<DrillDetailDto> & {
  mutate: (request: CreateDrillRequest) => Promise<void>;
} {
  const [data, setData] = useState<DrillDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (request: CreateDrillRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<DrillDetailDto> = await apiClient.drills.create(request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to create drill',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { mutate, isSubmitting: isSubmitting, data, error };
}

/**
 * Hook to update a drill.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateDrill(drillId: string): UseMutationState<DrillDetailDto> & {
  mutate: (request: UpdateDrillRequest) => Promise<void>;
} {
  const [data, setData] = useState<DrillDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (request: UpdateDrillRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<DrillDetailDto> = await apiClient.drills.update(drillId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update drill',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [drillId]);

  return { mutate, isSubmitting: isSubmitting, data, error };
}

// ============================================================
// Drill Templates Hooks
// ============================================================

/**
 * Hook to fetch drill templates by scope (club, age group, or team level)
 * Automatically determines the appropriate API call based on provided IDs
 */
export function useDrillTemplatesByScope(
  clubId: string | undefined,
  ageGroupId?: string,
  teamId?: string,
  options?: { category?: string; search?: string; attributes?: string[] }
): UseApiState<DrillTemplatesByScopeResponseDto> {
  // Enabled when at least clubId is valid
  const enabled = isValidId(clubId);
  
  return useApiCall<DrillTemplatesByScopeResponseDto>(
    () => {
      if (teamId && ageGroupId) {
        return apiClient.drillTemplates.getByTeam(clubId!, ageGroupId, teamId, options);
      }
      if (ageGroupId) {
        return apiClient.drillTemplates.getByAgeGroup(clubId!, ageGroupId, options);
      }
      return apiClient.drillTemplates.getByClub(clubId!, options);
    },
    [clubId, ageGroupId, teamId, options?.category, options?.search, options?.attributes?.join(',')],
    enabled
  );
}

/**
 * Hook to fetch a drill template by ID with full detail.
 * Only fetches if templateId is defined.
 */
export function useDrillTemplateById(templateId: string | undefined): UseApiState<DrillTemplateDetailDto> {
  return useApiCall<DrillTemplateDetailDto>(
    () => apiClient.drillTemplates.getById(templateId!),
    [templateId],
    isValidId(templateId)
  );
}

/**
 * Hook to create a drill template.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useCreateDrillTemplate(): UseMutationState<DrillTemplateDetailDto> & {
  mutate: (request: CreateDrillTemplateRequest) => Promise<void>;
} {
  const [data, setData] = useState<DrillTemplateDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (request: CreateDrillTemplateRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<DrillTemplateDetailDto> = await apiClient.drillTemplates.create(request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to create drill template',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { mutate, isSubmitting: isSubmitting, data, error };
}

/**
 * Hook to update a drill template.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateDrillTemplate(templateId: string): UseMutationState<DrillTemplateDetailDto> & {
  mutate: (request: UpdateDrillTemplateRequest) => Promise<void>;
} {
  const [data, setData] = useState<DrillTemplateDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (request: UpdateDrillTemplateRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<DrillTemplateDetailDto> = await apiClient.drillTemplates.update(templateId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update drill template',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [templateId]);

  return { mutate, isSubmitting: isSubmitting, data, error };
}

// ============================================================
// Player Hooks
// ============================================================

/**
 * Hook to fetch a player by ID.
 * Only fetches if playerId is defined.
 */
export function usePlayer(playerId: string | undefined): UseApiState<PlayerDto> {
  return useApiCall<PlayerDto>(
    () => apiClient.players.getById(playerId!),
    [playerId],
    isValidId(playerId)
  );
}

/**
 * Hook to fetch player abilities with attributes and evaluation history.
 * Only fetches if playerId is defined.
 */
export function usePlayerAbilities(playerId: string | undefined): UseApiState<PlayerAbilitiesDto> {
  return useApiCall<PlayerAbilitiesDto>(
    () => apiClient.players.getAbilities(playerId!),
    [playerId],
    isValidId(playerId)
  );
}

/**
 * Hook to create a player ability evaluation.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useCreatePlayerAbilityEvaluation(playerId: string): UseMutationState<PlayerAbilityEvaluationDto> & {
  mutate: (request: CreatePlayerAbilityEvaluationRequest) => Promise<void>;
} {
  const [data, setData] = useState<PlayerAbilityEvaluationDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (request: CreatePlayerAbilityEvaluationRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<PlayerAbilityEvaluationDto> = await apiClient.players.createAbilityEvaluation(playerId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to create ability evaluation',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [playerId]);

  return { mutate, isSubmitting, data, error };
}

/**
 * Hook to update a player ability evaluation.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdatePlayerAbilityEvaluation(
  playerId: string,
  evaluationId: string
): UseMutationState<PlayerAbilityEvaluationDto> & {
  mutate: (request: UpdatePlayerAbilityEvaluationRequest) => Promise<void>;
} {
  const [data, setData] = useState<PlayerAbilityEvaluationDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (request: UpdatePlayerAbilityEvaluationRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<PlayerAbilityEvaluationDto> = await apiClient.players.updateAbilityEvaluation(
        playerId,
        evaluationId,
        request
      );
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update ability evaluation',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [playerId, evaluationId]);

  return { mutate, isSubmitting, data, error };
}

/**
 * Hook to delete a player ability evaluation.
 * Returns a mutation function, submitting state, and error.
 */
export function useDeletePlayerAbilityEvaluation(
  playerId: string,
  evaluationId: string
): UseMutationState<void> & {
  mutate: () => Promise<void>;
} {
  const [data, setData] = useState<void | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      await apiClient.players.deleteAbilityEvaluation(playerId, evaluationId);
      setData(undefined);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to delete ability evaluation',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [playerId, evaluationId]);

  return { mutate, isSubmitting, data, error };
}

/**
 * Hook to fetch recent performance data for a player.
 * Only fetches if playerId is defined.
 */
export function usePlayerRecentPerformances(
  playerId: string | undefined,
  limit?: number
): UseApiState<PlayerRecentPerformanceDto[]> {
  return useApiCall<PlayerRecentPerformanceDto[]>(
    () => apiClient.players.getRecentPerformances(playerId!, limit),
    [playerId, limit],
    isValidId(playerId)
  );
}

/**
 * Hook to fetch upcoming matches for a player.
 * Only fetches if playerId is defined.
 */
export function usePlayerUpcomingMatches(
  playerId: string | undefined,
  limit?: number
): UseApiState<PlayerUpcomingMatchDto[]> {
  return useApiCall<PlayerUpcomingMatchDto[]>(
    () => apiClient.players.getUpcomingMatches(playerId!, limit),
    [playerId, limit],
    isValidId(playerId)
  );
}

/**
 * Hook to fetch all report cards for a player.
 * Only fetches if playerId is defined.
 */
export function usePlayerReports(playerId: string | undefined): UseApiState<PlayerReportSummaryDto[]> {
  return useApiCall<PlayerReportSummaryDto[]>(
    () => apiClient.players.getReports(playerId!),
    [playerId],
    isValidId(playerId)
  );
}

/**
 * Hook to fetch player album with photos.
 * Transforms API response to UI-ready format with Date objects.
 * Only fetches if playerId is defined.
 */
export function usePlayerAlbum(playerId: string | undefined): UseApiState<PlayerAlbumData> {
  return useApiCall<PlayerAlbumData>(
    async () => {
      const response = await apiClient.players.getAlbum(playerId!);
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            playerId: response.data.playerId,
            playerName: response.data.playerName,
            photos: response.data.photos.map(photo => {
              // Parse date with fallback to current date if invalid
              const parsedDate = new Date(photo.date);
              const date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
              
              return {
                id: photo.id,
                url: photo.url,
                thumbnail: photo.thumbnail,
                caption: photo.caption || undefined,
                date: date,
                tags: photo.tags || [],
                uploadedBy: undefined
              };
            })
          }
        };
      }
      return { success: false, error: { message: response.error?.message } };
    },
    [playerId],
    isValidId(playerId)
  );
}

// ============================================================
// Coach Hooks
// ============================================================

/**
 * Hook to fetch a coach by ID with full profile details.
 * Only fetches if coachId is defined.
 */
export function useCoach(coachId: string | undefined): UseApiState<CoachDetailDto> {
  return useApiCall<CoachDetailDto>(
    () => apiClient.coaches.getById(coachId!),
    [coachId],
    isValidId(coachId)
  );
}

// ============================================================
// Development Plan Hooks
// ============================================================

/**
 * Hook to fetch a development plan by ID with full detail
 */
export function useDevelopmentPlan(planId: string | undefined): UseApiState<DevelopmentPlanDetailDto> {
  return useApiCall<DevelopmentPlanDetailDto>(
    () => apiClient.developmentPlans.getById(planId!),
    [planId],
    isValidId(planId)
  );
}

// ============================================================
// Match Hooks
// ============================================================

/**
 * Hook to fetch a match by ID.
 * Only fetches if matchId is defined and not "new".
 */
export function useMatch(matchId: string | undefined): UseApiState<MatchDetailDto> {
  // Don't fetch for "new" matches or invalid IDs
  const enabled = isValidId(matchId) && matchId !== 'new';
  
  return useApiCall<MatchDetailDto>(
    () => apiClient.matches.getById(matchId!),
    [matchId],
    enabled
  );
}

/**
 * Hook to fetch a match report by match ID with extended details.
 * Optimized for report view with coach photos, player photos, captain photo, etc.
 * Only fetches if matchId is defined.
 */
export function useMatchReport(matchId: string | undefined): UseApiState<MatchDetailDto> {
  return useApiCall<MatchDetailDto>(
    () => apiClient.matches.getReport(matchId!),
    [matchId],
    isValidId(matchId)
  );
}

// ============================================================
// Report Card Hooks
// ============================================================

/**
 * Hook to fetch a report card by ID.
 * Only fetches if reportId is defined.
 */
export function useReportCard(reportId: string | undefined): UseApiState<ReportCardDto> {
  return useApiCall<ReportCardDto>(
    () => apiClient.reports.getById(reportId!),
    [reportId],
    isValidId(reportId)
  );
}

// ============================================================
// Mutation Hooks
// ============================================================

/**
 * Hook to update a player.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdatePlayer(playerId: string): UseMutationState<PlayerDto> & {
  updatePlayer: (request: UpdatePlayerRequest) => Promise<void>;
} {
  const [data, setData] = useState<PlayerDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updatePlayer = useCallback(async (request: UpdatePlayerRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<PlayerDto> = await apiClient.players.update(playerId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update player',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [playerId]);

  return { updatePlayer, isSubmitting, data, error };
}

/**
 * Hook to update an age group.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateAgeGroup(ageGroupId: string): UseMutationState<AgeGroupDetailDto> & {
  updateAgeGroup: (request: UpdateAgeGroupRequest) => Promise<void>;
} {
  const [data, setData] = useState<AgeGroupDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateAgeGroup = useCallback(async (request: UpdateAgeGroupRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<AgeGroupDetailDto> = await apiClient.ageGroups.update(ageGroupId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update age group',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [ageGroupId]);

  return { updateAgeGroup, isSubmitting, data, error };
}

/**
 * Hook to update a club.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateClub(clubId: string): UseMutationState<ClubDetailDto> & {
  updateClub: (request: UpdateClubRequest) => Promise<void>;
} {
  const [data, setData] = useState<ClubDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateClub = useCallback(async (request: UpdateClubRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<ClubDetailDto> = await apiClient.clubs.updateClub(clubId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update club',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [clubId]);

  return { updateClub, isSubmitting, data, error };
}

/**
 * Hook to create a match.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useCreateMatch(): UseMutationState<MatchDetailDto> & {
  createMatch: (request: CreateMatchRequest) => Promise<void>;
} {
  const [data, setData] = useState<MatchDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createMatch = useCallback(async (request: CreateMatchRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<MatchDetailDto> = await apiClient.matches.create(request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to create match',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createMatch, isSubmitting, data, error };
}

/**
 * Hook to update a match.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateMatch(matchId: string): UseMutationState<MatchDetailDto> & {
  updateMatch: (request: UpdateMatchRequest) => Promise<void>;
} {
  const [data, setData] = useState<MatchDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateMatch = useCallback(async (request: UpdateMatchRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<MatchDetailDto> = await apiClient.matches.update(matchId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update match',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [matchId]);

  return { updateMatch, isSubmitting, data, error };
}

// ============================================================
// Tactic Mutation Hooks
// ============================================================

/**
 * Hook to fetch a tactic by ID.
 * Only fetches if tacticId is defined.
 */
export function useTactic(tacticId: string | undefined): UseApiState<TacticDetailDto> {
  return useApiCall<TacticDetailDto>(
    () => apiClient.tactics.getById(tacticId!),
    [tacticId],
    isValidId(tacticId)
  );
}

/**
 * Hook to create a tactic.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useCreateTactic(): UseMutationState<TacticDetailDto> & {
  createTactic: (request: CreateTacticRequest) => Promise<void>;
} {
  const [data, setData] = useState<TacticDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createTactic = useCallback(async (request: CreateTacticRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TacticDetailDto> = await apiClient.tactics.create(request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to create tactic',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createTactic, isSubmitting, data, error };
}

// ============================================================
// Team Mutation Hooks
// ============================================================

/**
 * Hook to create a team.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useCreateTeam(): UseMutationState<TeamOverviewTeamDto> & {
  createTeam: (request: CreateTeamRequest) => Promise<void>;
} {
  const [data, setData] = useState<TeamOverviewTeamDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createTeam = useCallback(async (request: CreateTeamRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TeamOverviewTeamDto> = await apiClient.teams.create(request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to create team',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createTeam, isSubmitting, data, error };
}

/**
 * Hook to update a team.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateTeam(teamId: string): UseMutationState<TeamOverviewTeamDto> & {
  updateTeam: (request: UpdateTeamRequest) => Promise<void>;
} {
  const [data, setData] = useState<TeamOverviewTeamDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateTeam = useCallback(async (request: UpdateTeamRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TeamOverviewTeamDto> = await apiClient.teams.update(teamId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update team',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId]);

  return { updateTeam, isSubmitting, data, error };
}

// ============================================================
// Training Session Hooks
// ============================================================

/**
 * Hook to fetch a training session by ID.
 * Only fetches if sessionId is defined and not "new".
 * Maps API TrainingSessionDetailDto to UI TrainingSession type.
 */
export function useTrainingSession(sessionId: string | undefined): UseApiState<TrainingSession> {
  // Don't fetch for "new" sessions or invalid IDs
  const enabled = isValidId(sessionId) && sessionId !== 'new';
  
  return useApiCall<TrainingSession>(
    async () => {
      const response = await apiClient.trainingSessions.getById(sessionId!);
      if (response.success && response.data) {
        return {
          success: true,
          data: mapTrainingSessionDetailToUi(response.data)
        };
      }
      return { success: false, error: { message: response.error?.message } };
    },
    [sessionId],
    enabled
  );
}

/**
 * Helper function to map API TrainingSessionDetailDto to UI TrainingSession model
 */
function mapTrainingSessionDetailToUi(dto: TrainingSessionDetailDto): TrainingSession {
  return {
    id: dto.id,
    teamId: dto.teamId,
    date: new Date(dto.sessionDate),
    meetTime: dto.meetTime ? new Date(dto.meetTime) : undefined,
    duration: dto.durationMinutes || 0,
    location: dto.location || '',
    focusAreas: dto.focusAreas || [],
    drillIds: (dto.drills || []).map(d => d.drillId),
    sessionDrills: (dto.drills || []).map(d => ({
      drillId: d.drillId,
      source: (d.source === 'template' ? 'template' : 'adhoc') as 'template' | 'adhoc',
      templateId: d.templateId || undefined,
      order: d.order
    })),
    appliedTemplates: (dto.appliedTemplates || []).map(t => ({
      templateId: t.templateId,
      appliedAt: new Date(t.appliedAt),
      drillIds: [] // Drill IDs from applied templates are tracked in sessionDrills
    })),
    coachIds: (dto.coaches || []).map(c => c.coachId),
    attendance: (dto.attendance || []).map(att => ({
      playerId: att.playerId,
      status: att.status as 'confirmed' | 'declined' | 'maybe' | 'pending',
      notes: att.notes || undefined
    })),
    notes: dto.notes || undefined,
    status: dto.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
    isLocked: dto.isLocked || false
  };
}

/**
 * Hook to create a training session.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useCreateTrainingSession(): UseMutationState<TrainingSession> & {
  createTrainingSession: (request: CreateTrainingSessionRequest) => Promise<void>;
} {
  const [data, setData] = useState<TrainingSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createTrainingSession = useCallback(async (request: CreateTrainingSessionRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TrainingSessionDetailDto> = await apiClient.trainingSessions.create(request);
      if (response.success && response.data) {
        setData(mapTrainingSessionDetailToUi(response.data));
      } else {
        setError({
          message: response.error?.message || 'Failed to create training session',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createTrainingSession, isSubmitting, data, error };
}

/**
 * Hook to update a training session.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateTrainingSession(sessionId: string): UseMutationState<TrainingSession> & {
  updateTrainingSession: (request: UpdateTrainingSessionRequest) => Promise<void>;
} {
  const [data, setData] = useState<TrainingSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateTrainingSession = useCallback(async (request: UpdateTrainingSessionRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TrainingSessionDetailDto> = await apiClient.trainingSessions.update(sessionId, request);
      if (response.success && response.data) {
        setData(mapTrainingSessionDetailToUi(response.data));
      } else {
        setError({
          message: response.error?.message || 'Failed to update training session',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId]);

  return { updateTrainingSession, isSubmitting, data, error };
}

/**
 * Hook to update a coach.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateCoach(coachId: string): UseMutationState<CoachDetailDto> & {
  updateCoach: (request: UpdateCoachRequest) => Promise<void>;
} {
  const [data, setData] = useState<CoachDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateCoach = useCallback(async (request: UpdateCoachRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<CoachDetailDto> = await apiClient.coaches.update(coachId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update coach',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [coachId]);

  return { updateCoach, isSubmitting, data, error };
}

/**
 * Hook to update a tactic.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 */
export function useUpdateTactic(tacticId: string): UseMutationState<TacticDetailDto> & {
  updateTactic: (request: UpdateTacticRequest) => Promise<void>;
} {
  const [data, setData] = useState<TacticDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateTactic = useCallback(async (request: UpdateTacticRequest): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TacticDetailDto> = await apiClient.tactics.update(tacticId, request);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError({
          message: response.error?.message || 'Failed to update tactic',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [tacticId]);

  return { updateTactic, isSubmitting, data, error };
}

// ============================================================
// Team Coach Mutation Hooks
// ============================================================

/**
 * Hook to assign a coach to a team.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 * Automatically refetches team coaches on success.
 */
export function useAssignTeamCoach(teamId: string | undefined): UseMutationState<TeamCoachDto> & {
  assignCoach: (request: AssignTeamCoachRequest) => Promise<void>;
  refetchCoaches: () => Promise<void>;
} {
  const [data, setData] = useState<TeamCoachDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchCoaches } = useTeamCoaches(teamId);

  const assignCoach = useCallback(async (request: AssignTeamCoachRequest): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TeamCoachDto> = await apiClient.teams.assignCoach(teamId, request);
      if (response.success && response.data) {
        setData(response.data);
        // Refetch team coaches to update the list
        await refetchCoaches();
      } else {
        setError({
          message: response.error?.message || 'Failed to assign coach',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchCoaches]);

  return { assignCoach, isSubmitting, data, error, refetchCoaches };
}

/**
 * Hook to remove a coach from a team.
 * Returns a mutation function, submitting state, and error.
 * Automatically refetches team coaches on success.
 */
export function useRemoveTeamCoach(teamId: string | undefined): UseMutationState<void> & {
  removeCoach: (coachId: string) => Promise<void>;
  refetchCoaches: () => Promise<void>;
} {
  const [data, setData] = useState<void | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchCoaches } = useTeamCoaches(teamId);

  const removeCoach = useCallback(async (coachId: string): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<void> = await apiClient.teams.removeCoach(teamId, coachId);
      if (response.success || response.statusCode === 204) {
        setData(undefined);
        // Refetch team coaches to update the list
        await refetchCoaches();
      } else {
        setError({
          message: response.error?.message || 'Failed to remove coach',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchCoaches]);

  return { removeCoach, isSubmitting, data, error, refetchCoaches };
}

/**
 * Hook to update a coach's role on a team.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 * Automatically refetches team coaches on success.
 */
export function useUpdateTeamCoachRole(teamId: string | undefined, coachId: string | undefined): UseMutationState<TeamCoachDto> & {
  updateRole: (request: UpdateTeamCoachRoleRequest) => Promise<void>;
  refetchCoaches: () => Promise<void>;
} {
  const [data, setData] = useState<TeamCoachDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchCoaches } = useTeamCoaches(teamId);

  const updateRole = useCallback(async (request: UpdateTeamCoachRoleRequest): Promise<void> => {
    if (!teamId || !coachId) {
      setError({ message: 'Team ID and Coach ID are required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TeamCoachDto> = await apiClient.teams.updateCoachRole(teamId, coachId, request);
      if (response.success && response.data) {
        setData(response.data);
        // Refetch team coaches to update the list
        await refetchCoaches();
      } else {
        setError({
          message: response.error?.message || 'Failed to update coach role',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, coachId, refetchCoaches]);

  return { updateRole, isSubmitting, data, error, refetchCoaches };
}

// ============================================================
// Team Kit Mutation Hooks
// ============================================================

/**
 * Hook to create a kit for a team.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 * Automatically refetches team kits on success.
 */
export function useCreateTeamKit(teamId: string | undefined): UseMutationState<TeamKitDto> & {
  createKit: (request: CreateTeamKitRequest) => Promise<void>;
  refetchKits: () => Promise<void>;
} {
  const [data, setData] = useState<TeamKitDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchKits } = useTeamKits(teamId);

  const createKit = useCallback(async (request: CreateTeamKitRequest): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TeamKitDto> = await apiClient.teams.createKit(teamId, request);
      if (response.success && response.data) {
        setData(response.data);
        // Refetch team kits to update the list
        await refetchKits();
      } else {
        setError({
          message: response.error?.message || 'Failed to create kit',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchKits]);

  return { createKit, isSubmitting, data, error, refetchKits };
}

/**
 * Hook to update a kit for a team.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 * Automatically refetches team kits on success.
 */
export function useUpdateTeamKit(teamId: string | undefined): UseMutationState<TeamKitDto> & {
  updateKit: (kitId: string, request: UpdateTeamKitRequest) => Promise<void>;
  refetchKits: () => Promise<void>;
} {
  const [data, setData] = useState<TeamKitDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchKits } = useTeamKits(teamId);

  const updateKit = useCallback(async (kitId: string, request: UpdateTeamKitRequest): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<TeamKitDto> = await apiClient.teams.updateKit(teamId, kitId, request);
      if (response.success && response.data) {
        setData(response.data);
        // Refetch team kits to update the list
        await refetchKits();
      } else {
        setError({
          message: response.error?.message || 'Failed to update kit',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchKits]);

  return { updateKit, isSubmitting, data, error, refetchKits };
}

/**
 * Hook to delete a kit for a team.
 * Returns a mutation function, submitting state, and error.
 * Automatically refetches team kits on success.
 */
export function useDeleteTeamKit(teamId: string | undefined): UseMutationState<void> & {
  deleteKit: (kitId: string) => Promise<void>;
  refetchKits: () => Promise<void>;
} {
  const [data, setData] = useState<void | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchKits } = useTeamKits(teamId);

  const deleteKit = useCallback(async (kitId: string): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<void> = await apiClient.teams.deleteKit(teamId, kitId);
      if (response.success || response.statusCode === 204) {
        setData(undefined);
        // Refetch team kits to update the list
        await refetchKits();
      } else {
        setError({
          message: response.error?.message || 'Failed to delete kit',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchKits]);

  return { deleteKit, isSubmitting, data, error, refetchKits };
}

// ============================================================
// Team Player Mutation Hooks
// ============================================================

/**
 * Hook to add a player to a team.
 * Returns a mutation function, submitting state, response data, and error
 * with validation details preserved for field-level error mapping.
 * Automatically refetches team players on success.
 */
export function useAddTeamPlayer(teamId: string | undefined): UseMutationState<import('./client').AddPlayerToTeamResult> & {
  addPlayer: (request: import('./client').AddPlayerToTeamRequest) => Promise<void>;
  refetchPlayers: () => Promise<void>;
} {
  const [data, setData] = useState<import('./client').AddPlayerToTeamResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchPlayers } = useTeamPlayers(teamId);

  const addPlayer = useCallback(async (request: import('./client').AddPlayerToTeamRequest): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<import('./client').AddPlayerToTeamResult> = await apiClient.teams.addPlayer(teamId, request);
      if (response.success && response.data) {
        setData(response.data);
        // Refetch team players to update the list
        await refetchPlayers();
      } else {
        setError({
          message: response.error?.message || 'Failed to add player to team',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchPlayers]);

  return { addPlayer, isSubmitting, data, error, refetchPlayers };
}

/**
 * Hook to remove a player from a team.
 * Returns a mutation function, submitting state, and error.
 * Automatically refetches team players on success.
 */
export function useRemoveTeamPlayer(teamId: string | undefined): UseMutationState<void> & {
  removePlayer: (playerId: string) => Promise<void>;
  refetchPlayers: () => Promise<void>;
} {
  const [data, setData] = useState<void | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchPlayers } = useTeamPlayers(teamId);

  const removePlayer = useCallback(async (playerId: string): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<void> = await apiClient.teams.removePlayer(teamId, playerId);
      if (response.success || response.statusCode === 204) {
        setData(undefined);
        // Refetch team players to update the list
        await refetchPlayers();
      } else {
        setError({
          message: response.error?.message || 'Failed to remove player from team',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchPlayers]);

  return { removePlayer, isSubmitting, data, error, refetchPlayers };
}

/**
 * Hook to update a player's squad number on a team.
 * Returns a mutation function, submitting state, and error.
 * Automatically refetches team players on success.
 */
export function useUpdateTeamPlayerSquadNumber(teamId: string | undefined): UseMutationState<void> & {
  updateSquadNumber: (playerId: string, request: import('./client').UpdateSquadNumberRequest) => Promise<void>;
  refetchPlayers: () => Promise<void>;
} {
  const [data, setData] = useState<void | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchPlayers } = useTeamPlayers(teamId);

  const updateSquadNumber = useCallback(async (playerId: string, request: import('./client').UpdateSquadNumberRequest): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<void> = await apiClient.teams.updatePlayerSquadNumber(teamId, playerId, request);
      if (response.success || response.statusCode === 204) {
        setData(undefined);
        // Refetch team players to update the list
        await refetchPlayers();
      } else {
        setError({
          message: response.error?.message || 'Failed to update squad number',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchPlayers]);

  return { updateSquadNumber, isSubmitting, data, error, refetchPlayers };
}

/**
 * Hook to update squad numbers for multiple players in a team.
 * Returns a mutation function, submitting state, and error.
 * Automatically refetches team players on success.
 */
export function useUpdateTeamSquadNumbers(teamId: string | undefined): UseMutationState<void> & {
  updateSquadNumbers: (request: import('./client').UpdateSquadNumbersRequest) => Promise<void>;
  refetchPlayers: () => Promise<void>;
} {
  const [data, setData] = useState<void | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { refetch: refetchPlayers } = useTeamPlayers(teamId);

  const updateSquadNumbers = useCallback(async (request: import('./client').UpdateSquadNumbersRequest): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<void> = await apiClient.teams.updateSquadNumbers(teamId, request);
      if (response.success || response.statusCode === 200) {
        setData(undefined);
        // Refetch team players to update the list
        await refetchPlayers();
      } else {
        setError({
          message: response.error?.message || 'Failed to update squad numbers',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId, refetchPlayers]);

  return { updateSquadNumbers, isSubmitting, data, error, refetchPlayers };
}

/**
 * Hook to archive or unarchive a team.
 * Returns a mutation function, submitting state, and error.
 */
export function useArchiveTeam(teamId: string | undefined): UseMutationState<void> & {
  archiveTeam: (request: import('./client').ArchiveTeamRequest) => Promise<void>;
} {
  const [data, setData] = useState<void | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const archiveTeam = useCallback(async (request: import('./client').ArchiveTeamRequest): Promise<void> => {
    if (!teamId) {
      setError({ message: 'Team ID is required' });
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setData(null);
    try {
      const response: ApiResponse<void> = await apiClient.teams.archive(teamId, request);
      if (response.success || response.statusCode === 204) {
        setData(undefined);
      } else {
        setError({
          message: response.error?.message || 'Failed to update team archive status',
          statusCode: response.error?.statusCode,
          validationErrors: response.error?.validationErrors,
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [teamId]);

  return { archiveTeam, isSubmitting, data, error };
}

