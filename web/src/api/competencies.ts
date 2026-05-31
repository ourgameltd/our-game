/**
 * Competency framework API client + React hooks.
 *
 * Endpoints:
 *   GET    /v1/players/{playerId}/competencies
 *   PUT    /v1/players/{playerId}/competencies
 *   GET    /v1/clubs/{clubId}/competency-frameworks
 *   GET    /v1/competency-frameworks/{id}
 *   POST   /v1/competency-frameworks
 *   PUT    /v1/competency-frameworks/{id}
 *   DELETE /v1/competency-frameworks/{id}
 *   PUT    /v1/clubs/{clubId}/competency-assignment
 *   PUT    /v1/age-groups/{ageGroupId}/competency-assignment
 *   PUT    /v1/teams/{teamId}/competency-assignment
 */

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { ApiResponse } from './client';
import type { ApiError, UseMutationState } from './hooks';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const tokenString = localStorage.getItem('ourgame.auth.token');
  if (tokenString) {
    try {
      const token = JSON.parse(tokenString);
      if (token?.accessToken) {
        config.headers.Authorization = `Bearer ${token.accessToken}`;
      }
    } catch {
      // Ignore malformed token; request will be rejected by API if auth is required.
    }
  }
  return config;
});

export type CompetencyBand = 'Development' | 'Intermediate' | 'Advanced' | 'Elite';
export const COMPETENCY_BANDS: readonly CompetencyBand[] = ['Development', 'Intermediate', 'Advanced', 'Elite'];

export type GameFormat = 'FiveASide' | 'SevenASide' | 'NineASide' | 'ElevenASide';
export const GAME_FORMATS: readonly GameFormat[] = ['FiveASide', 'SevenASide', 'NineASide', 'ElevenASide'];
export const GAME_FORMAT_LABELS: Record<GameFormat, string> = {
  FiveASide: '5s',
  SevenASide: '7s',
  NineASide: '9s',
  ElevenASide: '11s',
};

export type CompetencyFrameworkScope = 'System' | 'Club' | 'AgeGroup' | 'Team';

// ---------- DTOs ----------

export interface PlayerCompetenciesDto {
  playerId: string;
  playerName: string;
  overallRating?: number;
  overallBand?: CompetencyBand;
  competencies: PlayerCompetencyBandDto[];
  teamScores: PlayerTeamScoreDto[];
}

export interface PlayerCompetencyBandDto {
  competencyId: string;
  competencyName: string;
  displayOrder: number;
  categoryName: string;
  band?: CompetencyBand;
  descriptions: Record<CompetencyBand, string>;
}

export interface PlayerTeamScoreDto {
  teamId: string;
  teamName: string;
  format: GameFormat;
  frameworkId: string;
  frameworkName: string;
  baseScore: number;
  boostedScore: number;
  band: CompetencyBand;
  calculatedAt: string;
}

export interface UpdatePlayerCompetenciesRequest {
  bands: { competencyId: string; band: CompetencyBand }[];
  coachNotes?: string;
}

export interface CompetencyFrameworkListItemDto {
  id: string;
  name: string;
  description?: string;
  isSystemDefault: boolean;
  scope: CompetencyFrameworkScope;
  ownerClubId?: string;
  ownerAgeGroupId?: string;
  ownerTeamId?: string;
  sourceFrameworkId?: string;
  upliftPercent: number;
  updatedAt: string;
  assignmentCount: number;
}

export interface CompetencyFrameworkDetailDto {
  id: string;
  name: string;
  description?: string;
  isSystemDefault: boolean;
  scope: CompetencyFrameworkScope;
  ownerClubId?: string;
  ownerAgeGroupId?: string;
  ownerTeamId?: string;
  sourceFrameworkId?: string;
  upliftPercent: number;
  bandThresholds: { band: CompetencyBand; threshold: number }[];
  categories: CategoryWeightDto[];
  competencyDescriptions: CompetencyDescriptionDto[];
}

export interface CategoryWeightDto {
  categoryId: string;
  categoryName: string;
  displayOrder: number;
  attributes: AttributeWeightDto[];
}

export interface AttributeWeightDto {
  attributeId: string;
  attributeName: string;
  competencyId: string;
  competencyName: string;
  displayOrder: number;
  weightsByFormat: Record<GameFormat, number>;
}

export interface CompetencyDescriptionDto {
  competencyId: string;
  competencyName: string;
  displayOrder: number;
  descriptions: Record<CompetencyBand, string>;
}

export interface UpdateCompetencyFrameworkRequest {
  name: string;
  description?: string;
  upliftPercent: number;
  bandThresholds: Record<CompetencyBand, number>;
  weights: { attributeId: string; format: GameFormat; weightPercent: number }[];
  competencyDescriptions: { competencyId: string; band: CompetencyBand; description: string }[];
}

export interface CreateCompetencyFrameworkRequest {
  name: string;
  description?: string;
  sourceFrameworkId?: string;
  scope: CompetencyFrameworkScope;
  ownerClubId?: string;
  ownerAgeGroupId?: string;
  ownerTeamId?: string;
  upliftPercent?: number;
}

export interface SetCompetencyAssignmentRequest {
  frameworkId: string;
  allowAgeGroupOverride?: boolean;
  allowTeamOverride?: boolean;
}

// ---------- Client ----------

function handleError(error: unknown): ApiResponse<never> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = error as any;
  return {
    success: false,
    statusCode: e?.response?.status ?? 500,
    error: {
      message: e?.response?.data?.error?.message ?? e?.message ?? 'Unknown error',
      statusCode: e?.response?.status,
      validationErrors: e?.response?.data?.error?.validationErrors,
    },
  } as ApiResponse<never>;
}

export const competenciesClient = {
  getPlayerCompetencies: async (playerId: string): Promise<ApiResponse<PlayerCompetenciesDto>> => {
    try {
      const r = await axiosInstance.get<ApiResponse<PlayerCompetenciesDto>>(`/v1/players/${playerId}/competencies`);
      return r.data;
    } catch (e) { return handleError(e); }
  },
  updatePlayerCompetencies: async (playerId: string, request: UpdatePlayerCompetenciesRequest): Promise<ApiResponse<void>> => {
    try {
      const r = await axiosInstance.put<ApiResponse<void>>(`/v1/players/${playerId}/competencies`, request);
      return r.data ?? { success: true, statusCode: 204 } as ApiResponse<void>;
    } catch (e) { return handleError(e); }
  },
  listClubFrameworks: async (clubId: string): Promise<ApiResponse<CompetencyFrameworkListItemDto[]>> => {
    try {
      const r = await axiosInstance.get<ApiResponse<CompetencyFrameworkListItemDto[]>>(`/v1/clubs/${clubId}/competency-frameworks`);
      return r.data;
    } catch (e) { return handleError(e); }
  },
  getFramework: async (frameworkId: string): Promise<ApiResponse<CompetencyFrameworkDetailDto>> => {
    try {
      const r = await axiosInstance.get<ApiResponse<CompetencyFrameworkDetailDto>>(`/v1/competency-frameworks/${frameworkId}`);
      return r.data;
    } catch (e) { return handleError(e); }
  },
  createFramework: async (request: CreateCompetencyFrameworkRequest): Promise<ApiResponse<string>> => {
    try {
      const r = await axiosInstance.post<ApiResponse<string>>(`/v1/competency-frameworks`, request);
      return r.data;
    } catch (e) { return handleError(e); }
  },
  updateFramework: async (frameworkId: string, request: UpdateCompetencyFrameworkRequest): Promise<ApiResponse<void>> => {
    try {
      const r = await axiosInstance.put<ApiResponse<void>>(`/v1/competency-frameworks/${frameworkId}`, request);
      return r.data ?? { success: true, statusCode: 204 } as ApiResponse<void>;
    } catch (e) { return handleError(e); }
  },
  archiveFramework: async (frameworkId: string): Promise<ApiResponse<void>> => {
    try {
      await axiosInstance.delete(`/v1/competency-frameworks/${frameworkId}`);
      return { success: true, statusCode: 204 } as ApiResponse<void>;
    } catch (e) { return handleError(e); }
  },
  setClubAssignment: async (clubId: string, request: SetCompetencyAssignmentRequest): Promise<ApiResponse<void>> => {
    try {
      await axiosInstance.put(`/v1/clubs/${clubId}/competency-assignment`, request);
      return { success: true, statusCode: 204 } as ApiResponse<void>;
    } catch (e) { return handleError(e); }
  },
  setAgeGroupAssignment: async (ageGroupId: string, request: SetCompetencyAssignmentRequest): Promise<ApiResponse<void>> => {
    try {
      await axiosInstance.put(`/v1/age-groups/${ageGroupId}/competency-assignment`, request);
      return { success: true, statusCode: 204 } as ApiResponse<void>;
    } catch (e) { return handleError(e); }
  },
  setTeamAssignment: async (teamId: string, request: SetCompetencyAssignmentRequest): Promise<ApiResponse<void>> => {
    try {
      await axiosInstance.put(`/v1/teams/${teamId}/competency-assignment`, request);
      return { success: true, statusCode: 204 } as ApiResponse<void>;
    } catch (e) { return handleError(e); }
  },
};

// ---------- Hooks ----------

interface UseQueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useQuery<T>(fetcher: () => Promise<ApiResponse<T>>, deps: unknown[], enabled = true): UseQueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async () => {
    if (!enabled) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const r = await fetcher();
      if (r.success && r.data !== undefined) setData(r.data as T);
      else setError(new Error(r.error?.message ?? 'Request failed'));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { data, isLoading, error, refetch: run };
}

export function usePlayerCompetencies(playerId: string | undefined) {
  return useQuery<PlayerCompetenciesDto>(
    () => competenciesClient.getPlayerCompetencies(playerId!),
    [playerId],
    !!playerId,
  );
}

export function useClubCompetencyFrameworks(clubId: string | undefined) {
  return useQuery<CompetencyFrameworkListItemDto[]>(
    () => competenciesClient.listClubFrameworks(clubId!),
    [clubId],
    !!clubId,
  );
}

export function useCompetencyFramework(frameworkId: string | undefined) {
  return useQuery<CompetencyFrameworkDetailDto>(
    () => competenciesClient.getFramework(frameworkId!),
    [frameworkId],
    !!frameworkId,
  );
}

function useMutation<TInput, TResult>(
  mutator: (input: TInput) => Promise<ApiResponse<TResult>>,
): UseMutationState<TResult> & { mutate: (input: TInput) => Promise<TResult | null> } {
  const [data, setData] = useState<TResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (input: TInput): Promise<TResult | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const r = await mutator(input);
      if (r.success) {
        const value = (r.data ?? null) as TResult | null;
        setData(value);
        return value;
      }
      setError({
        message: r.error?.message ?? 'Request failed',
        statusCode: r.error?.statusCode,
        validationErrors: r.error?.validationErrors,
      });
      return null;
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Unknown error' });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [mutator]);

  return { data, isSubmitting, error, mutate };
}

export function useUpdatePlayerCompetencies(playerId: string) {
  return useMutation<UpdatePlayerCompetenciesRequest, void>(
    (request) => competenciesClient.updatePlayerCompetencies(playerId, request),
  );
}

export function useUpdateCompetencyFramework(frameworkId: string) {
  return useMutation<UpdateCompetencyFrameworkRequest, void>(
    (request) => competenciesClient.updateFramework(frameworkId, request),
  );
}

export function useCreateCompetencyFramework() {
  return useMutation<CreateCompetencyFrameworkRequest, string>(
    (request) => competenciesClient.createFramework(request),
  );
}

export function useArchiveCompetencyFramework() {
  return useMutation<string, void>(
    (frameworkId) => competenciesClient.archiveFramework(frameworkId),
  );
}

export function useSetCompetencyAssignment() {
  return useMutation<{ scope: 'club' | 'ageGroup' | 'team'; scopeId: string; request: SetCompetencyAssignmentRequest }, void>(
    ({ scope, scopeId, request }) => {
      if (scope === 'club') return competenciesClient.setClubAssignment(scopeId, request);
      if (scope === 'ageGroup') return competenciesClient.setAgeGroupAssignment(scopeId, request);
      return competenciesClient.setTeamAssignment(scopeId, request);
    },
  );
}
