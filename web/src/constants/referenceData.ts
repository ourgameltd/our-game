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
