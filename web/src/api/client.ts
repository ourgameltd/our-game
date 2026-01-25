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

// Child player club DTO
export interface ChildPlayerClubDto {
  name: string;
  shortName: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

// Child player age group DTO
export interface ChildPlayerAgeGroupDto {
  id: string;
  name: string;
}

// Child player DTO
export interface ChildPlayerDto {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth?: string;
  photo?: string;
  associationId?: string;
  preferredPositions: string;
  overallRating?: number;
  isArchived: boolean;
  club?: ChildPlayerClubDto;
  ageGroups: ChildPlayerAgeGroupDto[];
}

// Club DTOs
export interface ClubColorsDto {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ClubLocationDto {
  city: string;
  country: string;
  venue: string;
  address: string;
}

export interface ClubDetailDto {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  colors: ClubColorsDto;
  location: ClubLocationDto;
  founded?: number;
  history?: string;
  ethos?: string;
  principles: string[];
}

export interface MatchScoreDto {
  home: number;
  away: number;
}

export interface MatchSummaryDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  opposition: string;
  date: string;
  meetTime?: string;
  kickOffTime?: string;
  location: string;
  isHome: boolean;
  competition?: string;
  score?: MatchScoreDto;
}

export interface ClubStatisticsDto {
  playerCount: number;
  teamCount: number;
  ageGroupCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
  upcomingMatches: MatchSummaryDto[];
  previousResults: MatchSummaryDto[];
}

// Age Group DTOs
export interface AgeGroupListDto {
  id: string;
  clubId: string;
  name: string;
  code: string;
  level: string;
  season: string;
  seasons: string[];
  defaultSeason: string;
  defaultSquadSize: number;
  description?: string;
  isArchived: boolean;
  teamCount: number;
}

export interface AgeGroupDetailDto {
  id: string;
  clubId: string;
  name: string;
  code: string;
  level: string;
  season: string;
  seasons: string[];
  defaultSeason: string;
  defaultSquadSize: number;
  description?: string;
  isArchived: boolean;
}

export interface AgeGroupStatisticsDto {
  playerCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
  upcomingMatches: MatchSummaryDto[];
  previousResults: MatchSummaryDto[];
  topPerformers: AgeGroupPerformerDto[];
  underperforming: AgeGroupPerformerDto[];
}

export interface AgeGroupPerformerDto {
  playerId: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  matchesPlayed: number;
}

export interface TeamWithStatsDto {
  id: string;
  clubId: string;
  ageGroupId: string;
  name: string;
  shortName: string;
  level: string;
  season: string;
  colors: TeamColorsDto;
  isArchived: boolean;
  stats: TeamStatsDto;
}

export interface TeamStatsDto {
  playerCount: number;
  coachCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
}

export interface TeamOverviewDto {
  team: TeamOverviewTeamDto;
  statistics: TeamOverviewStatisticsDto;
  upcomingTrainingSessions: TeamTrainingSessionDto[];
}

export interface TeamOverviewTeamDto {
  id: string;
  clubId: string;
  ageGroupId: string;
  name: string;
  shortName: string;
  level: string;
  season: string;
  colors: TeamColorsDto;
  isArchived: boolean;
}

export interface TeamOverviewStatisticsDto {
  playerCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
  upcomingMatches: TeamMatchSummaryDto[];
  previousResults: TeamMatchSummaryDto[];
  topPerformers: TeamPerformerDto[];
  underperforming: TeamPerformerDto[];
}

export interface TeamMatchSummaryDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  opposition: string;
  date: string;
  meetTime?: string;
  kickOffTime?: string;
  location: string;
  isHome: boolean;
  competition?: string;
  score?: MatchScoreDto;
}

export interface TeamPerformerDto {
  playerId: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  matchesPlayed: number;
}

export interface TeamTrainingSessionDto {
  id: string;
  teamId: string;
  date: string;
  meetTime?: string;
  durationMinutes?: number;
  location: string;
  focusAreas: string[];
}

// Club Player DTOs
export interface ClubPlayerAgeGroupDto {
  id: string;
  name: string;
}

export interface ClubPlayerTeamDto {
  id: string;
  ageGroupId: string;
  name: string;
  ageGroupName?: string;
}

export interface ClubPlayerDto {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth?: string;
  photo?: string;
  associationId?: string;
  preferredPositions: string[];
  overallRating?: number;
  isArchived: boolean;
  ageGroups: ClubPlayerAgeGroupDto[];
  teams: ClubPlayerTeamDto[];
}

// Club Team DTOs
export interface ClubTeamColorsDto {
  primary?: string;
  secondary?: string;
}

export interface ClubTeamDto {
  id: string;
  clubId: string;
  ageGroupId: string;
  ageGroupName: string;
  name: string;
  shortName?: string;
  level: string;
  season: string;
  colors?: ClubTeamColorsDto;
  isArchived: boolean;
  playerCount: number;
}

// Club Coach DTOs
export interface ClubCoachTeamDto {
  id: string;
  ageGroupId: string;
  name: string;
  ageGroupName?: string;
}

export interface ClubCoachDto {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  photo?: string;
  email?: string;
  phone?: string;
  associationId?: string;
  hasAccount: boolean;
  role: string;
  biography?: string;
  specializations: string[];
  isArchived: boolean;
  teams: ClubCoachTeamDto[];
}

// Club Training Session DTOs
export interface ClubTrainingSessionDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  date: string;
  meetTime?: string;
  durationMinutes?: number;
  location: string;
  focusAreas: string[];
  status: string;
  isLocked: boolean;
}

export interface ClubTrainingSessionsDto {
  sessions: ClubTrainingSessionDto[];
  totalCount: number;
}

// Club Match DTOs
export interface ClubMatchDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  squadSize?: number;
  opposition: string;
  date: string;
  meetTime?: string;
  kickOffTime: string;
  location: string;
  isHome: boolean;
  competition: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  isLocked: boolean;
  weatherCondition?: string;
  weatherTemperature?: number;
}

export interface ClubMatchesDto {
  matches: ClubMatchDto[];
  totalCount: number;
}

// Tactics DTOs
export interface TacticScopeDto {
  type: string;
  clubId?: string;
  ageGroupId?: string;
  teamId?: string;
}

export interface TacticListDto {
  id: string;
  name: string;
  summary?: string;
  style?: string;
  squadSize: number;
  parentFormationId?: string;
  parentFormationName?: string;
  scope: TacticScopeDto;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TacticsByScopeResponseDto {
  scopeTactics: TacticListDto[];
  inheritedTactics: TacticListDto[];
}

// Drill DTOs
export interface DrillLinkDto {
  url: string;
  title: string;
  type: string;
}

export interface DrillListDto {
  id: string;
  name: string;
  description: string;
  duration: number;
  category: string;
  attributes: string[];
  equipment: string[];
  diagram?: string;
  instructions: string[];
  variations: string[];
  links: DrillLinkDto[];
  scopeType: string;
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface DrillsByScopeResponseDto {
  drills: DrillListDto[];
  inheritedDrills: DrillListDto[];
  totalCount: number;
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

    /**
     * Get children players for the current authenticated parent user
     */
    getMyChildren: async (): Promise<ApiResponse<ChildPlayerDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<ChildPlayerDto[]>>('/v1/users/me/children');
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

    /**
     * Get teams by age group ID
     */
    getByAgeGroupId: async (ageGroupId: string): Promise<ApiResponse<TeamWithStatsDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<TeamWithStatsDto[]>>(`/v1/age-groups/${ageGroupId}/teams`);
      return response.data;
    },

    /**
     * Get overview data for a team
     */
    getOverview: async (teamId: string): Promise<ApiResponse<TeamOverviewDto>> => {
      const response = await axiosInstance.get<ApiResponse<TeamOverviewDto>>(`/v1/teams/${teamId}/overview`);
      return response.data;
    },
  },

  clubs: {
    /**
     * Get club details by ID
     */
    getClubById: async (clubId: string): Promise<ApiResponse<ClubDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<ClubDetailDto>>(`/v1/clubs/${clubId}`);
      return response.data;
    },

    /**
     * Get club statistics
     */
    getClubStatistics: async (clubId: string): Promise<ApiResponse<ClubStatisticsDto>> => {
      const response = await axiosInstance.get<ApiResponse<ClubStatisticsDto>>(`/v1/clubs/${clubId}/statistics`);
      return response.data;
    },

    /**
     * Get age groups by club ID
     */
    getAgeGroups: async (clubId: string, includeArchived: boolean = false): Promise<ApiResponse<AgeGroupListDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<AgeGroupListDto[]>>(`/v1/clubs/${clubId}/age-groups${params}`);
      return response.data;
    },

    /**
     * Get all players for a club
     */
    getPlayers: async (clubId: string, includeArchived: boolean = false): Promise<ApiResponse<ClubPlayerDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<ClubPlayerDto[]>>(`/v1/clubs/${clubId}/players${params}`);
      return response.data;
    },

    /**
     * Get all teams for a club
     */
    getTeams: async (clubId: string, includeArchived: boolean = false): Promise<ApiResponse<ClubTeamDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<ClubTeamDto[]>>(`/v1/clubs/${clubId}/teams${params}`);
      return response.data;
    },

    /**
     * Get all coaches for a club
     */
    getCoaches: async (clubId: string, includeArchived: boolean = false): Promise<ApiResponse<ClubCoachDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<ClubCoachDto[]>>(`/v1/clubs/${clubId}/coaches${params}`);
      return response.data;
    },

    /**
     * Get all training sessions for a club with optional filtering
     */
    getTrainingSessions: async (
      clubId: string, 
      options?: { ageGroupId?: string; teamId?: string; status?: 'upcoming' | 'past' | 'all' }
    ): Promise<ApiResponse<ClubTrainingSessionsDto>> => {
      const params = new URLSearchParams();
      if (options?.ageGroupId) params.append('ageGroupId', options.ageGroupId);
      if (options?.teamId) params.append('teamId', options.teamId);
      if (options?.status) params.append('status', options.status);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<ClubTrainingSessionsDto>>(`/v1/clubs/${clubId}/training-sessions${queryString}`);
      return response.data;
    },

    /**
     * Get all matches for a club with optional filtering
     */
    getMatches: async (
      clubId: string, 
      options?: { ageGroupId?: string; teamId?: string; status?: 'upcoming' | 'past' | 'scheduled' | 'completed' | 'cancelled' | 'all' }
    ): Promise<ApiResponse<ClubMatchesDto>> => {
      const params = new URLSearchParams();
      if (options?.ageGroupId) params.append('ageGroupId', options.ageGroupId);
      if (options?.teamId) params.append('teamId', options.teamId);
      if (options?.status) params.append('status', options.status);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<ClubMatchesDto>>(`/v1/clubs/${clubId}/matches${queryString}`);
      return response.data;
    },
  },

  ageGroups: {
    /**
     * Get age group by ID
     */
    getById: async (ageGroupId: string): Promise<ApiResponse<AgeGroupDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<AgeGroupDetailDto>>(`/v1/age-groups/${ageGroupId}`);
      return response.data;
    },

    /**
     * Get age group statistics
     */
    getStatistics: async (ageGroupId: string): Promise<ApiResponse<AgeGroupStatisticsDto>> => {
      const response = await axiosInstance.get<ApiResponse<AgeGroupStatisticsDto>>(`/v1/age-groups/${ageGroupId}/statistics`);
      return response.data;
    },
  },

  tactics: {
    /**
     * Get tactics at club level
     */
    getByClub: async (clubId: string): Promise<ApiResponse<TacticsByScopeResponseDto>> => {
      const response = await axiosInstance.get<ApiResponse<TacticsByScopeResponseDto>>(`/v1/clubs/${clubId}/tactics`);
      return response.data;
    },

    /**
     * Get tactics at age group level (includes inherited club tactics)
     */
    getByAgeGroup: async (clubId: string, ageGroupId: string): Promise<ApiResponse<TacticsByScopeResponseDto>> => {
      const response = await axiosInstance.get<ApiResponse<TacticsByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/tactics`);
      return response.data;
    },

    /**
     * Get tactics at team level (includes inherited club and age group tactics)
     */
    getByTeam: async (clubId: string, ageGroupId: string, teamId: string): Promise<ApiResponse<TacticsByScopeResponseDto>> => {
      const response = await axiosInstance.get<ApiResponse<TacticsByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics`);
      return response.data;
    },
  },

  drills: {
    /**
     * Get drills at club level
     */
    getByClub: async (
      clubId: string,
      options?: { category?: string; search?: string }
    ): Promise<ApiResponse<DrillsByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillsByScopeResponseDto>>(`/v1/clubs/${clubId}/drills${queryString}`);
      return response.data;
    },

    /**
     * Get drills at age group level (includes inherited club drills)
     */
    getByAgeGroup: async (
      clubId: string,
      ageGroupId: string,
      options?: { category?: string; search?: string }
    ): Promise<ApiResponse<DrillsByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillsByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/drills${queryString}`);
      return response.data;
    },

    /**
     * Get drills at team level (includes inherited club and age group drills)
     */
    getByTeam: async (
      clubId: string,
      ageGroupId: string,
      teamId: string,
      options?: { category?: string; search?: string }
    ): Promise<ApiResponse<DrillsByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillsByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/drills${queryString}`);
      return response.data;
    },
  },
};