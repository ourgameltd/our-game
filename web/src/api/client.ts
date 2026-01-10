/**
 * OurGame API Client
 * 
 * Type-safe client for the OurGame API.
 * Types are auto-generated - run `npm run generate:api` to update.
 */

import type {
  ApiResponseClubDetailDto,
  ApiResponseTeamDetailDto,
  ApiResponsePlayerProfileDto,
  ApiResponsePlayerAttributesDto,
  ApiResponseMatchDto,
  ApiResponseMatchLineupDto,
  ApiResponseList1,
  ClubDetailDto,
  TeamDetailDto,
  PlayerProfileDto,
  PlayerAttributesDto,
  MatchDto,
  MatchLineupDto,
  AgeGroupDto,
} from './generated';

// Re-export types for convenience
export type {
  ClubDetailDto,
  TeamDetailDto,
  PlayerProfileDto,
  PlayerAttributesDto,
  MatchDto,
  MatchLineupDto,
  AgeGroupDto,
};

/**
 * Get the API base URL based on the environment
 * In both development and production, the API is available at /api
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '/api';
}

const baseUrl = getApiBaseUrl();

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'api-version': '1.0',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * OurGame API Client
 * 
 * Usage:
 * ```typescript
 * import { apiClient } from '@/api/client';
 * 
 * const club = await apiClient.clubs.getById('club-id');
 * const teams = await apiClient.teams.getByClub('club-id');
 * ```
 */
export const apiClient = {
  clubs: {
    getById: (clubId: string) => 
      fetchApi<ApiResponseClubDetailDto>(`/clubs/${clubId}`),
  },

  teams: {
    getById: (teamId: string) => 
      fetchApi<ApiResponseTeamDetailDto>(`/teams/${teamId}`),
    getByClub: (clubId: string) => 
      fetchApi<ApiResponseTeamDetailDto[]>(`/clubs/${clubId}/teams`),
  },

  players: {
    getById: (playerId: string) => 
      fetchApi<ApiResponsePlayerProfileDto>(`/players/${playerId}`),
    getAttributes: (playerId: string) => 
      fetchApi<ApiResponsePlayerAttributesDto>(`/players/${playerId}/attributes`),
  },

  ageGroups: {
    getByClub: (clubId: string) => 
      fetchApi<ApiResponseList1>(`/clubs/${clubId}/age-groups`),
  },

  matches: {
    getById: (matchId: string) => 
      fetchApi<ApiResponseMatchDto>(`/matches/${matchId}`),
    getLineup: (matchId: string) => 
      fetchApi<ApiResponseMatchLineupDto>(`/matches/${matchId}/lineup`),
  },
};