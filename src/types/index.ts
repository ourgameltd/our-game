// Squad Size Types
export type SquadSize = 4 | 5 | 7 | 9 | 11;

// Kit Types
export interface Kit {
  id: string;
  name: string; // e.g., 'Home Kit', 'Away Kit', 'Third Kit'
  type: 'home' | 'away' | 'third' | 'goalkeeper' | 'training';
  shirtColor: string; // Hex color
  shortsColor: string; // Hex color
  socksColor: string; // Hex color
  season?: string;
  isActive: boolean;
}

// Club Types
export interface Club {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  location: {
    city: string;
    country: string;
    venue: string;
    address?: string;
  };
  founded: number;
  history?: string;
  ethos?: string;
  principles?: string[];
  kits?: Kit[]; // Club-level kit definitions
}

// Age Group Types
export interface AgeGroup {
  id: string;
  clubId: string;
  name: string; // e.g., '2014s', '2013s', 'Reserves', 'Senior'
  code: string; // e.g., '2014', '2013', 'reserve', 'senior'
  level: 'youth' | 'amateur' | 'reserve' | 'senior';
  season: string; // Kept for backward compatibility
  seasons?: string[]; // List of available seasons (e.g., ['2024/25', '2023/24'])
  defaultSeason?: string; // The default season for new matches
  defaultSquadSize?: SquadSize; // The default squad size for new matches (5, 7, 9, or 11)
  description?: string;
  coordinatorIds?: string[]; // Age group coordinators
  isArchived?: boolean; // Whether the age group is archived
}

// Team Types
export interface Team {
  id: string;
  clubId: string;
  ageGroupId: string; // References AgeGroup.id
  name: string; // e.g., 'Reds', 'Blues', 'Whites'
  shortName?: string; // Short abbreviation for the team
  level: 'youth' | 'amateur' | 'reserve' | 'senior';
  season: string;
  coachIds: string[];
  playerIds: string[];
  formationId?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  kits?: Kit[]; // Team-specific kits, falls back to club kits if not defined
  isArchived?: boolean; // Whether the team is archived
}

// Player Types
export type PlayerPosition = 
  | 'GK' 
  | 'LB' | 'CB' | 'RB' 
  | 'LWB' | 'RWB'
  | 'CDM' | 'CM' | 'CAM'
  | 'LM' | 'RM'
  | 'LW' | 'RW'
  | 'CF' | 'ST';

// EA Sports FC Style Attribute Categories
export type AttributeCategory = 'Physical' | 'Mental' | 'Skills';

// Quality levels based on EA Sports FC rating scale
export type AttributeQuality = 
  | 'Excellent'      // 90-99
  | 'Very Good'      // 80-89
  | 'Good'           // 70-79
  | 'Fair'           // 50-69
  | 'Poor'           // 40-49
  | 'Very Poor';     // 0-39

// Individual attribute definition
export interface PlayerAttribute {
  name: string;
  category: AttributeCategory;
  rating: number; // 0-99 (EA Sports FC scale)
  quality: AttributeQuality;
}

// Historical tracking of attribute changes
export interface AttributeEvaluation {
  id: string;
  playerId: string;
  evaluatedBy: string; // Coach/Staff ID
  evaluatedAt: Date;
  attributes: {
    name: string;
    rating: number; // 0-99
    notes?: string;
  }[];
  overallRating: number; // Calculated from attributes
  coachNotes?: string;
  period?: {
    start: Date;
    end: Date;
  };
}

// Complete player attributes structure (EA Sports FC style)
export interface PlayerAttributes {
  // Skills
  ballControl: number;
  crossing: number;
  weakFoot: number;
  dribbling: number;
  finishing: number;
  freeKick: number;
  heading: number;
  longPassing: number;
  longShot: number;
  penalties: number;
  shortPassing: number;
  shotPower: number;
  slidingTackle: number;
  standingTackle: number;
  volleys: number;
  
  // Physical
  acceleration: number;
  agility: number;
  balance: number;
  jumping: number;
  pace: number;
  reactions: number;
  sprintSpeed: number;
  stamina: number;
  strength: number;
  
  // Mental
  aggression: number;
  attackingPosition: number;
  awareness: number;
  communication: number;
  composure: number;
  defensivePositioning: number;
  interceptions: number;
  marking: number;
  positivity: number;
  positioning: number;
  vision: number;
}

// Grouped attributes for display
export interface GroupedAttributes {
  skills: PlayerAttribute[];
  physical: PlayerAttribute[];
  mental: PlayerAttribute[];
}

// Player Image Types
export interface PlayerImage {
  id: string;
  url: string;
  caption?: string;
  date: Date;
  uploadedBy?: string; // User ID who uploaded
  tags?: string[]; // e.g., 'training', 'match', 'award', 'team'
}

export interface Player {
  id: string;
  clubId: string; // Players belong to a club
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: Date;
  photo?: string;
  associationId?: string; // FA, UEFA, or other football association registration ID
  preferredPositions: PlayerPosition[];
  attributes: PlayerAttributes;
  overallRating: number; // Calculated from attributes
  evaluations: AttributeEvaluation[]; // Historical tracking
  ageGroupIds: string[]; // Primary age group(s) the player belongs to
  teamIds: string[]; // Specific teams the player is assigned to
  parentIds?: string[];
  album?: PlayerImage[]; // Player's image album
  medicalInfo?: {
    allergies?: string[];
    conditions?: string[];
    emergencyContacts?: {
      id: string;
      name: string;
      phone: string;
      relationship: string;
      isPrimary?: boolean;
    }[];
  };
  isArchived?: boolean; // Whether the player is archived
}

// Staff Types
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: 'coach' | 'assistant-coach' | 'physio' | 'manager' | 'admin';
  photo?: string;
  certifications: Certification[];
  teamIds: string[];
  email: string;
  phone: string;
}

export interface Certification {
  name: string;
  issuer: string;
  dateIssued: Date;
  expiryDate?: Date;
  certificateUrl?: string;
}

// Coach Types
export interface Coach {
  id: string;
  clubId: string; // Coaches belong to a club
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  photo?: string;
  email: string;
  phone: string;
  associationId?: string; // FA, UEFA, or other football association registration ID
  hasAccount?: boolean; // Whether the coach has been associated with an account in the backend IDP
  teamIds: string[]; // Can be assigned to multiple teams
  role: 'head-coach' | 'assistant-coach' | 'goalkeeper-coach' | 'fitness-coach' | 'technical-coach';
  biography?: string;
  specializations?: string[]; // e.g., ['Youth Development', 'Tactical Analysis', 'Goalkeeping']
  isArchived?: boolean; // Whether the coach is archived
}

// Match Types
export interface Match {
  id: string;
  teamId: string;
  seasonId?: string; // Season identifier (e.g., '2024/25')
  squadSize?: SquadSize; // Number of players per side (5, 7, 9, or 11)
  opposition: string;
  date: Date; // Kick off date and time
  meetTime?: Date; // Team meet time before the match
  kickOffTime: Date; // Kick off date and time (same as date, for clarity)
  location: string;
  isHome: boolean;
  competition: string;
  kit?: {
    primary: string; // Kit ID (references Kit.id)
    secondary?: string;
    goalkeeper?: string; // Goalkeeper kit ID (references Kit.id)
  };
  score?: {
    home: number;
    away: number;
  };
  lineup?: MatchLineup;
  report?: MatchReport;
  weather?: {
    condition: string;
    temperature: number;
  };
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  isLocked?: boolean; // Whether the match is locked from editing
  coachIds?: string[]; // Coaches assigned to this match
  notes?: string; // Additional notes/details about the match
}

export interface MatchLineup {
  formationId: string;
  starting: { playerId: string; position: PlayerPosition }[];
  substitutes: string[];
  substitutions?: {
    minute: number;
    playerOut: string;
    playerIn: string;
  }[];
}

export interface MatchReport {
  summary: string;
  goalScorers?: { playerId: string; minute: number; assist?: string }[];
  cards?: {
    playerId: string;
    type: 'yellow' | 'red';
    minute: number;
    reason?: string;
  }[];
  injuries?: {
    playerId: string;
    minute: number;
    description: string;
    severity: 'minor' | 'moderate' | 'serious';
  }[];
  performanceRatings?: { playerId: string; rating: number }[]; // Rating out of 10 with decimals
  playerOfTheMatch?: string; // playerId
}

// Training Types
export interface TrainingSession {
  id: string;
  teamId: string;
  date: Date;
  meetTime?: Date; // Team meet time before the session
  duration: number; // minutes
  location: string;
  focusAreas: string[];
  drillIds: string[];
  coachIds?: string[]; // Coaches assigned to this session
  attendance?: {
    playerId: string;
    present: boolean;
    notes?: string;
  }[];
  notes?: string; // Free text area for session plan and additional details
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  isLocked?: boolean; // Whether the session is locked from editing
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  category: 'technical' | 'tactical' | 'physical' | 'mental';
  skillsFocused: string[];
  equipment: string[];
  diagram?: string;
  instructions: string[];
  variations?: string[];
}

// Formation Types
export interface Formation {
  id: string;
  name: string;
  system: string; // e.g., "4-4-2", "4-3-3", "2-1-1" (5-a-side), "2-3-1" (7-a-side)
  squadSize: SquadSize; // Number of players per side (5, 7, 9, or 11)
  positions: {
    position: PlayerPosition;
    x: number; // 0-100 (percentage of field width)
    y: number; // 0-100 (percentage of field length)
  }[];
  description?: string;
  tactics?: string[];
}

// Tactics Types

/**
 * Player directional tendency for tactical positioning using compass directions
 * Primary directions: N (North/Up), S (South/Down), E (East/Right), W (West/Left)
 * Diagonal directions: NE, NW, SE, SW
 * Bent directions (for runs): WN, WS, EN, ES (start direction then curve)
 */
export type PlayerDirection = 
  | 'N' | 'S' | 'E' | 'W'           // Primary compass directions
  | 'NE' | 'NW' | 'SE' | 'SW'       // Diagonal directions
  | 'WN' | 'WS' | 'EN' | 'ES';     // Bent/curved run directions

/**
 * Override specific position attributes in a tactic
 * Only position and direction can be customized
 */
export interface TacticalPositionOverride {
  /** Override x position (0-100 percentage of field width) */
  x?: number;
  /** Override y position (0-100 percentage of field length) */
  y?: number;
  /** Override player directional tendency */
  direction?: PlayerDirection;
}

/**
 * A tactical principle that can be associated with players
 * Principles define team objectives and responsibilities
 */
export interface TacticPrinciple {
  /** Unique identifier for the principle */
  id: string;
  /** Short title for the principle (e.g., "Press High", "Hold Line") */
  title: string;
  /** Detailed description of what this principle means */
  description: string;
  /** Position indices that this principle applies to (empty = all players) */
  positionIndices: number[];
}

/**
 * Defines the scope/hierarchy level where a tactic applies
 * - club: Available to all teams in the club
 * - ageGroup: Available to all teams in a specific age group
 * - team: Available only to a specific team
 */
export type TacticScope = 
  | { type: 'club'; clubId: string }
  | { type: 'ageGroup'; clubId: string; ageGroupId: string }
  | { type: 'team'; clubId: string; ageGroupId: string; teamId: string };

/**
 * Tactic extends a base Formation with specific tactical instructions
 * Supports inheritance chain: Formation -> Tactic -> Tactic (optional)
 * Only stores overrides/changes from parent, enabling efficient inheritance
 */
export interface Tactic {
  /** Unique identifier for the tactic */
  id: string;
  /** Display name of the tactic */
  name: string;
  /** Reference to the base Formation this tactic extends */
  parentFormationId: string;
  /** Optional parent tactic for multi-level inheritance */
  parentTacticId?: string;
  /** Number of players per side (4, 5, 7, 9, or 11) - must match parent formation */
  squadSize: SquadSize;
  
  /** Position-specific overrides (only changed values stored) */
  positionOverrides: Record<number, TacticalPositionOverride>;
  
  /** Tactical principles with associated players */
  principles: TacticPrinciple[];
  
  /** Summary description of the tactic in Markdown format */
  summary: string;
  /** Playing style descriptor (e.g., "High Press", "Counter Attack", "Possession") */
  style?: string;
  
  /** Scope defining where this tactic is available */
  scope: TacticScope;
  /** User ID of the creator */
  createdBy: string;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
  
  /** Optional tags for categorization and search */
  tags?: string[];
}

// User Types
export type UserRole = 'admin' | 'coach' | 'player' | 'parent' | 'fan';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clubId?: string;
  playerId?: string;
  staffId?: string;
  childrenIds?: string[]; // For parents
  photo?: string;
  preferences?: {
    notifications: boolean;
    theme?: 'light' | 'dark';
    navigationStyle?: 'classic' | 'modern'; // Feature flag for navigation
  };
}

// Statistics Types
export interface GroupStatistics {
  goalDifference: number;
  playerCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number; // Percentage
  upcomingMatches: Match[];
  previousResults: Match[];
  topPerformers: {
    playerId: string;
    averageRating: number;
    matchesPlayed: number;
  }[];
  underperforming: {
    playerId: string;
    averageRating: number;
    matchesPlayed: number;
  }[];
}

// Development Plan Types
export interface DevelopmentPlan {
  id: string;
  playerId: string;
  createdBy: string;
  createdAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  status: 'active' | 'completed' | 'archived';
  title: string;
  description: string;
  goals: {
    id: string;
    goal: string;
    actions: string[];
    startDate: Date;
    targetDate: Date;
    completed: boolean;
    completedDate?: Date;
    progress: number; // 0-100
  }[];
  coachNotes?: string;
  linkedReportCardId?: string; // Optional link to a report card
}

// Report Types
export interface PlayerReport {
  id: string;
  playerId: string;
  period: {
    start: Date;
    end: Date;
  };
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  developmentActions: {
    id: string;
    goal: string;
    actions: string[];
    startDate: Date;
    targetDate: Date;
    completed: boolean;
    completedDate?: Date;
  }[];
  coachComments: string;
  createdBy: string;
  createdAt: Date;
  similarProfessionalPlayers?: {
    name: string;
    team: string;
    position: string;
    reason: string;
  }[];
}

// Training Plan Types
export interface TrainingPlan {
  id: string;
  playerId: string;
  createdBy: string;
  createdAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  status: 'active' | 'completed' | 'archived';
  objectives: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    targetDate: Date;
    status: 'not-started' | 'in-progress' | 'completed';
    progress: number; // 0-100
    completed: boolean;
    completedDate?: Date;
  }[];
  sessions: {
    id: string;
    title: string;
    date: Date;
    drillIds: string[];
    focusAreas: string[];
    completed: boolean;
    notes?: string;
  }[];
  progressNotes: {
    date: Date;
    note: string;
    addedBy: string;
  }[];
}

// Kit Order Types
export interface KitOrder {
  id: string;
  playerId: string;
  teamId: string;
  items: {
    type: 'shirt' | 'shorts' | 'socks' | 'tracksuit' | 'training-kit';
    size: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered';
  orderedBy: string;
  orderedAt: Date;
}
