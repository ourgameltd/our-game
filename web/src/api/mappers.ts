/**
 * Utility functions for mapping API DTOs to frontend types
 * 
 * Note: Mappers will be added here as needed when more endpoints are implemented.
 */

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
