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
}

// Age Group Types
export interface AgeGroup {
  id: string;
  clubId: string;
  name: string; // e.g., '2014s', '2013s', 'Reserves', 'Senior'
  code: string; // e.g., '2014', '2013', 'reserve', 'senior'
  level: 'youth' | 'amateur' | 'reserve' | 'senior';
  season: string;
  description?: string;
  coordinatorIds?: string[]; // Age group coordinators
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
  composure: number;
  defensivePositioning: number;
  interceptions: number;
  marking: number;
  positioning: number;
  vision: number;
}

// Grouped attributes for display
export interface GroupedAttributes {
  skills: PlayerAttribute[];
  physical: PlayerAttribute[];
  mental: PlayerAttribute[];
}

export interface Player {
  id: string;
  clubId: string; // Players belong to a club
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  photo?: string;
  preferredPositions: PlayerPosition[];
  attributes: PlayerAttributes;
  overallRating: number; // Calculated from attributes
  evaluations: AttributeEvaluation[]; // Historical tracking
  teamIds: string[]; // Can be assigned to multiple teams
  parentIds?: string[];
  medicalInfo?: {
    allergies?: string[];
    conditions?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
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

// Match Types
export interface Match {
  id: string;
  teamId: string;
  opposition: string;
  date: Date;
  location: string;
  isHome: boolean;
  competition: string;
  kit?: {
    primary: string; // Kit color/description
    secondary?: string;
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
  duration: number; // minutes
  location: string;
  focusAreas: string[];
  drillIds: string[];
  attendance?: {
    playerId: string;
    present: boolean;
    notes?: string;
  }[];
  notes?: string;
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
  system: string; // e.g., "4-4-2", "4-3-3"
  positions: {
    position: PlayerPosition;
    x: number; // 0-100 (percentage of field width)
    y: number; // 0-100 (percentage of field length)
  }[];
  description?: string;
  tactics?: string[];
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
  developmentPlans: {
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
