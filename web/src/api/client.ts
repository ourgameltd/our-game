/**
 * OurGame API Client
 * 
 * Simple axios-based client for the OurGame API.
 */

import axios, { AxiosInstance } from 'axios';

// Generic API response type
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: {
    message?: string;
    statusCode?: number;
  };
  statusCode?: number;
}

// User Profile
export interface UserProfile {
  id: string;
  azureUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  photo: string;
  preferences: string;
  createdAt: string;
  updatedAt: string;
  playerId?: string;
  coachId?: string;
}

// Team colors DTO
export interface TeamColorsDto {
  primary?: string;
  secondary?: string;
}

// Team club DTO
export interface TeamClubDto {
  name?: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  foundedYear?: number;
}

// Team coach DTO
export interface TeamCoachDto {
  id?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

// Team list item DTO
export interface TeamListItemDto {
  id?: string;
  clubId?: string;
  ageGroupId?: string;
  ageGroupName?: string;
  name?: string;
  colors?: TeamColorsDto;
  season?: string;
  squadSize?: number;
  coaches?: TeamCoachDto[];
  playerCount?: number;
  isArchived?: boolean;
  club?: TeamClubDto;
}

/**
 * Get the API base URL based on the environment
 * In both development and production, the API is available at /api
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '/api';
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'api-version': '1.0',
  },
});

/**
 * OurGame API Client
 * 
 * Usage:
 * ```typescript
 * import { apiClient } from '@/api/client';
 * 
 * const user = await apiClient.users.getCurrentUser();
 * const teams = await apiClient.teams.getMyTeams();
 * ```
 */
export const apiClient = {
  users: {
    /**
     * Get current authenticated user's profile
     */
    getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
      const response = await axiosInstance.get<ApiResponse<UserProfile>>('/v1/users/me');
      return response.data;
    },
  },

  teams: {
    /**
     * Get teams for the current authenticated user
     */
    getMyTeams: async (): Promise<ApiResponse<TeamListItemDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<TeamListItemDto[]>>('/v1/teams/me');
      return response.data;
    },
  },
};