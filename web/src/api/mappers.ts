/**
 * Utility functions for mapping API DTOs to frontend types
 * 
 * Note: Mappers will be added here as needed when more endpoints are implemented.
 */

import type { ClubTrainingSessionDto } from './client';
import type { TrainingSession } from '@/types';

/**
 * Map ClubTrainingSessionDto to TrainingSession
 * Converts date strings to Date objects and maps duration field
 */
export function mapClubTrainingSessionToTrainingSession(dto: ClubTrainingSessionDto): TrainingSession {
  return {
    id: dto.id,
    teamId: dto.teamId,
    date: new Date(dto.date),
    meetTime: dto.meetTime ? new Date(dto.meetTime) : undefined,
    duration: dto.durationMinutes ?? 60, // Default to 60 minutes if not specified
    location: dto.location,
    focusAreas: dto.focusAreas,
    drillIds: dto.drillIds,
    attendance: dto.attendance.map(a => ({
      playerId: a.playerId,
      status: a.status as 'confirmed' | 'declined' | 'maybe' | 'pending',
      notes: a.notes
    })),
    status: dto.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
    isLocked: dto.isLocked
  };
}

/**
 * Map array of ClubTrainingSessionDto to TrainingSession array
 */
export function mapClubTrainingSessions(dtos: ClubTrainingSessionDto[]): TrainingSession[] {
  return dtos.map(mapClubTrainingSessionToTrainingSession);
}

/**
 * Map API coach role enum to UI kebab-case format
 * API: HeadCoach, AssistantCoach, GoalkeeperCoach, FitnessCoach, TechnicalCoach
 * UI: head-coach, assistant-coach, goalkeeper-coach, fitness-coach, technical-coach
 */
export function mapApiRoleToUi(apiRole: string): string {
  const roleMap: Record<string, string> = {
    'HeadCoach': 'head-coach',
    'AssistantCoach': 'assistant-coach',
    'GoalkeeperCoach': 'goalkeeper-coach',
    'FitnessCoach': 'fitness-coach',
    'TechnicalCoach': 'technical-coach',
  };
  return roleMap[apiRole] || apiRole.toLowerCase();
}

/**
 * Map UI kebab-case role to API PascalCase enum format
 * UI: head-coach, assistant-coach, goalkeeper-coach, fitness-coach, technical-coach
 * API: HeadCoach, AssistantCoach, GoalkeeperCoach, FitnessCoach, TechnicalCoach
 */
export function mapUiRoleToApi(uiRole: string): string {
  const roleMap: Record<string, string> = {
    'head-coach': 'HeadCoach',
    'assistant-coach': 'AssistantCoach',
    'goalkeeper-coach': 'GoalkeeperCoach',
    'fitness-coach': 'FitnessCoach',
    'technical-coach': 'TechnicalCoach',
  };
  return roleMap[uiRole] || uiRole;
}
