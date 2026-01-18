/**
 * React hooks for OurGame API data fetching
 * 
 * These hooks provide a simple way to fetch data from the API with
 * loading states, error handling, and automatic refetching.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './client';
import type {
  ClubDetailDto,
  TeamDetailDto,
  PlayerProfileDto,
  PlayerAttributesDto,
  MatchDto,
  MatchLineupDto,
  AgeGroupListItemDto,
  ClubSummaryDto,
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
// Club Hooks
// ============================================================

/**
 * Hook to fetch all clubs the user has access to
 */
export function useClubs(): UseApiState<ClubSummaryDto[]> {
  return useApiCall<ClubSummaryDto[]>(
    () => apiClient.clubs.getAll(),
    []
  );
}

/**
 * Hook to fetch a single club by ID
 */
export function useClub(clubId: string | undefined): UseApiState<ClubDetailDto> {
  return useApiCall<ClubDetailDto>(
    () => {
      if (!clubId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.clubs.getById(clubId);
    },
    [clubId]
  );
}

/**
 * Hook to fetch age groups for a club (using clubs.getAgeGroups)
 * @param clubId - The club ID
 * @param includeArchived - Whether to include archived age groups (default: false)
 * @param season - Optional season filter (e.g., "2024/25")
 */
export function useClubAgeGroups(
  clubId: string | undefined,
  includeArchived?: boolean,
  season?: string
): UseApiState<AgeGroupListItemDto[]> {
  return useApiCall<AgeGroupListItemDto[]>(
    () => {
      if (!clubId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.clubs.getAgeGroups(clubId, includeArchived, season);
    },
    [clubId, includeArchived, season]
  );
}

// ============================================================
// Age Group Hooks
// ============================================================

/**
 * Hook to fetch age groups for a club
 * @param clubId - The club ID
 * @param includeArchived - Whether to include archived age groups (default: false)
 * @param season - Optional season filter (e.g., "2024/25")
 */
export function useAgeGroups(
  clubId: string | undefined,
  includeArchived?: boolean,
  season?: string
): UseApiState<AgeGroupListItemDto[]> {
  return useApiCall<AgeGroupListItemDto[]>(
    () => {
      if (!clubId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.ageGroups.getByClub(clubId, includeArchived, season);
    },
    [clubId, includeArchived, season]
  );
}

// ============================================================
// Team Hooks
// ============================================================

/**
 * Hook to fetch a single team by ID
 */
export function useTeam(teamId: string | undefined): UseApiState<TeamDetailDto> {
  return useApiCall<TeamDetailDto>(
    () => {
      if (!teamId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.teams.getById(teamId);
    },
    [teamId]
  );
}

/**
 * Hook to fetch team squad (players)
 */
export function useTeamSquad(teamId: string | undefined): UseApiState<PlayerProfileDto[]> {
  return useApiCall<PlayerProfileDto[]>(
    () => {
      if (!teamId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.teams.getSquad(teamId);
    },
    [teamId]
  );
}

// ============================================================
// Player Hooks
// ============================================================

/**
 * Hook to fetch a single player by ID
 */
export function usePlayer(playerId: string | undefined): UseApiState<PlayerProfileDto> {
  return useApiCall<PlayerProfileDto>(
    () => {
      if (!playerId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.players.getById(playerId);
    },
    [playerId]
  );
}

/**
 * Hook to fetch player attributes (EA FC-style ratings)
 */
export function usePlayerAttributes(playerId: string | undefined): UseApiState<PlayerAttributesDto> {
  return useApiCall<PlayerAttributesDto>(
    () => {
      if (!playerId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.players.getAttributes(playerId);
    },
    [playerId]
  );
}

// ============================================================
// Match Hooks
// ============================================================

/**
 * Hook to fetch a single match by ID
 */
export function useMatch(matchId: string | undefined): UseApiState<MatchDto> {
  return useApiCall<MatchDto>(
    () => {
      if (!matchId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.matches.getById(matchId);
    },
    [matchId]
  );
}

/**
 * Hook to fetch match lineup
 */
export function useMatchLineup(matchId: string | undefined): UseApiState<MatchLineupDto> {
  return useApiCall<MatchLineupDto>(
    () => {
      if (!matchId) return Promise.resolve({ success: false, data: undefined });
      return apiClient.matches.getLineup(matchId);
    },
    [matchId]
  );
}
