/**
 * Reference Data
 * 
 * This file contains all lookup/reference data that should be centralized
 * for consistency across the application and eventual API migration.
 */

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

// Kit types
export const kitTypes = [
  { value: 'home', label: 'Home' },
  { value: 'away', label: 'Away' },
  { value: 'third', label: 'Third' },
  { value: 'goalkeeper', label: 'Goalkeeper' },
  { value: 'training', label: 'Training' },
] as const;

export type KitTypeValue = typeof kitTypes[number]['value'];

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

// Coach roles
export const coachRoles = [
  { value: 'head-coach', label: 'Head Coach' },
  { value: 'assistant-coach', label: 'Assistant Coach' },
  { value: 'goalkeeper-coach', label: 'Goalkeeper Coach' },
  { value: 'fitness-coach', label: 'Fitness Coach' },
  { value: 'technical-coach', label: 'Technical Coach' },
] as const;

export type CoachRoleValue = typeof coachRoles[number]['value'];

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

// Coach role display mapping
export const coachRoleDisplay: Record<string, string> = Object.fromEntries(
  coachRoles.map(r => [r.value, r.label])
);

// Get coach role label
export function getCoachRoleLabel(role: string): string {
  return coachRoleDisplay[role] ?? role;
}

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
