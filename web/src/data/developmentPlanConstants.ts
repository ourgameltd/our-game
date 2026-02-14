/**
 * Development Plan Constants
 *
 * Status values, display mappings, sort options, and helpers
 * for development plans.
 */

// Development plan status
export const developmentPlanStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
] as const;

export type DevelopmentPlanStatus = typeof developmentPlanStatuses[number]['value'];

// Development plan status display mapping
export const developmentPlanStatusDisplay: Record<string, string> = Object.fromEntries(
  developmentPlanStatuses.map(s => [s.value, s.label])
);

// Get development plan status label
export function getDevelopmentPlanStatusLabel(status: string): string {
  return developmentPlanStatusDisplay[status] ?? status;
}

// Sort options for development plan lists
export const developmentPlanSortOptions = [
  { value: 'date', label: 'Most Recent' },
  { value: 'progress', label: 'Highest Progress' },
] as const;

export type DevelopmentPlanSortOption = typeof developmentPlanSortOptions[number]['value'];
