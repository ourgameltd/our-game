import { 
  PlayerAttributes, 
  PlayerAttribute, 
  GroupedAttributes, 
  AttributeQuality,
  AttributeCategory 
} from '../types/index';

/**
 * Get the quality level based on EA Sports FC rating scale
 */
export function getAttributeQuality(rating: number): AttributeQuality {
  if (rating >= 90) return 'Excellent';
  if (rating >= 80) return 'Very Good';
  if (rating >= 70) return 'Good';
  if (rating >= 50) return 'Fair';
  if (rating >= 40) return 'Poor';
  return 'Very Poor';
}

/**
 * Get quality color for display
 */
export function getQualityColor(quality: AttributeQuality): string {
  switch (quality) {
    case 'Excellent': return 'text-green-600 dark:text-green-400';
    case 'Very Good': return 'text-blue-600 dark:text-blue-400';
    case 'Good': return 'text-cyan-600 dark:text-cyan-400';
    case 'Fair': return 'text-yellow-600 dark:text-yellow-400';
    case 'Poor': return 'text-orange-600 dark:text-orange-400';
    case 'Very Poor': return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Calculate overall rating from player attributes
 * This is a simplified calculation - you can adjust weights based on position
 */
export function calculateOverallRating(attributes: PlayerAttributes): number {
  const allRatings = Object.values(attributes);
  const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round(sum / allRatings.length);
}

/**
 * Calculate overall rating for a specific position
 * Different positions weight attributes differently
 */
export function calculatePositionRating(
  attributes: PlayerAttributes, 
  position: string
): number {
  // Position-specific weights (simplified example)
  const weights: Record<string, Partial<Record<keyof PlayerAttributes, number>>> = {
    GK: {
      reactions: 3,
      positioning: 3,
      composure: 2,
      agility: 2,
    },
    CB: {
      marking: 3,
      standingTackle: 3,
      heading: 2,
      strength: 2,
      awareness: 2,
    },
    CM: {
      shortPassing: 3,
      longPassing: 2,
      vision: 2,
      stamina: 2,
      ballControl: 2,
    },
    ST: {
      finishing: 3,
      shotPower: 2,
      positioning: 2,
      acceleration: 2,
      heading: 1,
    },
    // Add more positions as needed
  };

  const positionWeights = weights[position] || {};
  
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(attributes).forEach(([key, value]) => {
    const weight = positionWeights[key as keyof PlayerAttributes] || 1;
    weightedSum += value * weight;
    totalWeight += weight;
  });

  return Math.round(weightedSum / totalWeight);
}

/**
 * Group attributes by category for display
 */
export function groupAttributes(attributes: PlayerAttributes): GroupedAttributes {
  const createAttribute = (
    name: string, 
    rating: number, 
    category: AttributeCategory
  ): PlayerAttribute => ({
    name,
    category,
    rating,
    quality: getAttributeQuality(rating)
  });

  return {
    skills: [
      createAttribute('Ball Control', attributes.ballControl, 'Skills'),
      createAttribute('Crossing', attributes.crossing, 'Skills'),
      createAttribute('Weak Foot', attributes.weakFoot, 'Skills'),
      createAttribute('Dribbling', attributes.dribbling, 'Skills'),
      createAttribute('Finishing', attributes.finishing, 'Skills'),
      createAttribute('Free Kick', attributes.freeKick, 'Skills'),
      createAttribute('Heading', attributes.heading, 'Skills'),
      createAttribute('Long Passing', attributes.longPassing, 'Skills'),
      createAttribute('Long Shot', attributes.longShot, 'Skills'),
      createAttribute('Penalties', attributes.penalties, 'Skills'),
      createAttribute('Short Passing', attributes.shortPassing, 'Skills'),
      createAttribute('Shot Power', attributes.shotPower, 'Skills'),
      createAttribute('Sliding Tackle', attributes.slidingTackle, 'Skills'),
      createAttribute('Standing Tackle', attributes.standingTackle, 'Skills'),
      createAttribute('Volleys', attributes.volleys, 'Skills'),
    ],
    physical: [
      createAttribute('Acceleration', attributes.acceleration, 'Physical'),
      createAttribute('Agility', attributes.agility, 'Physical'),
      createAttribute('Balance', attributes.balance, 'Physical'),
      createAttribute('Jumping', attributes.jumping, 'Physical'),
      createAttribute('Pace', attributes.pace, 'Physical'),
      createAttribute('Reactions', attributes.reactions, 'Physical'),
      createAttribute('Sprint Speed', attributes.sprintSpeed, 'Physical'),
      createAttribute('Stamina', attributes.stamina, 'Physical'),
      createAttribute('Strength', attributes.strength, 'Physical'),
    ],
    mental: [
      createAttribute('Aggression', attributes.aggression, 'Mental'),
      createAttribute('Attacking Position', attributes.attackingPosition, 'Mental'),
      createAttribute('Awareness', attributes.awareness, 'Mental'),
      createAttribute('Composure', attributes.composure, 'Mental'),
      createAttribute('Defensive Positioning', attributes.defensivePositioning, 'Mental'),
      createAttribute('Interceptions', attributes.interceptions, 'Mental'),
      createAttribute('Marking', attributes.marking, 'Mental'),
      createAttribute('Positioning', attributes.positioning, 'Mental'),
      createAttribute('Vision', attributes.vision, 'Mental'),
    ]
  };
}

/**
 * Create default attributes for a new player (age-appropriate)
 */
export function createDefaultAttributes(ageInYears: number): PlayerAttributes {
  // Base rating adjusted for age (youth players start lower)
  const baseRating = ageInYears < 12 ? 45 : ageInYears < 16 ? 55 : 60;
  const variance = 10; // Random variance

  const randomRating = () => 
    Math.max(0, Math.min(99, baseRating + Math.floor(Math.random() * variance * 2) - variance));

  return {
    // Skills
    ballControl: randomRating(),
    crossing: randomRating(),
    weakFoot: randomRating(),
    dribbling: randomRating(),
    finishing: randomRating(),
    freeKick: randomRating(),
    heading: randomRating(),
    longPassing: randomRating(),
    longShot: randomRating(),
    penalties: randomRating(),
    shortPassing: randomRating(),
    shotPower: randomRating(),
    slidingTackle: randomRating(),
    standingTackle: randomRating(),
    volleys: randomRating(),
    
    // Physical
    acceleration: randomRating(),
    agility: randomRating(),
    balance: randomRating(),
    jumping: randomRating(),
    pace: randomRating(),
    reactions: randomRating(),
    sprintSpeed: randomRating(),
    stamina: randomRating(),
    strength: randomRating(),
    
    // Mental
    aggression: randomRating(),
    attackingPosition: randomRating(),
    awareness: randomRating(),
    composure: randomRating(),
    defensivePositioning: randomRating(),
    interceptions: randomRating(),
    marking: randomRating(),
    positioning: randomRating(),
    vision: randomRating(),
  };
}

/**
 * Get the top N attributes for a player
 */
export function getTopAttributes(
  attributes: PlayerAttributes, 
  count: number = 3
): PlayerAttribute[] {
  const grouped = groupAttributes(attributes);
  const allAttributes = [
    ...grouped.skills,
    ...grouped.physical,
    ...grouped.mental
  ];
  
  return allAttributes
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

/**
 * Get attributes that need improvement
 */
export function getWeakAttributes(
  attributes: PlayerAttributes, 
  count: number = 3
): PlayerAttribute[] {
  const grouped = groupAttributes(attributes);
  const allAttributes = [
    ...grouped.skills,
    ...grouped.physical,
    ...grouped.mental
  ];
  
  return allAttributes
    .sort((a, b) => a.rating - b.rating)
    .slice(0, count);
}

/**
 * Calculate attribute improvement between two evaluations
 */
export function calculateAttributeChange(
  oldRating: number,
  newRating: number
): { change: number; percentage: number; improved: boolean } {
  const change = newRating - oldRating;
  const percentage = oldRating > 0 ? (change / oldRating) * 100 : 0;
  
  return {
    change,
    percentage,
    improved: change > 0
  };
}
