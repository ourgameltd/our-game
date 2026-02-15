/**
 * Reference Data
 * 
 * This file contains all lookup/reference data that should be centralized
 * for consistency across the application and eventual API migration.
 */

// Weather conditions, card types, injury severities - re-exported from shared constants
export { weatherConditions, cardTypes, injurySeverities } from '../constants/referenceData';
export type { WeatherCondition, CardType, InjurySeverity } from '../constants/referenceData';

// Team/Age Group levels & Squad sizes - re-exported from shared constants
export { teamLevels, squadSizes } from '../constants/referenceData';
export type { TeamLevel, AgeGroupLevel, SquadSizeValue } from '../constants/referenceData';

// Coach roles - re-exported from shared constants
export { coachRoles } from '../constants/referenceData';
export type { CoachRoleValue } from '../constants/referenceData';

// Kit types
export const kitTypes = [
  { value: 'home', label: 'Home' },
  { value: 'away', label: 'Away' },
  { value: 'third', label: 'Third' },
  { value: 'goalkeeper', label: 'Goalkeeper' },
  { value: 'training', label: 'Training' },
] as const;

export type KitTypeValue = typeof kitTypes[number]['value'];

// Image/Album tags
export const imageTags = [
  { value: 'training', label: 'Training' },
  { value: 'match', label: 'Match' },
  { value: 'award', label: 'Award' },
  { value: 'team', label: 'Team' },
  { value: 'highlight', label: 'Highlight' },
  { value: 'achievement', label: 'Achievement' },
] as const;

export type ImageTag = typeof imageTags[number]['value'];

// Player positions
export const playerPositions = [
  { value: 'GK', label: 'Goalkeeper', category: 'Goalkeeper' },
  { value: 'LB', label: 'Left Back', category: 'Defender' },
  { value: 'CB', label: 'Centre Back', category: 'Defender' },
  { value: 'RB', label: 'Right Back', category: 'Defender' },
  { value: 'LWB', label: 'Left Wing Back', category: 'Defender' },
  { value: 'RWB', label: 'Right Wing Back', category: 'Defender' },
  { value: 'CDM', label: 'Central Defensive Midfielder', category: 'Midfielder' },
  { value: 'CM', label: 'Central Midfielder', category: 'Midfielder' },
  { value: 'CAM', label: 'Central Attacking Midfielder', category: 'Midfielder' },
  { value: 'LM', label: 'Left Midfielder', category: 'Midfielder' },
  { value: 'RM', label: 'Right Midfielder', category: 'Midfielder' },
  { value: 'LW', label: 'Left Winger', category: 'Forward' },
  { value: 'RW', label: 'Right Winger', category: 'Forward' },
  { value: 'CF', label: 'Centre Forward', category: 'Forward' },
  { value: 'ST', label: 'Striker', category: 'Forward' },
] as const;

export type PlayerPositionValue = typeof playerPositions[number]['value'];

// User roles
export const userRoles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'coach', label: 'Coach' },
  { value: 'player', label: 'Player' },
  { value: 'parent', label: 'Parent' },
  { value: 'fan', label: 'Fan' },
] as const;

export type UserRoleValue = typeof userRoles[number]['value'];

// Attribute quality levels
export const attributeQualities = [
  { value: 'Excellent', label: 'Excellent', minRating: 90 },
  { value: 'Very Good', label: 'Very Good', minRating: 80 },
  { value: 'Good', label: 'Good', minRating: 70 },
  { value: 'Fair', label: 'Fair', minRating: 50 },
  { value: 'Poor', label: 'Poor', minRating: 40 },
  { value: 'Very Poor', label: 'Very Poor', minRating: 0 },
] as const;

export type AttributeQualityValue = typeof attributeQualities[number]['value'];

// Attribute categories
export const attributeCategories = [
  { value: 'Skills', label: 'Skills' },
  { value: 'Physical', label: 'Physical' },
  { value: 'Mental', label: 'Mental' },
] as const;

export type AttributeCategoryValue = typeof attributeCategories[number]['value'];

// Player attributes definition
export const playerAttributes = {
  skills: [
    { key: 'ballControl', label: 'Ball Control' },
    { key: 'crossing', label: 'Crossing' },
    { key: 'weakFoot', label: 'Weak Foot' },
    { key: 'dribbling', label: 'Dribbling' },
    { key: 'finishing', label: 'Finishing' },
    { key: 'freeKick', label: 'Free Kick' },
    { key: 'heading', label: 'Heading' },
    { key: 'longPassing', label: 'Long Passing' },
    { key: 'longShot', label: 'Long Shot' },
    { key: 'penalties', label: 'Penalties' },
    { key: 'shortPassing', label: 'Short Passing' },
    { key: 'shotPower', label: 'Shot Power' },
    { key: 'slidingTackle', label: 'Sliding Tackle' },
    { key: 'standingTackle', label: 'Standing Tackle' },
    { key: 'volleys', label: 'Volleys' },
  ],
  physical: [
    { key: 'acceleration', label: 'Acceleration' },
    { key: 'agility', label: 'Agility' },
    { key: 'balance', label: 'Balance' },
    { key: 'jumping', label: 'Jumping' },
    { key: 'pace', label: 'Pace' },
    { key: 'reactions', label: 'Reactions' },
    { key: 'sprintSpeed', label: 'Sprint Speed' },
    { key: 'stamina', label: 'Stamina' },
    { key: 'strength', label: 'Strength' },
  ],
  mental: [
    { key: 'aggression', label: 'Aggression' },
    { key: 'attackingPosition', label: 'Attacking Position' },
    { key: 'awareness', label: 'Awareness' },
    { key: 'communication', label: 'Communication' },
    { key: 'composure', label: 'Composure' },
    { key: 'defensivePositioning', label: 'Defensive Positioning' },
    { key: 'interceptions', label: 'Interceptions' },
    { key: 'marking', label: 'Marking' },
    { key: 'positivity', label: 'Positivity' },
    { key: 'positioning', label: 'Positioning' },
    { key: 'vision', label: 'Vision' },
  ],
} as const;

// Training focus areas
export const trainingFocusAreas = [
  { value: 'technical', label: 'Technical' },
  { value: 'tactical', label: 'Tactical' },
  { value: 'physical', label: 'Physical' },
  { value: 'mental', label: 'Mental' },
] as const;

export type TrainingFocusArea = typeof trainingFocusAreas[number]['value'];

// Match status
export const matchStatuses = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export type MatchStatus = typeof matchStatuses[number]['value'];

// Competition types (common examples)
export const competitionTypes = [
  { value: 'league', label: 'League' },
  { value: 'cup', label: 'Cup' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'training-match', label: 'Training Match' },
] as const;

export type CompetitionType = typeof competitionTypes[number]['value'];

// Helper function to get label from value
export function getLabelByValue<T extends readonly { value: string | number; label: string }[]>(
  items: T,
  value: T[number]['value']
): string {
  const item = items.find(i => i.value === value);
  return item?.label ?? String(value);
}

// Helper function to get options for select elements
export function getSelectOptions<T extends readonly { value: string | number; label: string }[]>(
  items: T
): Array<{ value: T[number]['value']; label: string }> {
  return items.map(item => ({ value: item.value, label: item.label }));
}

// Pre-built lookup objects for common use cases

// Position display mapping  
export const positionDisplay: Record<string, string> = Object.fromEntries(
  playerPositions.map(p => [p.value, p.label])
);

// Get position label
export function getPositionLabel(position: string): string {
  return positionDisplay[position] ?? position;
}

// Kit type display mapping
export const kitTypeDisplay: Record<string, string> = Object.fromEntries(
  kitTypes.map(k => [k.value, k.label])
);

// Get kit type label
export function getKitTypeLabel(type: string): string {
  return kitTypeDisplay[type] ?? type;
}

// Player directions for tactics - compass-based directions
export const playerDirections = [
  // Primary compass directions
  { value: 'N', label: 'North (Forward)', icon: '↑' },
  { value: 'S', label: 'South (Back)', icon: '↓' },
  { value: 'E', label: 'East (Right)', icon: '→' },
  { value: 'W', label: 'West (Left)', icon: '←' },
  // Diagonal directions
  { value: 'NE', label: 'North-East', icon: '↗' },
  { value: 'NW', label: 'North-West', icon: '↖' },
  { value: 'SE', label: 'South-East', icon: '↘' },
  { value: 'SW', label: 'South-West', icon: '↙' },
  // Bent/curved run directions
  { value: 'WN', label: 'West then North', icon: '↰' },
  { value: 'WS', label: 'West then South', icon: '↲' },
  { value: 'EN', label: 'East then North', icon: '↱' },
  { value: 'ES', label: 'East then South', icon: '↳' },
] as const;

export type PlayerDirectionValue = typeof playerDirections[number]['value'];

// Tactic styles
export const tacticStyles = [
  { value: 'high-press', label: 'High Press' },
  { value: 'counter-attack', label: 'Counter Attack' },
  { value: 'possession', label: 'Possession' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'defensive', label: 'Defensive' },
  { value: 'direct', label: 'Direct Play' },
] as const;

export type TacticStyleValue = typeof tacticStyles[number]['value'];

// Player direction display mapping
export const playerDirectionDisplay: Record<string, string> = Object.fromEntries(
  playerDirections.map(d => [d.value, d.label])
);

// Get player direction label
export function getPlayerDirectionLabel(direction: string): string {
  return playerDirectionDisplay[direction] ?? direction;
}

// Tactic style display mapping
export const tacticStyleDisplay: Record<string, string> = Object.fromEntries(
  tacticStyles.map(s => [s.value, s.label])
);

// Get tactic style label
export function getTacticStyleLabel(style: string): string {
  return tacticStyleDisplay[style] ?? style;
}

// Helper to get all attribute keys as a flat array
export function getAllAttributeKeys(): string[] {
  return [
    ...playerAttributes.skills.map(a => a.key),
    ...playerAttributes.physical.map(a => a.key),
    ...playerAttributes.mental.map(a => a.key),
  ];
}

// Helper to get attribute label by key
export function getAttributeLabel(key: string): string {
  const allAttributes = [
    ...playerAttributes.skills,
    ...playerAttributes.physical,
    ...playerAttributes.mental,
  ];
  const attr = allAttributes.find(a => a.key === key);
  return attr?.label ?? key;
}

// Helper to get attribute category by key
export function getAttributeCategory(key: string): 'Skills' | 'Physical' | 'Mental' | null {
  if (playerAttributes.skills.some(a => a.key === key)) return 'Skills';
  if (playerAttributes.physical.some(a => a.key === key)) return 'Physical';
  if (playerAttributes.mental.some(a => a.key === key)) return 'Mental';
  return null;
}

// Helper to determine drill/session category from attributes
export function getDominantCategory(attributeKeys: string[]): 'technical' | 'tactical' | 'physical' | 'mental' | 'mixed' {
  if (attributeKeys.length === 0) return 'mixed';
  
  const categoryCounts = {
    skills: 0,
    physical: 0,
    mental: 0,
  };
  
  attributeKeys.forEach(key => {
    if (playerAttributes.skills.some(a => a.key === key)) categoryCounts.skills++;
    if (playerAttributes.physical.some(a => a.key === key)) categoryCounts.physical++;
    if (playerAttributes.mental.some(a => a.key === key)) categoryCounts.mental++;
  });
  
  const total = attributeKeys.length;
  const skillsPercent = categoryCounts.skills / total;
  const physicalPercent = categoryCounts.physical / total;
  const mentalPercent = categoryCounts.mental / total;
  
  // If one category dominates (>60%), return that category
  if (skillsPercent > 0.6) return 'technical';
  if (physicalPercent > 0.6) return 'physical';
  if (mentalPercent > 0.6) {
    // Mental attributes can indicate tactical or mental training
    // Check for tactical indicators
    const tacticalAttributes = ['attackingPosition', 'defensivePositioning', 'positioning', 'vision', 'awareness'];
    const hasTactical = attributeKeys.some(key => tacticalAttributes.includes(key));
    if (hasTactical && mentalPercent > 0.5) return 'tactical';
    return 'mental';
  }
  
  // Mixed if no clear dominant category
  return 'mixed';
}

// ============================================================================
// Development Plan (re-exported from dedicated module)
// ============================================================================
export {
  developmentPlanStatuses,
  type DevelopmentPlanStatus,
  developmentPlanStatusDisplay,
  getDevelopmentPlanStatusLabel,
  developmentPlanSortOptions,
  type DevelopmentPlanSortOption,
} from './developmentPlanConstants';

// ============================================================================
// Training Session Statuses
// ============================================================================

// Training session status
export const trainingSessionStatuses = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export type TrainingSessionStatus = typeof trainingSessionStatuses[number]['value'];

// Training session status display mapping
export const trainingSessionStatusDisplay: Record<string, string> = Object.fromEntries(
  trainingSessionStatuses.map(s => [s.value, s.label])
);

// Get training session status label
export function getTrainingSessionStatusLabel(status: string): string {
  return trainingSessionStatusDisplay[status] ?? status;
}

// Objective/goal status (used in training plans)
export const objectiveStatuses = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const;

export type ObjectiveStatus = typeof objectiveStatuses[number]['value'];

// ============================================================================
// Link Types (for drills, training sessions, etc.)
// ============================================================================

export const linkTypes = [
  { value: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { value: 'tiktok', label: 'TikTok', icon: 'TikTok' },
  { value: 'website', label: 'Website', icon: 'Globe' },
  { value: 'other', label: 'Other', icon: 'ExternalLink' },
] as const;

export type LinkTypeValue = typeof linkTypes[number]['value'];

// Link type display mapping
export const linkTypeDisplay: Record<string, string> = Object.fromEntries(
  linkTypes.map(l => [l.value, l.label])
);

// Get link type label
export function getLinkTypeLabel(type: string): string {
  return linkTypeDisplay[type] ?? type;
}

// ============================================================================
// Notification Types
// ============================================================================

export const notificationTypes = [
  { value: 'match', label: 'Match', icon: 'Trophy', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400' },
  { value: 'training', label: 'Training', icon: 'Calendar', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400' },
  { value: 'team', label: 'Team', icon: 'Users', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400' },
  { value: 'announcement', label: 'Announcement', icon: 'Megaphone', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-400' },
  { value: 'message', label: 'Message', icon: 'MessageSquare', bgColor: 'bg-pink-100 dark:bg-pink-900/30', textColor: 'text-pink-700 dark:text-pink-400' },
] as const;

export type NotificationType = typeof notificationTypes[number]['value'];

// Notification type display mapping
export const notificationTypeDisplay: Record<string, string> = Object.fromEntries(
  notificationTypes.map(n => [n.value, n.label])
);

// Get notification type label
export function getNotificationTypeLabel(type: string): string {
  return notificationTypeDisplay[type] ?? type;
}

// Get notification type colors
export function getNotificationTypeColors(type: string): { bgColor: string; textColor: string } {
  const notificationType = notificationTypes.find(n => n.value === type);
  return {
    bgColor: notificationType?.bgColor ?? 'bg-gray-100 dark:bg-gray-900/30',
    textColor: notificationType?.textColor ?? 'text-gray-700 dark:text-gray-400',
  };
}

// ============================================================================
// Drill Categories
// ============================================================================

export const drillCategories = [
  { value: 'technical', label: 'Technical', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-800 dark:text-blue-300' },
  { value: 'tactical', label: 'Tactical', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-800 dark:text-purple-300' },
  { value: 'physical', label: 'Physical', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-800 dark:text-orange-300' },
  { value: 'mental', label: 'Mental', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-800 dark:text-green-300' },
  { value: 'mixed', label: 'Mixed', bgColor: 'bg-gray-100 dark:bg-gray-900/30', textColor: 'text-gray-800 dark:text-gray-300' },
] as const;

export type DrillCategory = typeof drillCategories[number]['value'];

// Drill category display mapping
export const drillCategoryDisplay: Record<string, string> = Object.fromEntries(
  drillCategories.map(c => [c.value, c.label])
);

// Get drill category label
export function getDrillCategoryLabel(category: string): string {
  return drillCategoryDisplay[category] ?? category;
}

// Get drill category colors
export function getDrillCategoryColors(category: string): { bgColor: string; textColor: string } {
  const drillCategory = drillCategories.find(c => c.value === category);
  return {
    bgColor: drillCategory?.bgColor ?? 'bg-gray-100 dark:bg-gray-900/30',
    textColor: drillCategory?.textColor ?? 'text-gray-800 dark:text-gray-300',
  };
}

// ============================================================================
// Sort Options (for lists)
// ============================================================================

export const reportCardSortOptions = [
  { value: 'date', label: 'Most Recent' },
  { value: 'rating', label: 'Highest Rating' },
] as const;

export type ReportCardSortOption = typeof reportCardSortOptions[number]['value'];

// ============================================================================
// Session Duration Options (for training sessions)
// ============================================================================

export const sessionDurations = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes (1 hour)' },
  { value: 75, label: '75 minutes' },
  { value: 90, label: '90 minutes (1.5 hours)' },
  { value: 120, label: '120 minutes (2 hours)' },
] as const;

export type SessionDurationValue = typeof sessionDurations[number]['value'];

// ============================================================================
// Theme Options
// ============================================================================

export const themeOptions = [
  { value: 'light', label: 'Light', icon: 'Sun' },
  { value: 'dark', label: 'Dark', icon: 'Moon' },
  { value: 'system', label: 'System', icon: 'Monitor' },
] as const;

export type ThemeOption = typeof themeOptions[number]['value'];
