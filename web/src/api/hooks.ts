/**
 * React hooks for OurGame API data fetching
 * 
 * These hooks provide a simple way to fetch data from the API with
 * loading states, error handling, and automatic refetching.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  TeamListItemDto,
  TeamOverviewDto,
  ChildPlayerDto,
  ClubDetailDto,
  ClubStatisticsDto,
  AgeGroupListDto,
  AgeGroupStatisticsDto,
  ClubPlayerDto,
  ClubTeamDto,
  ClubCoachDto,
  ClubTrainingSessionsDto,
  ClubMatchesDto,
  ClubKitDto,
  TacticsByScopeResponseDto,
  DrillsByScopeResponseDto,
  DrillTemplatesByScopeResponseDto
} from './client';

// Generic hook state
interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
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
 * Hook to fetch team overview data
 */
export function useTeamOverview(teamId: string | undefined): UseApiState<TeamOverviewDto> {
  return useApiCall<TeamOverviewDto>(
    () => apiClient.teams.getOverview(teamId!),
    [teamId]
  );
}

// ============================================================
// User Hooks
// ============================================================

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

/**
 * Hook to fetch club statistics
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
 * Hook to fetch age group statistics
 */
export function useAgeGroupStatistics(ageGroupId: string | undefined): UseApiState<AgeGroupStatisticsDto> {
  return useApiCall<AgeGroupStatisticsDto>(
    () => apiClient.ageGroups.getStatistics(ageGroupId!),
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
): UseApiState<ClubTrainingSessionsDto> {
  return useApiCall<ClubTrainingSessionsDto>(
    () => apiClient.clubs.getTrainingSessions(clubId!, options),
    [clubId, options?.ageGroupId, options?.teamId, options?.status]
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
