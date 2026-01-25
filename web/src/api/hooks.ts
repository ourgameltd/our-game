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
  ClubCoachDto
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
