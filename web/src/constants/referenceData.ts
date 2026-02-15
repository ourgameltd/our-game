/**
 * Shared Constants - Team Levels & Squad Sizes
 *
 * Static reference data used across the application for age group
 * configuration and game format options.
 */

// Team/Age Group levels
export const teamLevels = [
  { value: 'youth', label: 'Youth' },
  { value: 'amateur', label: 'Amateur' },
  { value: 'reserve', label: 'Reserve' },
  { value: 'senior', label: 'Senior' },
] as const;

export type TeamLevel = typeof teamLevels[number]['value'];
export type AgeGroupLevel = TeamLevel;

// Squad sizes for different game formats
export const squadSizes = [
  { value: 4, label: '4-a-side' },
  { value: 5, label: '5-a-side' },
  { value: 7, label: '7-a-side' },
  { value: 9, label: '9-a-side' },
  { value: 11, label: '11-a-side' },
] as const;

export type SquadSizeValue = typeof squadSizes[number]['value'];

// Weather conditions for matches
export const weatherConditions = [
  { value: 'clear', label: 'Clear' },
  { value: 'partly-cloudy', label: 'Partly Cloudy' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'heavy-rain', label: 'Heavy Rain' },
  { value: 'windy', label: 'Windy' },
  { value: 'snowy', label: 'Snowy' },
] as const;

export type WeatherCondition = typeof weatherConditions[number]['value'];

// Card types for match events
export const cardTypes = [
  { value: 'yellow', label: 'Yellow' },
  { value: 'red', label: 'Red' },
] as const;

export type CardType = typeof cardTypes[number]['value'];

// Injury severity levels
export const injurySeverities = [
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'serious', label: 'Serious' },
] as const;

export type InjurySeverity = typeof injurySeverities[number]['value'];

// Coach roles
export const coachRoles = [
  { value: 'head-coach', label: 'Head Coach' },
  { value: 'assistant-coach', label: 'Assistant Coach' },
  { value: 'goalkeeper-coach', label: 'Goalkeeper Coach' },
  { value: 'fitness-coach', label: 'Fitness Coach' },
  { value: 'technical-coach', label: 'Technical Coach' },
] as const;

export type CoachRoleValue = typeof coachRoles[number]['value'];

// Player attributes definition (EA FC style - 35 attributes)
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

// Helper to get attribute category by key
export function getAttributeCategory(key: string): 'Skills' | 'Physical' | 'Mental' | null {
  if (playerAttributes.skills.some(a => a.key === key)) return 'Skills';
  if (playerAttributes.physical.some(a => a.key === key)) return 'Physical';
  if (playerAttributes.mental.some(a => a.key === key)) return 'Mental';
  return null;
}

// Link types (for drills, training sessions, etc.)
export const linkTypes = [
  { value: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { value: 'tiktok', label: 'TikTok', icon: 'TikTok' },
  { value: 'website', label: 'Website', icon: 'Globe' },
  { value: 'other', label: 'Other', icon: 'ExternalLink' },
] as const;

export type LinkTypeValue = typeof linkTypes[number]['value'];

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

// Drill categories
export const drillCategories = [
  { value: 'technical', label: 'Technical', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-800 dark:text-blue-300' },
  { value: 'tactical', label: 'Tactical', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-800 dark:text-purple-300' },
  { value: 'physical', label: 'Physical', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-800 dark:text-orange-300' },
  { value: 'mental', label: 'Mental', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-800 dark:text-green-300' },
  { value: 'mixed', label: 'Mixed', bgColor: 'bg-gray-100 dark:bg-gray-900/30', textColor: 'text-gray-800 dark:text-gray-300' },
] as const;

export type DrillCategory = typeof drillCategories[number]['value'];

// Get drill category colors
export function getDrillCategoryColors(category: string): { bgColor: string; textColor: string } {
  const drillCategory = drillCategories.find(c => c.value === category);
  return {
    bgColor: drillCategory?.bgColor ?? 'bg-gray-100 dark:bg-gray-900/30',
    textColor: drillCategory?.textColor ?? 'text-gray-800 dark:text-gray-300',
  };
}
