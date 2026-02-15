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
  DevelopmentPlanDto,
  MatchDetailDto,
  TeamPlayerDto,
  TeamCoachDto,
  TeamMatchesDto,
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
} from './client';
import { TrainingSession } from '@/types';

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

/**
 * Generic hook for API calls with loading/error states
 */
function useApiCall<T>(
  fetchFn: () => Promise<{ data?: T; success?: boolean; error?: { message?: string } }>,
  dependencies: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      if (response.success && response.data) {
        setData(response.data);
      } else if (response.error?.message) {
        setError(new Error(response.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

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
export function useTeamPlayers(teamId: string | undefined): UseApiState<TeamPlayerDto[]> {
  return useApiCall<TeamPlayerDto[]>(
    () => {
      if (!teamId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.teams.getPlayers(teamId);
    },
    [teamId]
  );
}

/**
 * Hook to fetch team coaches
 */
export function useTeamCoaches(teamId: string | undefined): UseApiState<TeamCoachDto[]> {
  return useApiCall<TeamCoachDto[]>(
    () => {
      if (!teamId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.teams.getCoaches(teamId);
    },
    [teamId]
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
    () => {
      if (!teamId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.teams.getMatches(teamId, options);
    },
    [teamId, options?.status, options?.dateFrom, options?.dateTo]
  );
}

/**
 * Hook to fetch team overview data.
 * Returns early with null data when teamId is undefined (e.g. create mode).
 */
export function useTeamOverview(teamId: string | undefined): UseApiState<TeamOverviewDto> {
  return useApiCall<TeamOverviewDto>(
    () => {
      if (!teamId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.teams.getOverview(teamId);
    },
    [teamId]
  );
}

/**
 * Hook to fetch teams by age group ID with statistics
 */
export function useTeamsByAgeGroupId(ageGroupId: string | undefined): UseApiState<TeamWithStatsDto[]> {
  return useApiCall<TeamWithStatsDto[]>(
    () => apiClient.teams.getByAgeGroupId(ageGroupId!),
    [ageGroupId]
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
    [clubId]
  );
}

/** * Alias for useClubById for backward compatibility
 */
export function useClub(clubId: string | undefined): UseApiState<ClubDetailDto> {
  return useClubById(clubId);
}

/** * Hook to fetch club statistics
 */
export function useClubStatistics(clubId: string | undefined): UseApiState<ClubStatisticsDto> {
  return useApiCall<ClubStatisticsDto>(
    () => apiClient.clubs.getClubStatistics(clubId!),
    [clubId]
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
    [clubId, includeArchived]
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
    [ageGroupId]
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
    [ageGroupId]
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
    [ageGroupId, includeArchived]
  );
}

/**
 * Hook to fetch report cards for an age group
 */
export function useAgeGroupReportCards(ageGroupId: string | undefined): UseApiState<ClubReportCardDto[]> {
  return useApiCall<ClubReportCardDto[]>(
    () => apiClient.ageGroups.getReportCards(ageGroupId!),
    [ageGroupId]
  );
}

/**
 * Hook to fetch development plans for an age group
 */
export function useAgeGroupDevelopmentPlans(ageGroupId: string | undefined): UseApiState<AgeGroupDevelopmentPlanSummaryDto[]> {
  return useApiCall<AgeGroupDevelopmentPlanSummaryDto[]>(
    () => apiClient.ageGroups.getDevelopmentPlans(ageGroupId!),
    [ageGroupId]
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
    [clubId, includeArchived]
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
    [clubId, includeArchived]
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
    [clubId, includeArchived]
  );
}

/**
 * Hook to fetch training sessions for a club with optional filtering
 */
export function useClubTrainingSessions(
  clubId: string | undefined,
  options?: { ageGroupId?: string; teamId?: string; status?: 'upcoming' | 'past' | 'all' }
): UseApiState<{ sessions: TrainingSession[]; totalCount: number }> {
  return useApiCall<{ sessions: TrainingSession[]; totalCount: number }>(
    async () => {
      const response = await apiClient.clubs.getTrainingSessions(clubId!, options);
      if (response.success && response.data) {
        // Map API DTOs to UI TrainingSession model
        const mappedSessions = response.data.sessions.map(mapApiSessionToUiSession);
        return {
          success: true,
          data: {
            sessions: mappedSessions,
            totalCount: response.data.totalCount
          }
        };
      }
      return { success: false, error: { message: response.error?.message } };
    },
    [clubId, options?.ageGroupId, options?.teamId, options?.status]
  );
}

/**
 * Helper function to map API DTO to UI TrainingSession model
 */
function mapApiSessionToUiSession(apiSession: ClubTrainingSessionDto): TrainingSession {
  return {
    id: apiSession.id,
    teamId: apiSession.teamId,
    date: new Date(apiSession.date),
    meetTime: apiSession.meetTime ? new Date(apiSession.meetTime) : undefined,
    duration: apiSession.durationMinutes || 0,
    location: apiSession.location || '',
    focusAreas: apiSession.focusAreas || [],
    drillIds: apiSession.drillIds || [],
    attendance: (apiSession.attendance || []).map((att) => ({
      playerId: att.playerId,
      status: att.status as 'confirmed' | 'declined' | 'maybe' | 'pending',
      notes: att.notes || undefined
    })),
    status: apiSession.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
    isLocked: apiSession.isLocked || false
  };
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
    [clubId, options?.ageGroupId, options?.teamId, options?.status]
  );
}

/**
 * Hook to fetch kits for a club
 */
export function useClubKits(clubId: string | undefined): UseApiState<ClubKitDto[]> {
  return useApiCall<ClubKitDto[]>(
    () => apiClient.clubs.getKits(clubId!),
    [clubId]
  );
}

/**
 * Hook to fetch report cards for a club
 */
export function useClubReportCards(clubId: string | undefined): UseApiState<ClubReportCardDto[]> {
  return useApiCall<ClubReportCardDto[]>(
    () => apiClient.clubs.getReportCards(clubId!),
    [clubId]
  );
}

/**
 * Hook to fetch development plans for a club
 */
export function useClubDevelopmentPlans(clubId: string | undefined): UseApiState<ClubDevelopmentPlanDto[]> {
  return useApiCall<ClubDevelopmentPlanDto[]>(
    () => apiClient.clubs.getDevelopmentPlans(clubId!),
    [clubId]
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
  return useApiCall<TacticsByScopeResponseDto>(
    () => {
      if (!clubId) {
        return Promise.resolve({ success: false, error: { message: 'Club ID is required' } });
      }
      if (teamId && ageGroupId) {
        return apiClient.tactics.getByTeam(clubId, ageGroupId, teamId);
      }
      if (ageGroupId) {
        return apiClient.tactics.getByAgeGroup(clubId, ageGroupId);
      }
      return apiClient.tactics.getByClub(clubId);
    },
    [clubId, ageGroupId, teamId]
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
  return useApiCall<DrillsByScopeResponseDto>(
    () => {
      if (!clubId) {
        return Promise.resolve({ success: false, error: { message: 'Club ID is required' } });
      }
      if (teamId && ageGroupId) {
        return apiClient.drills.getByTeam(clubId, ageGroupId, teamId, options);
      }
      if (ageGroupId) {
        return apiClient.drills.getByAgeGroup(clubId, ageGroupId, options);
      }
      return apiClient.drills.getByClub(clubId, options);
    },
    [clubId, ageGroupId, teamId, options?.category, options?.search]
  );
}

/**
 * Hook to fetch a drill by ID with full detail.
 * Only fetches if drillId is defined.
 */
export function useDrill(drillId: string | undefined): UseApiState<DrillDetailDto> {
  return useApiCall<DrillDetailDto>(
    () => {
      if (!drillId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.drills.getById(drillId);
    },
    [drillId]
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
  return useApiCall<DrillTemplatesByScopeResponseDto>(
    () => {
      if (!clubId) {
        return Promise.resolve({ success: false, error: { message: 'Club ID is required' } });
      }
      if (teamId && ageGroupId) {
        return apiClient.drillTemplates.getByTeam(clubId, ageGroupId, teamId, options);
      }
      if (ageGroupId) {
        return apiClient.drillTemplates.getByAgeGroup(clubId, ageGroupId, options);
      }
      return apiClient.drillTemplates.getByClub(clubId, options);
    },
    [clubId, ageGroupId, teamId, options?.category, options?.search, options?.attributes?.join(',')]
  );
}

/**
 * Hook to fetch a drill template by ID with full detail.
 * Only fetches if templateId is defined.
 */
export function useDrillTemplateById(templateId: string | undefined): UseApiState<DrillTemplateDetailDto> {
  return useApiCall<DrillTemplateDetailDto>(
    () => {
      if (!templateId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.drillTemplates.getById(templateId);
    },
    [templateId]
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
    () => {
      if (!playerId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.players.getById(playerId);
    },
    [playerId]
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
    () => {
      if (!coachId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.coaches.getById(coachId);
    },
    [coachId]
  );
}

// ============================================================
// Development Plan Hooks
// ============================================================

/**
 * Hook to fetch a development plan by ID
 */
export function useDevelopmentPlan(planId: string | undefined): UseApiState<DevelopmentPlanDto> {
  return useApiCall<DevelopmentPlanDto>(
    () => apiClient.developmentPlans.getById(planId!),
    [planId]
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
  return useApiCall<MatchDetailDto>(
    () => {
      if (!matchId || matchId === 'new') {
        return Promise.resolve({ success: true });
      }
      return apiClient.matches.getById(matchId);
    },
    [matchId]
  );
}

/**
 * Hook to fetch a match report by match ID with extended details.
 * Optimized for report view with coach photos, player photos, captain photo, etc.
 * Only fetches if matchId is defined.
 */
export function useMatchReport(matchId: string | undefined): UseApiState<MatchDetailDto> {
  return useApiCall<MatchDetailDto>(
    () => {
      if (!matchId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.matches.getReport(matchId);
    },
    [matchId]
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
    () => {
      if (!tacticId) {
        return Promise.resolve({ success: true });
      }
      return apiClient.tactics.getById(tacticId);
    },
    [tacticId]
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
  return useApiCall<TrainingSession>(
    async () => {
      if (!sessionId || sessionId === 'new') {
        return Promise.resolve({ success: true });
      }
      const response = await apiClient.trainingSessions.getById(sessionId);
      if (response.success && response.data) {
        return {
          success: true,
          data: mapTrainingSessionDetailToUi(response.data)
        };
      }
      return { success: false, error: { message: response.error?.message } };
    },
    [sessionId]
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
