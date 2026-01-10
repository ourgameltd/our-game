import { Club, Team } from '@/types';

interface GradientColors {
  primaryColor: string;
  secondaryColor: string;
}

/**
 * Converts a hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculates the relative luminance of a color
 * Based on WCAG guidelines: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculates the contrast ratio between two colors
 * Based on WCAG guidelines: https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
const getContrastRatio = (luminance1: number, luminance2: number): number => {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Determines if white or black text provides better contrast on a given background color
 * Returns 'white' or 'black' based on WCAG AA standard (4.5:1 contrast ratio)
 */
export const getContrastTextColor = (backgroundColor: string): 'white' | 'black' => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return 'white'; // Default fallback
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  // Luminance of white is 1, black is 0
  const whiteLuminance = 1;
  const blackLuminance = 0;
  
  const contrastWithWhite = getContrastRatio(luminance, whiteLuminance);
  const contrastWithBlack = getContrastRatio(luminance, blackLuminance);
  
  // Return the color with better contrast
  return contrastWithWhite > contrastWithBlack ? 'white' : 'black';
};

/**
 * Gets the appropriate text color class for Tailwind based on background color
 */
export const getContrastTextColorClass = (backgroundColor: string): string => {
  const textColor = getContrastTextColor(backgroundColor);
  return textColor === 'white' ? 'text-white' : 'text-black';
};

/**
 * Gets gradient colors with fallback priority:
 * 1. Team's home kit shirt color (if team provided)
 * 2. Team's primary color (if team provided)
 * 3. Club's home kit shirt color
 * 4. Club's primary color
 * 5. Default gray
 */
export const getGradientColors = (club: Club, team?: Team): GradientColors => {
  // Try team's home kit first
  const teamHomeKit = team?.kits?.find(kit => kit.type === 'home' && kit.isActive);
  
  // Try club's home kit
  const clubHomeKit = club?.kits?.find(kit => kit.type === 'home' && kit.isActive);
  
  // Primary color fallback chain
  const primaryColor = teamHomeKit?.shirtColor 
    || clubHomeKit?.shirtColor 
    || '#1F2937';
  
  // Secondary color fallback chain
  const secondaryColor = teamHomeKit?.shortsColor 
    || clubHomeKit?.shortsColor 
    || '#FFFFFF';
  
  return { primaryColor, secondaryColor };
};

/**
 * Gets the appropriate color class for performance metrics (goal difference, win rate, etc.)
 * @param value - The numeric value to evaluate
 * @param type - The type of metric ('goalDifference' | 'winRate')
 * @returns Tailwind CSS color classes for both light and dark mode
 */
export const getPerformanceColorClass = (value: number, type: 'goalDifference' | 'winRate' = 'goalDifference'): string => {
  if (type === 'goalDifference') {
    return value >= 0 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  }
  
  if (type === 'winRate') {
    if (value >= 60) return 'text-green-600 dark:text-green-400';
    if (value >= 40) return 'text-primary-600 dark:text-primary-400';
    return 'text-red-600 dark:text-red-400';
  }
  
  return 'text-gray-900 dark:text-white';
};
