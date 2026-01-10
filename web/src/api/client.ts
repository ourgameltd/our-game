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
  ErrorResponse,
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

// Generic API response type for endpoints not yet in generated types
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: ErrorResponse;
  statusCode?: number;
}

// Club summary for list endpoint (subset of ClubDetailDto)
export interface ClubSummaryDto {
  id?: string;
  name?: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}/**
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
    getAll: () => 
      fetchApi<ApiResponse<ClubSummaryDto[]>>(`/v1/clubs`),
    getById: (clubId: string) => 
      fetchApi<ApiResponseClubDetailDto>(`/v1/clubs/${clubId}`),
  },

  teams: {
    getById: (teamId: string) => 
      fetchApi<ApiResponseTeamDetailDto>(`/v1/teams/${teamId}`),
    getSquad: (teamId: string) =>
      fetchApi<ApiResponse<PlayerProfileDto[]>>(`/v1/teams/${teamId}/squad`),
  },

  players: {
    getById: (playerId: string) => 
      fetchApi<ApiResponsePlayerProfileDto>(`/v1/players/${playerId}`),
    getAttributes: (playerId: string) => 
      fetchApi<ApiResponsePlayerAttributesDto>(`/v1/players/${playerId}/attributes`),
  },

  ageGroups: {
    getByClub: (clubId: string) => 
      fetchApi<ApiResponseList1>(`/v1/clubs/${clubId}/age-groups`),
  },

  matches: {
    getById: (matchId: string) => 
      fetchApi<ApiResponseMatchDto>(`/v1/matches/${matchId}`),
    getLineup: (matchId: string) => 
      fetchApi<ApiResponseMatchLineupDto>(`/v1/matches/${matchId}/lineup`),
  },
};