/**
 * OurGame API Client
 * 
 * Simple axios-based client for the OurGame API.
 */

import axios, { AxiosInstance } from 'axios';

// Generic API response type
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: {
    message?: string;
    statusCode?: number;
    validationErrors?: Record<string, string[]>;
  };
  statusCode?: number;
}

// Team Players Request/Response Types
export interface AddPlayerToTeamRequest {
  playerId: string;
  squadNumber: number;
}

export interface AddPlayerToTeamResult {
  playerId: string;
  teamId: string;
  squadNumber: number;
}

export interface UpdateSquadNumberRequest {
  squadNumber: number;
}

// User Profile
export interface UserProfile {
  id: string;
  azureUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  photo: string;
  preferences: string;
  createdAt: string;
  updatedAt: string;
  playerId?: string;
  coachId?: string;
}

// Team colors DTO
export interface TeamColorsDto {
  primary?: string;
  secondary?: string;
}

// Team club DTO
export interface TeamClubDto {
  name?: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  foundedYear?: number;
}

// Team coach DTO
export interface TeamCoachDto {
  id?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  role?: string;
  isArchived?: boolean;
}

// Team player DTO (squad member)
export interface TeamPlayerDto {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  preferredPositions: string[];
  overallRating?: number;
  squadNumber?: number;
}

// Team list item DTO
export interface TeamListItemDto {
  id?: string;
  clubId?: string;
  ageGroupId?: string;
  ageGroupName?: string;
  name?: string;
  colors?: TeamColorsDto;
  season?: string;
  squadSize?: number;
  coaches?: TeamCoachDto[];
  playerCount?: number;
  isArchived?: boolean;
  club?: TeamClubDto;
}

// Child player club DTO
export interface ChildPlayerClubDto {
  name: string;
  shortName: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

// Child player age group DTO
export interface ChildPlayerAgeGroupDto {
  id: string;
  name: string;
}

// Child player DTO
export interface ChildPlayerDto {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth?: string;
  photo?: string;
  associationId?: string;
  preferredPositions: string;
  overallRating?: number;
  isArchived: boolean;
  club?: ChildPlayerClubDto;
  ageGroups: ChildPlayerAgeGroupDto[];
}

// My Club List Item DTO (for user's clubs)
export interface MyClubListItemDto {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  foundedYear: number | null;
  teamCount: number;
  playerCount: number;
}

// Club DTOs
export interface ClubColorsDto {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ClubLocationDto {
  city: string;
  country: string;
  venue: string;
  address: string;
}

export interface ClubDetailDto {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  colors: ClubColorsDto;
  location: ClubLocationDto;
  founded?: number;
  history?: string;
  ethos?: string;
  principles: string[];
}

export interface MatchScoreDto {
  home: number;
  away: number;
}

export interface MatchSummaryDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  opposition: string;
  date: string;
  meetTime?: string;
  kickOffTime?: string;
  location: string;
  isHome: boolean;
  competition?: string;
  score?: MatchScoreDto;
}

export interface ClubStatisticsDto {
  playerCount: number;
  teamCount: number;
  ageGroupCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
  upcomingMatches: MatchSummaryDto[];
  previousResults: MatchSummaryDto[];
}

// Age Group DTOs
export interface AgeGroupListDto {
  id: string;
  clubId: string;
  name: string;
  code: string;
  level: string;
  season: string;
  seasons: string[];
  defaultSeason: string;
  defaultSquadSize: number;
  description?: string;
  isArchived: boolean;
  teamCount: number;
  playerCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
}

export interface AgeGroupDetailDto {
  id: string;
  clubId: string;
  name: string;
  code: string;
  level: string;
  season: string;
  seasons: string[];
  defaultSeason: string;
  defaultSquadSize: number;
  description?: string;
  isArchived: boolean;
}

export interface CreateAgeGroupRequest {
  clubId: string;
  name: string;
  code: string;
  level: string; // 'youth' | 'amateur' | 'reserve' | 'senior'
  season: string;
  defaultSquadSize: number;
  description?: string;
}

export interface UpdateAgeGroupRequest {
  clubId: string;
  name: string;
  code: string;
  level: string; // 'youth' | 'amateur' | 'reserve' | 'senior'
  season: string;
  seasons?: string[];
  defaultSeason?: string;
  defaultSquadSize: number;
  description?: string;
}

export interface AgeGroupStatisticsDto {
  playerCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
  upcomingMatches: MatchSummaryDto[];
  previousResults: MatchSummaryDto[];
  topPerformers: AgeGroupPerformerDto[];
  underperforming: AgeGroupPerformerDto[];
}

export interface AgeGroupPerformerDto {
  playerId: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  matchesPlayed: number;
}

export interface AgeGroupPlayerAttributesDto {
  acceleration?: number;
  agility?: number;
  aggression?: number;
  anticipation?: number;
  balance?: number;
  composure?: number;
  concentration?: number;
  crossing?: number;
  curve?: number;
  defensiveAwareness?: number;
  dribbling?: number;
  finishing?: number;
  flair?: number;
  heading?: number;
  interceptions?: number;
  jumping?: number;
  leadership?: number;
  longPassing?: number;
  longShots?: number;
  longThrows?: number;
  marking?: number;
  offensiveAwareness?: number;
  oneOnOne?: number;
  pace?: number;
  passing?: number;
  penalties?: number;
  physicalStrength?: number;
  positioning?: number;
  reactions?: number;
  shortPassing?: number;
  shotPower?: number;
  slidingTackle?: number;
  sprintSpeed?: number;
  stamina?: number;
  standingTackle?: number;
  vision?: number;
  volleys?: number;
  weakFoot?: number;
  workRate?: number;
}

export interface AgeGroupPlayerEvaluationAttributeDto {
  attributeName: string;
  rating: number;
  notes?: string;
}

export interface AgeGroupPlayerEvaluationDto {
  id: string;
  playerId: string;
  evaluatedBy?: string;
  evaluatedAt: string;
  overallRating: number;
  coachNotes?: string;
  periodStart?: string;
  periodEnd?: string;
  attributes: AgeGroupPlayerEvaluationAttributeDto[];
}

export interface AgeGroupPlayerDto {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth?: string;
  photo?: string;
  associationId?: string;
  preferredPositions: string[];
  attributes?: AgeGroupPlayerAttributesDto;
  overallRating?: number;
  evaluations?: AgeGroupPlayerEvaluationDto[];
  ageGroupIds: string[];
  teamIds: string[];
  parentIds: string[];
  isArchived: boolean;
}

export interface TeamWithStatsDto {
  id: string;
  clubId: string;
  ageGroupId: string;
  name: string;
  shortName: string;
  level: string;
  season: string;
  colors: TeamColorsDto;
  isArchived: boolean;
  stats: TeamStatsDto;
}

export interface TeamStatsDto {
  playerCount: number;
  coachCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
}

export interface TeamOverviewDto {
  team: TeamOverviewTeamDto;
  statistics: TeamOverviewStatisticsDto;
  upcomingTrainingSessions: TeamTrainingSessionDto[];
}

export interface TeamOverviewTeamDto {
  id: string;
  clubId: string;
  ageGroupId: string;
  name: string;
  shortName: string;
  level: string;
  season: string;
  colors: TeamColorsDto;
  isArchived: boolean;
}

export interface TeamOverviewStatisticsDto {
  playerCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
  upcomingMatches: TeamMatchSummaryDto[];
  previousResults: TeamMatchSummaryDto[];
  topPerformers: TeamPerformerDto[];
  underperforming: TeamPerformerDto[];
}

export interface TeamMatchSummaryDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  opposition: string;
  date: string;
  meetTime?: string;
  kickOffTime?: string;
  location: string;
  isHome: boolean;
  competition?: string;
  score?: MatchScoreDto;
}

export interface TeamPerformerDto {
  playerId: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  matchesPlayed: number;
}

export interface TeamTrainingSessionDto {
  id: string;
  teamId: string;
  date: string;
  meetTime?: string;
  durationMinutes?: number;
  location: string;
  focusAreas: string[];
}

// Team Kit DTOs
export interface TeamKitDto {
  id: string;
  name: string;
  type: 'home' | 'away' | 'third' | 'goalkeeper' | 'training';
  shirtColor: string;
  shortsColor: string;
  socksColor: string;
  season?: string;
  isActive: boolean;
}

export interface TeamKitsDto {
  teamId: string;
  teamName: string;
  clubId: string;
  clubName: string;
  kits: TeamKitDto[];
}

export interface CreateTeamKitRequest {
  name: string;
  type: 'home' | 'away' | 'third' | 'goalkeeper' | 'training';
  shirtColor: string;
  shortsColor: string;
  socksColor: string;
  season?: string;
  isActive?: boolean;
}

export interface UpdateTeamKitRequest {
  name: string;
  type: 'home' | 'away' | 'third' | 'goalkeeper' | 'training';
  shirtColor: string;
  shortsColor: string;
  socksColor: string;
  season?: string;
  isActive?: boolean;
}

// Team Matches DTOs (for GET /v1/teams/{teamId}/matches)
export interface TeamMatchesDto {
  team: TeamInfoDto;
  club: ClubInfoDto;
  matches: TeamMatchDto[];
  totalCount: number;
}

export interface TeamMatchDto {
  id: string;
  date: string;
  kickOffTime: string;
  location: string;
  status: string;
  competition: string;
  opponentName: string;
  isHome: boolean;
  homeScore?: number;
  awayScore?: number;
  hasReport: boolean;
  reportId?: string;
}

export interface TeamInfoDto {
  id: string;
  name: string;
  isArchived: boolean;
}

export interface ClubInfoDto {
  id: string;
  name: string;
}

// Team Training Sessions DTOs (for GET /v1/teams/{teamId}/training-sessions)
export interface TeamTrainingSessionsDto {
  team: TeamTrainingInfoDto;
  club: ClubInfoDto;
  sessions: TeamTrainingSessionDto[];
  totalCount: number;
}

export interface TeamTrainingInfoDto {
  id: string;
  name: string;
  isArchived: boolean;
  ageGroupId: string;
  ageGroupName: string;
}

export interface TeamTrainingSessionDto {
  id: string;
  date: string;
  meetTime?: string;
  durationMinutes?: number;
  location: string;
  focusAreas: string[];
  drillIds: string[];
  attendance: AttendanceDto[];
  status: string;
  isLocked: boolean;
  drillCount: number;
  attendanceCount: number;
}

export interface AttendanceDto {
  playerId: string;
  status: string;
  notes?: string;
}

// Club Player DTOs
export interface ClubPlayerAgeGroupDto {
  id: string;
  name: string;
}

export interface ClubPlayerTeamDto {
  id: string;
  ageGroupId: string;
  name: string;
  ageGroupName?: string;
}

export interface ClubPlayerDto {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth?: string;
  photo?: string;
  associationId?: string;
  preferredPositions: string[];
  overallRating?: number;
  isArchived: boolean;
  ageGroups: ClubPlayerAgeGroupDto[];
  teams: ClubPlayerTeamDto[];
}

// Club Team DTOs
export interface ClubTeamColorsDto {
  primary?: string;
  secondary?: string;
}

export interface ClubTeamDto {
  id: string;
  clubId: string;
  ageGroupId: string;
  ageGroupName: string;
  name: string;
  shortName?: string;
  level: string;
  season: string;
  colors?: ClubTeamColorsDto;
  isArchived: boolean;
  playerCount: number;
}

// Club Coach DTOs
export interface ClubCoachTeamDto {
  id: string;
  ageGroupId: string;
  name: string;
  ageGroupName?: string;
}

export interface ClubCoachDto {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  photo?: string;
  email?: string;
  phone?: string;
  associationId?: string;
  hasAccount: boolean;
  role: string;
  biography?: string;
  specializations: string[];
  isArchived: boolean;
  teams: ClubCoachTeamDto[];
}

// Coach Detail DTOs
export interface CoachTeamAssignmentDto {
  teamId: string;
  teamName: string;
  ageGroupId: string;
  ageGroupName: string;
  role: string;
  roleDisplay: string;
}

export interface CoachAgeGroupCoordinatorDto {
  ageGroupId: string;
  ageGroupName: string;
}

export interface CoachDetailDto {
  id: string;
  clubId: string;
  clubName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  photo?: string;
  email?: string;
  phone?: string;
  associationId?: string;
  hasAccount: boolean;
  role: string;
  roleDisplay: string;
  biography?: string;
  specializations: string[];
  certifications: {
    name: string;
    issuer?: string;
    dateObtained?: string;
    expiryDate?: string;
  }[];
  yearsExperience?: number;
  isArchived: boolean;
  teams: CoachTeamAssignmentDto[];
  ageGroupCoordinatorRoles: CoachAgeGroupCoordinatorDto[];
}

// Age Group Coach DTOs
export interface AgeGroupCoachTeamDto {
  id: string;
  ageGroupId: string;
  name: string;
  ageGroupName?: string;
}

export interface AgeGroupCoachDto {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  photo?: string;
  email?: string;
  phone?: string;
  associationId?: string;
  hasAccount: boolean;
  role: string;
  biography?: string;
  specializations: string[];
  isArchived: boolean;
  teams: AgeGroupCoachTeamDto[];
}

// Club Training Session DTOs
export interface ClubTrainingSessionDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  date: string;
  meetTime?: string;
  durationMinutes?: number;
  location: string;
  focusAreas: string[];
  drillIds: string[];
  attendance: {
    playerId: string;
    status: string;
    notes?: string;
  }[];
  status: string;
  isLocked: boolean;
}

export interface ClubTrainingSessionsDto {
  sessions: ClubTrainingSessionDto[];
  totalCount: number;
}

// Training Session Detail DTOs (from GET /v1/training-sessions/{id})
export interface TrainingSessionDetailDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  sessionDate: string;
  meetTime?: string;
  durationMinutes?: number;
  location: string;
  focusAreas: string[];
  templateId?: string;
  notes?: string;
  status: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  drills: SessionDrillDetailDto[];
  attendance: SessionAttendanceDetailDto[];
  coaches: SessionCoachDetailDto[];
  appliedTemplates: AppliedTemplateDetailDto[];
}

export interface SessionDrillDetailDto {
  id: string;
  drillId: string;
  drillName: string;
  description?: string;
  durationMinutes?: number;
  category: string;
  source: string;
  templateId?: string;
  order: number;
}

export interface SessionAttendanceDetailDto {
  id: string;
  playerId: string;
  firstName: string;
  lastName: string;
  status: string;
  notes?: string;
}

export interface SessionCoachDetailDto {
  id: string;
  coachId: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AppliedTemplateDetailDto {
  id: string;
  templateId: string;
  templateName: string;
  appliedAt: string;
}

// Create Training Session Request
export interface CreateTrainingSessionRequest {
  teamId: string;
  sessionDate: string;
  meetTime?: string;
  durationMinutes?: number;
  location?: string;
  focusAreas: string[];
  notes?: string;
  status: string;
  isLocked: boolean;
  sessionDrills: CreateSessionDrillRequest[];
  assignedCoachIds: string[];
  attendance: CreateSessionAttendanceRequest[];
  appliedTemplates: CreateAppliedTemplateRequest[];
}

export interface CreateSessionDrillRequest {
  drillId: string;
  source: string;
  templateId?: string;
  order: number;
}

export interface CreateSessionAttendanceRequest {
  playerId: string;
  status: string;
  notes?: string;
}

export interface CreateAppliedTemplateRequest {
  templateId: string;
  appliedAt: string;
}

// Update Training Session Request
export interface UpdateTrainingSessionRequest {
  teamId: string;
  sessionDate: string;
  meetTime?: string;
  durationMinutes?: number;
  location?: string;
  focusAreas: string[];
  templateId?: string;
  notes?: string;
  status: string;
  isLocked: boolean;
  drills: UpdateSessionDrillRequest[];
  coachIds: string[];
  attendance: UpdateSessionAttendanceRequest[];
  appliedTemplates: UpdateAppliedTemplateRequest[];
}

export interface UpdateSessionDrillRequest {
  drillId: string;
  source: string;
  templateId?: string;
  order: number;
}

export interface UpdateSessionAttendanceRequest {
  playerId: string;
  status: string;
  notes?: string;
}

export interface UpdateAppliedTemplateRequest {
  templateId: string;
  appliedAt: string;
}

// Club Match DTOs
export interface ClubMatchDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  squadSize?: number;
  opposition: string;
  date: string;
  meetTime?: string;
  kickOffTime: string;
  location: string;
  isHome: boolean;
  competition: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  isLocked: boolean;
  weatherCondition?: string;
  weatherTemperature?: number;
}

export interface ClubMatchesDto {
  matches: ClubMatchDto[];
  totalCount: number;
}

// Club Kit DTOs
export interface ClubKitDto {
  id: string;
  name: string;
  type: 'home' | 'away' | 'third' | 'goalkeeper' | 'training';
  shirtColor: string;
  shortsColor: string;
  socksColor: string;
  season?: string;
  isActive: boolean;
}

// Club Report Card DTOs
export interface ClubReportCardPeriodDto {
  start?: string;
  end?: string;
}

export interface ClubReportCardPlayerDto {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  photo?: string;
  preferredPositions: string[];
  ageGroupIds: string[];
}

export interface ClubReportCardDevelopmentActionDto {
  id: string;
  goal: string;
  actions: string[];
  startDate?: string;
  targetDate?: string;
  completed: boolean;
  completedDate?: string;
}

export interface ClubReportCardSimilarProfessionalDto {
  name: string;
  team: string;
  position: string;
  reason: string;
}

export interface ClubReportCardDto {
  id: string;
  playerId: string;
  player: ClubReportCardPlayerDto;
  period: ClubReportCardPeriodDto;
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  developmentActions: ClubReportCardDevelopmentActionDto[];
  coachComments: string;
  createdBy?: string;
  createdAt: string;
  similarProfessionalPlayers: ClubReportCardSimilarProfessionalDto[];
}

// Club Development Plan DTOs
export interface ClubDevelopmentPlanPeriodDto {
  start?: string;
  end?: string;
}

export interface ClubDevelopmentPlanPlayerDto {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  photo?: string;
  preferredPositions: string[];
  ageGroupIds: string[];
}

export interface ClubDevelopmentPlanGoalDto {
  id: string;
  goal: string;
  actions: string[];
  startDate?: string;
  targetDate?: string;
  progress: number;
  completed: boolean;
  completedDate?: string;
}

export interface ClubDevelopmentPlanDto {
  id: string;
  playerId: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  createdBy?: string;
  period: ClubDevelopmentPlanPeriodDto;
  goals: ClubDevelopmentPlanGoalDto[];
  player: ClubDevelopmentPlanPlayerDto;
}

// Report Card DTOs
export interface ReportCardDto {
  id: string;
  playerId: string;
  playerName: string;
  periodStart?: string;
  periodEnd?: string;
  overallRating?: number;
  strengths: string[];
  areasForImprovement: string[];
  coachComments: string;
  createdBy?: string;
  createdByName: string;
  createdAt: string;
  developmentActions: DevelopmentActionDto[];
  similarProfessionals: SimilarProfessionalDto[];
}

export interface DevelopmentActionDto {
  id: string;
  goal: string;
  actions: string[];
  startDate?: string;
  targetDate?: string;
  completed: boolean;
  completedDate?: string;
}

export interface SimilarProfessionalDto {
  id: string;
  name: string;
  team: string;
  position: string;
  reason: string;
}

export interface CreateReportCardRequest {
  playerId: string;
  periodStart?: string;
  periodEnd?: string;
  overallRating?: number;
  strengths: string[];
  areasForImprovement: string[];
  coachComments: string;
  developmentActions: CreateDevelopmentActionRequest[];
  similarProfessionals: CreateSimilarProfessionalRequest[];
}

export interface CreateDevelopmentActionRequest {
  goal: string;
  actions: string[];
  startDate?: string;
  targetDate?: string;
  completed: boolean;
  completedDate?: string;
}

export interface CreateSimilarProfessionalRequest {
  name: string;
  team: string;
  position: string;
  reason: string;
}

export interface UpdateReportCardRequest {
  periodStart?: string;
  periodEnd?: string;
  overallRating?: number;
  strengths: string[];
  areasForImprovement: string[];
  coachComments: string;
  developmentActions: UpdateDevelopmentActionRequest[];
  similarProfessionals: UpdateSimilarProfessionalRequest[];
}

export interface UpdateDevelopmentActionRequest {
  id?: string;
  goal: string;
  actions: string[];
  startDate?: string;
  targetDate?: string;
  completed: boolean;
  completedDate?: string;
}

export interface UpdateSimilarProfessionalRequest {
  id?: string;
  name: string;
  team: string;
  position: string;
  reason: string;
}

// Tactics DTOs
export interface TacticScopeDto {
  type: string;
  clubId?: string;
  ageGroupId?: string;
  teamId?: string;
}

export interface TacticListDto {
  id: string;
  name: string;
  summary?: string;
  style?: string;
  squadSize: number;
  parentFormationId?: string;
  parentFormationName?: string;
  scope: TacticScopeDto;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TacticsByScopeResponseDto {
  scopeTactics: TacticListDto[];
  inheritedTactics: TacticListDto[];
}

export interface TacticDetailScopeDto {
  clubIds: string[];
  ageGroupIds: string[];
  teamIds: string[];
}

export interface PositionOverrideDto {
  positionIndex: number;
  xCoord?: number;
  yCoord?: number;
  direction?: string;
}

export interface ResolvedPositionDto {
  position: string;
  x: number;
  y: number;
  direction?: string;
  sourceFormationId?: string;
  overriddenBy?: string[];
}

export interface TacticPrincipleDto {
  id: string;
  title: string;
  description?: string;
  positionIndices: number[];
}

export interface TacticDetailDto {
  id: string;
  name: string;
  parentFormationId: string;
  parentFormationName?: string;
  parentTacticId?: string;
  squadSize: number;
  summary?: string;
  style?: string;
  tags: string[];
  scope: TacticDetailScopeDto;
  positionOverrides: PositionOverrideDto[];
  principles: TacticPrincipleDto[];
  resolvedPositions: ResolvedPositionDto[];
}

export interface CreateTacticRequest {
  name: string;
  parentFormationId: string;
  parentTacticId?: string;
  summary?: string;
  style?: string;
  tags: string[];
  scope: {
    type: 'club' | 'ageGroup' | 'team';
    clubId: string;
    ageGroupId?: string;
    teamId?: string;
  };
  positionOverrides: {
    positionIndex: number;
    xCoord?: number;
    yCoord?: number;
    direction?: string;
  }[];
  principles: {
    title: string;
    description?: string;
    positionIndices: number[];
  }[];
}

export interface UpdateTacticRequest {
  name: string;
  summary?: string;
  style?: string;
  tags: string[];
  positionOverrides: {
    positionIndex: number;
    xCoord?: number;
    yCoord?: number;
    direction?: string;
  }[];
  principles: {
    title: string;
    description?: string;
    positionIndices: number[];
  }[];
}

// Drill DTOs
export interface DrillLinkDto {
  url: string;
  title: string;
  type: string;
}

export interface DrillListDto {
  id: string;
  name: string;
  description: string;
  duration: number;
  category: string;
  attributes: string[];
  equipment: string[];
  diagram?: string;
  instructions: string[];
  variations: string[];
  links: DrillLinkDto[];
  scopeType: string;
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface DrillsByScopeResponseDto {
  drills: DrillListDto[];
  inheritedDrills: DrillListDto[];
  totalCount: number;
}

export interface DrillScopeDto {
  clubIds: string[];
  ageGroupIds: string[];
  teamIds: string[];
}

export interface DrillDetailDto {
  id: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  category: string;
  attributes: string[];
  equipment: string[];
  instructions: string[];
  variations: string[];
  links: DrillDetailLinkDto[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  scope: DrillScopeDto;
}

export interface DrillDetailLinkDto {
  id: string;
  url: string;
  title?: string;
  linkType: string;
}

export interface CreateDrillRequest {
  name: string;
  description?: string;
  durationMinutes?: number;
  category: string;
  attributes: string[];
  equipment: string[];
  instructions: string[];
  variations: string[];
  links: CreateDrillLinkRequest[];
  isPublic: boolean;
  scope: CreateDrillScopeRequest;
}

export interface CreateDrillLinkRequest {
  url: string;
  title?: string;
  linkType: string;
}

export interface CreateDrillScopeRequest {
  clubId?: string;
  ageGroupId?: string;
  teamId?: string;
}

export interface UpdateDrillRequest {
  name: string;
  description?: string;
  durationMinutes?: number;
  category: string;
  attributes: string[];
  equipment: string[];
  instructions: string[];
  variations: string[];
  links: UpdateDrillLinkRequest[];
  isPublic: boolean;
}

export interface UpdateDrillLinkRequest {
  url: string;
  title?: string;
  type: string;
}

// Drill Template DTOs
export interface DrillTemplateListDto {
  id: string;
  name: string;
  description: string;
  drillIds: string[];
  totalDuration: number;
  category?: string;
  attributes: string[];
  scopeType: string;
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface DrillTemplatesByScopeResponseDto {
  templates: DrillTemplateListDto[];
  inheritedTemplates: DrillTemplateListDto[];
  totalCount: number;
  availableAttributes: string[];
}

export interface DrillTemplateDetailDto {
  id: string;
  name: string;
  description?: string;
  drillIds: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  totalDuration?: number;
  category?: string;
  aggregatedAttributes: string[];
  scopeType: string;
  scopeClubId?: string;
  scopeAgeGroupId?: string;
  scopeTeamId?: string;
}

export interface CreateDrillTemplateRequest {
  name: string;
  description?: string;
  drillIds: string[];
  isPublic: boolean;
  scope: {
    clubId?: string;
    ageGroupId?: string;
    teamId?: string;
  };
}

export interface UpdateDrillTemplateRequest {
  name: string;
  description?: string;
  drillIds: string[];
  isPublic: boolean;
}

// Age Group Development Plan DTOs
export interface AgeGroupDevelopmentPlanPlayerDto {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  photo?: string;
  preferredPositions: string[];
}

export interface AgeGroupDevelopmentPlanGoalSummaryDto {
  id: string;
  goal: string;
  progress: number;
  completed: boolean;
  targetDate?: string;
  completedDate?: string;
}

export interface AgeGroupDevelopmentPlanPeriodDto {
  start?: string;
  end?: string;
}

export interface AgeGroupDevelopmentPlanSummaryDto {
  id: string;
  playerId: string;
  title: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt?: string;
  player: AgeGroupDevelopmentPlanPlayerDto;
  period: AgeGroupDevelopmentPlanPeriodDto;
  goals: AgeGroupDevelopmentPlanGoalSummaryDto[];
}

// Team Development Plan DTOs
export interface TeamDevelopmentPlanDto {
  id: string;
  playerId: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  createdBy?: string;
  period?: {
    start?: string;
    end?: string;
  };
  player: {
    id: string;
    firstName: string;
    lastName: string;
    nickname?: string;
    photo?: string;
    preferredPositions: string[];
  };
  goals: Array<{
    id: string;
    goal: string;
    actions: string[];
    startDate?: string;
    targetDate?: string;
    progress: number;
    completed: boolean;
    completedDate?: string;
  }>;
}

// Development Plan DTOs
export interface DevelopmentGoalDto {
  id: string;
  goal: string;
  actions: string[];
  startDate: string;
  targetDate: string;
  progress: number;
  completed: boolean;
  completedDate?: string;
}

export interface DevelopmentPlanDto {
  id: string;
  playerId: string;
  title: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  status: 'active' | 'completed' | 'archived';
  coachNotes?: string;
  goals: DevelopmentGoalDto[];
}

// Development Plan Detail DTOs (from GET /v1/development-plans/{id})
export interface DevelopmentPlanDetailDto {
  id: string;
  title: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  playerId: string;
  playerName: string;
  position?: string;
  teamId?: string;
  teamName?: string;
  ageGroupId?: string;
  ageGroupName?: string;
  clubId?: string;
  clubName?: string;
  goals: DevelopmentPlanGoalDetailDto[];
  progressNotes: DevelopmentPlanProgressNoteDto[];
  trainingObjectives: DevelopmentPlanTrainingObjectiveDto[];
}

export interface DevelopmentPlanGoalDetailDto {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  completedDate?: string;
  status: string;
  actions: string[];
  progress: number;
}

export interface DevelopmentPlanProgressNoteDto {
  id: string;
  noteDate: string;
  note: string;
  coachId?: string;
  coachName?: string;
}

export interface DevelopmentPlanTrainingObjectiveDto {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status: string;
  progress: number;
  completed: boolean;
  completedDate?: string;
}

export interface CreateDevelopmentGoalRequest {
  goal: string;
  actions: string[];
  startDate: string;
  targetDate: string;
  progress: number;
  completed: boolean;
  completedDate?: string;
}

export interface CreateDevelopmentPlanRequest {
  playerId: string;
  title: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  coachNotes?: string;
  goals: CreateDevelopmentGoalRequest[];
}

export interface UpdateDevelopmentGoalRequest {
  goal: string;
  actions: string[];
  startDate: string;
  targetDate: string;
  progress: number;
  completed: boolean;
  completedDate?: string;
}

export interface UpdateDevelopmentPlanRequest {
  title: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  coachNotes?: string;
  goals: UpdateDevelopmentGoalRequest[];
}

// Player DTOs
export interface PlayerTeamMinimalDto {
  id: string;
  name: string;
  ageGroupId: string;
  ageGroupName?: string;
}

export interface PlayerDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nickname?: string;
  photoUrl?: string;
  dateOfBirth: string;
  associationId?: string;
  isArchived: boolean;
  clubId?: string;
  clubName?: string;
  preferredPositions: string[];
  teamIds: string[];
  ageGroupIds: string[];
  teams: PlayerTeamMinimalDto[];
  emergencyContacts?: {
    id: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  }[];
  allergies?: string;
  medicalConditions?: string;
  // Backward-compatible single-value fields
  ageGroupId?: string;
  ageGroupName?: string;
  teamId?: string;
  teamName?: string;
  preferredPosition?: string;
}

// Player Abilities DTOs
export interface PlayerAttributesDto {
  // Technical attributes
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
  // Physical attributes
  acceleration: number;
  agility: number;
  balance: number;
  jumping: number;
  pace: number;
  reactions: number;
  sprintSpeed: number;
  stamina: number;
  strength: number;
  // Mental attributes
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

export interface EvaluationAttributeDto {
  attributeName: string;
  rating: number;
  notes?: string;
}

export interface PlayerAbilityEvaluationDto {
  evaluationId: string;
  evaluatedAt: string;
  overallRating: number;
  coachName?: string;
  coachNotes?: string;
  periodStart?: string;
  periodEnd?: string;
  attributes: EvaluationAttributeDto[];
}

export interface PlayerAbilitiesDto {
  playerId: string;
  firstName: string;
  lastName: string;
  photo?: string;
  preferredPositions: string[];
  attributes: PlayerAttributesDto;
  overallRating: number;
  evaluations: PlayerAbilityEvaluationDto[];
}

export interface CreatePlayerAbilityEvaluationRequest {
  evaluatedAt: string;
  coachNotes?: string;
  periodStart?: string;
  periodEnd?: string;
  attributes: {
    attributeName: string;
    rating: number;
    notes?: string;
  }[];
}

export interface UpdatePlayerAbilityEvaluationRequest {
  evaluatedAt: string;
  coachNotes?: string;
  periodStart?: string;
  periodEnd?: string;
  attributes: {
    attributeName: string;
    rating: number;
    notes?: string;
  }[];
}

export interface PlayerAlbumDto {
  playerId: string;
  playerName: string;
  photos: PlayerAlbumPhotoDto[];
}

export interface PlayerAlbumPhotoDto {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  tags: string[];
}

export interface PlayerRecentPerformanceDto {
  matchId: string;
  teamId: string;
  ageGroupId: string;
  matchDate: string;  // ISO date string
  opponent: string;
  homeAway: string;   // "Home" | "Away"
  result: string;     // e.g., "W 3-1"
  rating: number;
  goals: number;
  assists: number;
  competition?: string;
}

export interface PlayerUpcomingMatchDto {
  matchId: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  matchDate: string;  // ISO date string
  kickoffTime?: string;
  opponent: string;
  homeAway: string;
  venue?: string;
  competition?: string;
}

export interface PlayerReportSummaryDto {
  id: string;
  playerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl?: string;
  preferredPositions: string[];
  periodStart?: string;
  periodEnd?: string;
  overallRating?: number;
  coachFirstName?: string;
  coachLastName?: string;
  coachName?: string;
  createdAt: string;
  strengthsCount: number;
  areasForImprovementCount: number;
  developmentActionsCount: number;
}

export interface UpdatePlayerRequest {
  firstName: string;
  lastName: string;
  nickname?: string;
  associationId?: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  email?: string;
  phoneNumber?: string;
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  }[];
  photo?: string;
  allergies?: string;
  medicalConditions?: string;
  preferredPositions: string[];
  teamIds?: string[];
  isArchived: boolean;
}

export interface UpdateClubRequest {
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  city: string;
  country: string;
  venue: string;
  address: string;
  founded: string;
  history: string;
  ethos: string;
  principles: string[];
}

export interface CreateTeamRequest {
  clubId: string;
  ageGroupId: string;
  name: string;
  shortName?: string;
  level: string;
  season: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface UpdateTeamRequest {
  name: string;
  shortName?: string;
  level: string;
  season: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface SquadNumberAssignment {
  playerId: string;
  squadNumber?: number;
}

export interface UpdateSquadNumbersRequest {
  assignments: SquadNumberAssignment[];
}

export interface ArchiveTeamRequest {
  isArchived: boolean;
}

export interface UpdateCoachRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  associationId?: string;
  role: string;
  biography?: string;
  specializations: string[];
  teamIds: string[];
  photo?: string;
}

export interface AssignTeamCoachRequest {
  coachId: string;
  role: string; // 'HeadCoach' | 'AssistantCoach' | 'GoalkeeperCoach' | 'FitnessCoach' | 'TechnicalCoach'
}

export interface UpdateTeamCoachRoleRequest {
  role: string; // 'HeadCoach' | 'AssistantCoach' | 'GoalkeeperCoach' | 'FitnessCoach' | 'TechnicalCoach'
}

// Match Detail DTOs

export interface MatchDetailDto {
  id: string;
  teamId: string;
  ageGroupId: string;
  clubId: string;
  clubName: string;
  teamName: string;
  ageGroupName: string;
  seasonId: string;
  squadSize: number;
  opposition: string;
  matchDate: string;
  meetTime?: string;
  kickOffTime?: string;
  location: string;
  isHome: boolean;
  competition: string;
  primaryKitId?: string;
  secondaryKitId?: string;
  goalkeeperKitId?: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  isLocked: boolean;
  notes?: string;
  weatherCondition?: string;
  weatherTemperature?: number;
  createdAt: string;
  updatedAt: string;
  lineup?: MatchLineupDto;
  report?: MatchReportDetailDto;
  coaches: MatchCoachDetailDto[];
  substitutions: MatchSubstitutionDetailDto[];
}

export interface MatchLineupDto {
  id: string;
  formationId?: string;
  formationName?: string;
  tacticId?: string;
  tacticName?: string;
  players: LineupPlayerDto[];
}

export interface LineupPlayerDto {
  id: string;
  playerId: string;
  firstName: string;
  lastName: string;
  photo?: string;
  position?: string;
  squadNumber?: number;
  isStarting: boolean;
}

export interface MatchReportDetailDto {
  id: string;
  summary?: string;
  captainId?: string;
  captainName?: string;
  captainPhoto?: string;
  playerOfMatchId?: string;
  playerOfMatchName?: string;
  playerOfMatchPhoto?: string;
  goals: GoalDetailDto[];
  cards: CardDetailDto[];
  injuries: InjuryDetailDto[];
  performanceRatings: PerformanceRatingDto[];
}

export interface GoalDetailDto {
  id: string;
  playerId: string;
  scorerName: string;
  minute: number;
  assistPlayerId?: string;
  assistPlayerName?: string;
}

export interface CardDetailDto {
  id: string;
  playerId: string;
  playerName: string;
  type: string;
  minute: number;
  reason?: string;
}

export interface InjuryDetailDto {
  id: string;
  playerId: string;
  playerName: string;
  minute: number;
  description?: string;
  severity: string;
}

export interface PerformanceRatingDto {
  id: string;
  playerId: string;
  playerName: string;
  rating?: number;
}

export interface MatchCoachDetailDto {
  id: string;
  coachId: string;
  firstName: string;
  lastName: string;
  photo?: string;
  role: string;
}

export interface MatchSubstitutionDetailDto {
  id: string;
  minute: number;
  playerOutId: string;
  playerOutName: string;
  playerInId: string;
  playerInName: string;
}

// Create Match Request DTOs

export interface CreateMatchRequest {
  teamId: string;
  seasonId: string;
  squadSize: number;
  opposition: string;
  matchDate: string;
  meetTime?: string;
  kickOffTime?: string;
  location?: string;
  isHome: boolean;
  competition?: string;
  primaryKitId?: string;
  secondaryKitId?: string;
  goalkeeperKitId?: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  notes?: string;
  weatherCondition?: string;
  weatherTemperature?: number;
  lineup?: CreateMatchLineupRequest;
  report?: CreateMatchReportRequest;
  coachIds: string[];
  substitutions: CreateMatchSubstitutionRequest[];
}

export interface CreateMatchLineupRequest {
  formationId?: string;
  tacticId?: string;
  players: CreateLineupPlayerRequest[];
}

export interface CreateLineupPlayerRequest {
  playerId: string;
  position?: string;
  squadNumber?: number;
  isStarting: boolean;
}

export interface CreateMatchReportRequest {
  summary?: string;
  captainId?: string;
  playerOfMatchId?: string;
  goals: CreateGoalRequest[];
  cards: CreateCardRequest[];
  injuries: CreateInjuryRequest[];
  performanceRatings: CreatePerformanceRatingRequest[];
}

export interface CreateGoalRequest {
  playerId: string;
  minute: number;
  assistPlayerId?: string;
}

export interface CreateCardRequest {
  playerId: string;
  type: string;
  minute: number;
  reason?: string;
}

export interface CreateInjuryRequest {
  playerId: string;
  minute: number;
  description?: string;
  severity: string;
}

export interface CreatePerformanceRatingRequest {
  playerId: string;
  rating?: number;
}

export interface CreateMatchSubstitutionRequest {
  minute: number;
  playerOutId: string;
  playerInId: string;
}

// Update Match Request DTOs

export interface UpdateMatchRequest {
  seasonId: string;
  squadSize: number;
  opposition: string;
  matchDate: string;
  meetTime?: string;
  kickOffTime?: string;
  location?: string;
  isHome: boolean;
  competition?: string;
  primaryKitId?: string;
  secondaryKitId?: string;
  goalkeeperKitId?: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  isLocked: boolean;
  notes?: string;
  weatherCondition?: string;
  weatherTemperature?: number;
  lineup?: UpdateMatchLineupRequest;
  report?: UpdateMatchReportRequest;
  coachIds: string[];
  substitutions: UpdateMatchSubstitutionRequest[];
}

export interface UpdateMatchLineupRequest {
  formationId?: string;
  tacticId?: string;
  players: UpdateLineupPlayerRequest[];
}

export interface UpdateLineupPlayerRequest {
  playerId: string;
  position?: string;
  squadNumber?: number;
  isStarting: boolean;
}

export interface UpdateMatchReportRequest {
  summary?: string;
  captainId?: string;
  playerOfMatchId?: string;
  goals: UpdateGoalRequest[];
  cards: UpdateCardRequest[];
  injuries: UpdateInjuryRequest[];
  performanceRatings: UpdatePerformanceRatingRequest[];
}

export interface UpdateGoalRequest {
  playerId: string;
  minute: number;
  assistPlayerId?: string;
}

export interface UpdateCardRequest {
  playerId: string;
  type: string;
  minute: number;
  reason?: string;
}

export interface UpdateInjuryRequest {
  playerId: string;
  minute: number;
  description?: string;
  severity: string;
}

export interface UpdatePerformanceRatingRequest {
  playerId: string;
  rating?: number;
}

export interface UpdateMatchSubstitutionRequest {
  minute: number;
  playerOutId: string;
  playerInId: string;
}



/**
 * Get the API base URL based on the environment
 * In both development and production, the API is available at /api
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '/api';
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'api-version': '1.0',
  },
});

/**
 * Handle API errors and return a typed ApiResponse with error details
 */
function handleApiError<T>(error: unknown): ApiResponse<T> {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    return {
      success: false,
      statusCode: error.response.status,
      error: {
        message: data?.error?.message || data?.message || error.message,
        statusCode: error.response.status,
        validationErrors: data?.error?.validationErrors || data?.validationErrors,
      },
    };
  }
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    },
  };
}

/**
 * OurGame API Client
 * 
 * Usage:
 * ```typescript
 * import { apiClient } from '@/api/client';
 * 
 * const user = await apiClient.users.getCurrentUser();
 * const teams = await apiClient.teams.getMyTeams();
 * ```
 */
export const apiClient = {
  users: {
    /**
     * Get current authenticated user's profile
     */
    getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
      const response = await axiosInstance.get<ApiResponse<UserProfile>>('/v1/users/me');
      return response.data;
    },

    /**
     * Get children players for the current authenticated parent user
     */
    getMyChildren: async (): Promise<ApiResponse<ChildPlayerDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<ChildPlayerDto[]>>('/v1/users/me/children');
      return response.data;
    },

    /**
     * Get clubs for the current authenticated user
     */
    getMyClubs: async (): Promise<ApiResponse<MyClubListItemDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<MyClubListItemDto[]>>('/v1/users/me/clubs');
      return response.data;
    },
  },

  teams: {
    /**
     * Get teams for the current authenticated user
     */
    getMyTeams: async (): Promise<ApiResponse<TeamListItemDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<TeamListItemDto[]>>('/v1/teams/me');
      return response.data;
    },

    /**
     * Get teams by age group ID
     */
    getByAgeGroupId: async (ageGroupId: string): Promise<ApiResponse<TeamWithStatsDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<TeamWithStatsDto[]>>(`/v1/age-groups/${ageGroupId}/teams`);
      return response.data;
    },

    /**
     * Get overview data for a team
     */
    getOverview: async (teamId: string): Promise<ApiResponse<TeamOverviewDto>> => {
      const response = await axiosInstance.get<ApiResponse<TeamOverviewDto>>(`/v1/teams/${teamId}/overview`);
      return response.data;
    },

    /**
     * Get players for a specific team
     */
    getPlayers: async (teamId: string, includeArchived?: boolean): Promise<ApiResponse<TeamPlayerDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<TeamPlayerDto[]>>(`/v1/teams/${teamId}/players${params}`);
      return response.data;
    },

    /**
     * Add a player to a team
     */
    addPlayer: async (teamId: string, request: AddPlayerToTeamRequest): Promise<ApiResponse<AddPlayerToTeamResult>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<AddPlayerToTeamResult>>(
          `/v1/teams/${teamId}/players`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Remove a player from a team
     */
    removePlayer: async (teamId: string, playerId: string): Promise<ApiResponse<void>> => {
      try {
        const response = await axiosInstance.delete<ApiResponse<void>>(
          `/v1/teams/${teamId}/players/${playerId}`
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update a player's squad number on a team
     */
    updatePlayerSquadNumber: async (teamId: string, playerId: string, request: UpdateSquadNumberRequest): Promise<ApiResponse<void>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<void>>(
          `/v1/teams/${teamId}/players/${playerId}/squad-number`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Get coaches for a specific team
     */
    getCoaches: async (teamId: string): Promise<ApiResponse<TeamCoachDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<TeamCoachDto[]>>(`/v1/teams/${teamId}/coaches`);
      return response.data;
    },

    /**
     * Get matches for a specific team with optional filters
     */
    getMatches: async (
      teamId: string,
      options?: { status?: string; dateFrom?: string; dateTo?: string }
    ): Promise<ApiResponse<TeamMatchesDto>> => {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.dateFrom) params.append('dateFrom', options.dateFrom);
      if (options?.dateTo) params.append('dateTo', options.dateTo);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<TeamMatchesDto>>(`/v1/teams/${teamId}/matches${queryString}`);
      return response.data;
    },

    /**
     * Get training sessions for a specific team with optional filters
     */
    getTrainingSessions: async (
      teamId: string,
      options?: { status?: string; dateFrom?: string; dateTo?: string }
    ): Promise<ApiResponse<TeamTrainingSessionsDto>> => {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.dateFrom) params.append('dateFrom', options.dateFrom);
      if (options?.dateTo) params.append('dateTo', options.dateTo);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<TeamTrainingSessionsDto>>(`/v1/teams/${teamId}/training-sessions${queryString}`);
      return response.data;
    },

    /**
     * Create a new team
     */
    create: async (request: CreateTeamRequest): Promise<ApiResponse<TeamOverviewTeamDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<TeamOverviewTeamDto>>(
          '/v1/teams',
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing team
     */
    update: async (teamId: string, request: UpdateTeamRequest): Promise<ApiResponse<TeamOverviewTeamDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<TeamOverviewTeamDto>>(
          `/v1/teams/${teamId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Assign a coach to a team
     */
    assignCoach: async (teamId: string, request: AssignTeamCoachRequest): Promise<ApiResponse<TeamCoachDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<TeamCoachDto>>(
          `/v1/teams/${teamId}/coaches`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Remove a coach from a team
     */
    removeCoach: async (teamId: string, coachId: string): Promise<ApiResponse<void>> => {
      try {
        const response = await axiosInstance.delete<ApiResponse<void>>(
          `/v1/teams/${teamId}/coaches/${coachId}`
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update a coach's role on a team
     */
    updateCoachRole: async (teamId: string, coachId: string, request: UpdateTeamCoachRoleRequest): Promise<ApiResponse<TeamCoachDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<TeamCoachDto>>(
          `/v1/teams/${teamId}/coaches/${coachId}/role`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Get report cards for a specific team
     */
    getReportCards: async (teamId: string): Promise<ApiResponse<ClubReportCardDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<ClubReportCardDto[]>>(`/v1/teams/${teamId}/report-cards`);
      return response.data;
    },

    /**
     * Get development plans for a specific team
     */
    getDevelopmentPlans: async (teamId: string): Promise<ApiResponse<TeamDevelopmentPlanDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<TeamDevelopmentPlanDto[]>>(`/v1/teams/${teamId}/development-plans`);
      return response.data;
    },

    /**
     * Get kits for a specific team
     */
    getKits: async (teamId: string): Promise<ApiResponse<TeamKitsDto>> => {
      const response = await axiosInstance.get<ApiResponse<TeamKitsDto>>(`/v1/teams/${teamId}/kits`);
      return response.data;
    },

    /**
     * Create a new kit for a team
     */
    createKit: async (teamId: string, request: CreateTeamKitRequest): Promise<ApiResponse<TeamKitDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<TeamKitDto>>(
          `/v1/teams/${teamId}/kits`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing team kit
     */
    updateKit: async (teamId: string, kitId: string, request: UpdateTeamKitRequest): Promise<ApiResponse<TeamKitDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<TeamKitDto>>(
          `/v1/teams/${teamId}/kits/${kitId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Delete a team kit
     */
    deleteKit: async (teamId: string, kitId: string): Promise<ApiResponse<void>> => {
      try {
        const response = await axiosInstance.delete<ApiResponse<void>>(
          `/v1/teams/${teamId}/kits/${kitId}`
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update squad numbers for multiple players in a team
     */
    updateSquadNumbers: async (
      teamId: string,
      request: UpdateSquadNumbersRequest
    ): Promise<ApiResponse<void>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<void>>(
          `/v1/teams/${teamId}/squad-numbers`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Archive or unarchive a team
     */
    archive: async (teamId: string, request: ArchiveTeamRequest): Promise<ApiResponse<void>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<void>>(
          `/v1/teams/${teamId}/archive`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  clubs: {
    /**
     * Get club details by ID
     */
    getClubById: async (clubId: string): Promise<ApiResponse<ClubDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<ClubDetailDto>>(`/v1/clubs/${clubId}`);
      return response.data;
    },

    /**
     * Get club statistics
     */
    getClubStatistics: async (clubId: string): Promise<ApiResponse<ClubStatisticsDto>> => {
      const response = await axiosInstance.get<ApiResponse<ClubStatisticsDto>>(`/v1/clubs/${clubId}/statistics`);
      return response.data;
    },

    /**
     * Get age groups by club ID
     */
    getAgeGroups: async (clubId: string, includeArchived: boolean = false): Promise<ApiResponse<AgeGroupListDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<AgeGroupListDto[]>>(`/v1/clubs/${clubId}/age-groups${params}`);
      return response.data;
    },

    /**
     * Get all players for a club
     */
    getPlayers: async (clubId: string, includeArchived: boolean = false): Promise<ApiResponse<ClubPlayerDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<ClubPlayerDto[]>>(`/v1/clubs/${clubId}/players${params}`);
      return response.data;
    },

    /**
     * Get all teams for a club
     */
    getTeams: async (clubId: string, includeArchived: boolean = false): Promise<ApiResponse<ClubTeamDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<ClubTeamDto[]>>(`/v1/clubs/${clubId}/teams${params}`);
      return response.data;
    },

    /**
     * Get all coaches for a club
     */
    getCoaches: async (clubId: string, includeArchived: boolean = false): Promise<ApiResponse<ClubCoachDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<ClubCoachDto[]>>(`/v1/clubs/${clubId}/coaches${params}`);
      return response.data;
    },

    /**
     * Get all training sessions for a club with optional filtering
     */
    getTrainingSessions: async (
      clubId: string, 
      options?: { ageGroupId?: string; teamId?: string; status?: 'upcoming' | 'past' | 'all' }
    ): Promise<ApiResponse<ClubTrainingSessionsDto>> => {
      const params = new URLSearchParams();
      if (options?.ageGroupId) params.append('ageGroupId', options.ageGroupId);
      if (options?.teamId) params.append('teamId', options.teamId);
      if (options?.status) params.append('status', options.status);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<ClubTrainingSessionsDto>>(`/v1/clubs/${clubId}/training-sessions${queryString}`);
      return response.data;
    },

    /**
     * Get all matches for a club with optional filtering
     */
    getMatches: async (
      clubId: string, 
      options?: { ageGroupId?: string; teamId?: string; status?: 'upcoming' | 'past' | 'scheduled' | 'completed' | 'cancelled' | 'all' }
    ): Promise<ApiResponse<ClubMatchesDto>> => {
      const params = new URLSearchParams();
      if (options?.ageGroupId) params.append('ageGroupId', options.ageGroupId);
      if (options?.teamId) params.append('teamId', options.teamId);
      if (options?.status) params.append('status', options.status);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<ClubMatchesDto>>(`/v1/clubs/${clubId}/matches${queryString}`);
      return response.data;
    },

    /**
     * Get all kits for a club
     */
    getKits: async (clubId: string): Promise<ApiResponse<ClubKitDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<ClubKitDto[]>>(`/v1/clubs/${clubId}/kits`);
      return response.data;
    },

    /**
     * Get all report cards for a club
     */
    getReportCards: async (clubId: string): Promise<ApiResponse<ClubReportCardDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<ClubReportCardDto[]>>(`/v1/clubs/${clubId}/report-cards`);
      return response.data;
    },

    /**
     * Get all development plans for a club
     */
    getDevelopmentPlans: async (clubId: string): Promise<ApiResponse<ClubDevelopmentPlanDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<ClubDevelopmentPlanDto[]>>(`/v1/clubs/${clubId}/development-plans`);
      return response.data;
    },

    /**
     * Update a club
     */
    updateClub: async (clubId: string, request: UpdateClubRequest): Promise<ApiResponse<ClubDetailDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<ClubDetailDto>>(
          `/v1/clubs/${clubId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  ageGroups: {
    /**
     * Get age group by ID
     */
    getById: async (ageGroupId: string): Promise<ApiResponse<AgeGroupDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<AgeGroupDetailDto>>(`/v1/age-groups/${ageGroupId}`);
      return response.data;
    },

    /**
     * Get age group statistics
     */
    getStatistics: async (ageGroupId: string): Promise<ApiResponse<AgeGroupStatisticsDto>> => {
      const response = await axiosInstance.get<ApiResponse<AgeGroupStatisticsDto>>(`/v1/age-groups/${ageGroupId}/statistics`);
      return response.data;
    },

    /**
     * Get players for an age group
     */
    getPlayers: async (ageGroupId: string, includeArchived: boolean = false): Promise<ApiResponse<AgeGroupPlayerDto[]>> => {
      const params = includeArchived ? '?includeArchived=true' : '';
      const response = await axiosInstance.get<ApiResponse<AgeGroupPlayerDto[]>>(`/v1/age-groups/${ageGroupId}/players${params}`);
      return response.data;
    },

    /**
     * Get coaches for a specific age group
     */
    getCoachesByAgeGroupId: async (ageGroupId: string): Promise<ApiResponse<AgeGroupCoachDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<AgeGroupCoachDto[]>>(`/v1/age-groups/${ageGroupId}/coaches`);
      return response.data;
    },

    /**
     * Get report cards for a specific age group
     */
    getReportCards: async (ageGroupId: string): Promise<ApiResponse<ClubReportCardDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<ClubReportCardDto[]>>(`/v1/age-groups/${ageGroupId}/report-cards`);
      return response.data;
    },

    /**
     * Get development plans for a specific age group
     */
    getDevelopmentPlans: async (ageGroupId: string): Promise<ApiResponse<AgeGroupDevelopmentPlanSummaryDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<AgeGroupDevelopmentPlanSummaryDto[]>>(`/v1/age-groups/${ageGroupId}/development-plans`);
      return response.data;
    },

    /**
     * Create a new age group
     */
    create: async (request: CreateAgeGroupRequest): Promise<ApiResponse<AgeGroupDetailDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<AgeGroupDetailDto>>(
          `/v1/clubs/${request.clubId}/age-groups`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing age group
     */
    update: async (ageGroupId: string, request: UpdateAgeGroupRequest): Promise<ApiResponse<AgeGroupDetailDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<AgeGroupDetailDto>>(
          `/v1/age-groups/${ageGroupId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  tactics: {
    /**
     * Get tactics at club level
     */
    getByClub: async (clubId: string): Promise<ApiResponse<TacticsByScopeResponseDto>> => {
      const response = await axiosInstance.get<ApiResponse<TacticsByScopeResponseDto>>(`/v1/clubs/${clubId}/tactics`);
      return response.data;
    },

    /**
     * Get tactics at age group level (includes inherited club tactics)
     */
    getByAgeGroup: async (clubId: string, ageGroupId: string): Promise<ApiResponse<TacticsByScopeResponseDto>> => {
      const response = await axiosInstance.get<ApiResponse<TacticsByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/tactics`);
      return response.data;
    },

    /**
     * Get tactics at team level (includes inherited club and age group tactics)
     */
    getByTeam: async (clubId: string, ageGroupId: string, teamId: string): Promise<ApiResponse<TacticsByScopeResponseDto>> => {
      const response = await axiosInstance.get<ApiResponse<TacticsByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics`);
      return response.data;
    },

    /**
     * Get a tactic by ID with full detail
     */
    getById: async (tacticId: string): Promise<ApiResponse<TacticDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<TacticDetailDto>>(`/v1/tactics/${tacticId}`);
      return response.data;
    },

    /**
     * Create a new tactic
     */
    create: async (request: CreateTacticRequest): Promise<ApiResponse<TacticDetailDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<TacticDetailDto>>(
          '/v1/tactics',
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing tactic
     */
    update: async (tacticId: string, request: UpdateTacticRequest): Promise<ApiResponse<TacticDetailDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<TacticDetailDto>>(
          `/v1/tactics/${tacticId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  drills: {
    /**
     * Get drills at club level
     */
    getByClub: async (
      clubId: string,
      options?: { category?: string; search?: string }
    ): Promise<ApiResponse<DrillsByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillsByScopeResponseDto>>(`/v1/clubs/${clubId}/drills${queryString}`);
      return response.data;
    },

    /**
     * Get drills at age group level (includes inherited club drills)
     */
    getByAgeGroup: async (
      clubId: string,
      ageGroupId: string,
      options?: { category?: string; search?: string }
    ): Promise<ApiResponse<DrillsByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillsByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/drills${queryString}`);
      return response.data;
    },

    /**
     * Get drills at team level (includes inherited club and age group drills)
     */
    getByTeam: async (
      clubId: string,
      ageGroupId: string,
      teamId: string,
      options?: { category?: string; search?: string }
    ): Promise<ApiResponse<DrillsByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillsByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/drills${queryString}`);
      return response.data;
    },

    /**
     * Get a drill by ID with full detail
     */
    getById: async (drillId: string): Promise<ApiResponse<DrillDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<DrillDetailDto>>(`/v1/drills/${drillId}`);
      return response.data;
    },

    /**
     * Create a new drill
     */
    create: async (request: CreateDrillRequest): Promise<ApiResponse<DrillDetailDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<DrillDetailDto>>(
          '/v1/drills',
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing drill
     */
    update: async (drillId: string, request: UpdateDrillRequest): Promise<ApiResponse<DrillDetailDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<DrillDetailDto>>(
          `/v1/drills/${drillId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  drillTemplates: {
    /**
     * Get drill templates at club level
     */
    getByClub: async (
      clubId: string,
      options?: { category?: string; search?: string; attributes?: string[] }
    ): Promise<ApiResponse<DrillTemplatesByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      if (options?.attributes && options.attributes.length > 0) params.append('attributes', options.attributes.join(','));
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillTemplatesByScopeResponseDto>>(`/v1/clubs/${clubId}/drill-templates${queryString}`);
      return response.data;
    },

    /**
     * Get drill templates at age group level (includes inherited club templates)
     */
    getByAgeGroup: async (
      clubId: string,
      ageGroupId: string,
      options?: { category?: string; search?: string; attributes?: string[] }
    ): Promise<ApiResponse<DrillTemplatesByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      if (options?.attributes && options.attributes.length > 0) params.append('attributes', options.attributes.join(','));
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillTemplatesByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/drill-templates${queryString}`);
      return response.data;
    },

    /**
     * Get drill templates at team level (includes inherited club and age group templates)
     */
    getByTeam: async (
      clubId: string,
      ageGroupId: string,
      teamId: string,
      options?: { category?: string; search?: string; attributes?: string[] }
    ): Promise<ApiResponse<DrillTemplatesByScopeResponseDto>> => {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      if (options?.attributes && options.attributes.length > 0) params.append('attributes', options.attributes.join(','));
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get<ApiResponse<DrillTemplatesByScopeResponseDto>>(`/v1/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/drill-templates${queryString}`);
      return response.data;
    },

    /**
     * Get a drill template by ID with full detail
     */
    getById: async (templateId: string): Promise<ApiResponse<DrillTemplateDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<DrillTemplateDetailDto>>(`/v1/drill-templates/${templateId}`);
      return response.data;
    },

    /**
     * Create a new drill template
     */
    create: async (request: CreateDrillTemplateRequest): Promise<ApiResponse<DrillTemplateDetailDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<DrillTemplateDetailDto>>(
          '/v1/drill-templates',
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing drill template
     */
    update: async (templateId: string, request: UpdateDrillTemplateRequest): Promise<ApiResponse<DrillTemplateDetailDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<DrillTemplateDetailDto>>(
          `/v1/drill-templates/${templateId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  developmentPlans: {
    /**
     * Get a development plan by ID with full detail
     */
    getById: async (planId: string): Promise<ApiResponse<DevelopmentPlanDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<DevelopmentPlanDetailDto>>(`/v1/development-plans/${planId}`);
      return response.data;
    },

    /**
     * Create a new development plan
     */
    create: async (request: CreateDevelopmentPlanRequest): Promise<ApiResponse<DevelopmentPlanDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<DevelopmentPlanDto>>(
          '/v1/development-plans',
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing development plan
     */
    update: async (planId: string, request: UpdateDevelopmentPlanRequest): Promise<ApiResponse<DevelopmentPlanDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<DevelopmentPlanDto>>(
          `/v1/development-plans/${planId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  players: {
    /**
     * Get a player by ID
     */
    getById: async (playerId: string): Promise<ApiResponse<PlayerDto>> => {
      const response = await axiosInstance.get<ApiResponse<PlayerDto>>(`/v1/players/${playerId}`);
      return response.data;
    },

    /**
     * Update an existing player
     */
    update: async (playerId: string, data: UpdatePlayerRequest): Promise<ApiResponse<PlayerDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<PlayerDto>>(
          `/v1/players/${playerId}`,
          data
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Get player abilities with attributes and evaluation history
     */
    getAbilities: async (playerId: string): Promise<ApiResponse<PlayerAbilitiesDto>> => {
      const response = await axiosInstance.get<ApiResponse<PlayerAbilitiesDto>>(`/v1/players/${playerId}/abilities`);
      return response.data;
    },

    /**
     * Create a new ability evaluation for a player
     */
    createAbilityEvaluation: async (
      playerId: string,
      request: CreatePlayerAbilityEvaluationRequest
    ): Promise<ApiResponse<PlayerAbilityEvaluationDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<PlayerAbilityEvaluationDto>>(
          `/v1/players/${playerId}/abilities/evaluations`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing ability evaluation
     */
    updateAbilityEvaluation: async (
      playerId: string,
      evaluationId: string,
      request: UpdatePlayerAbilityEvaluationRequest
    ): Promise<ApiResponse<PlayerAbilityEvaluationDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<PlayerAbilityEvaluationDto>>(
          `/v1/players/${playerId}/abilities/evaluations/${evaluationId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Delete an ability evaluation
     */
    deleteAbilityEvaluation: async (playerId: string, evaluationId: string): Promise<void> => {
      await axiosInstance.delete(`/v1/players/${playerId}/abilities/evaluations/${evaluationId}`);
    },

    /**
     * Get player photo album
     */
    getAlbum: async (playerId: string): Promise<ApiResponse<PlayerAlbumDto>> => {
      const response = await axiosInstance.get<ApiResponse<PlayerAlbumDto>>(
        `/v1/players/${playerId}/album`
      );
      return response.data;
    },

    /**
     * Get recent performance data for a player
     */
    getRecentPerformances: async (playerId: string, limit?: number): Promise<ApiResponse<PlayerRecentPerformanceDto[]>> => {
      const params = limit ? `?limit=${limit}` : '';
      const response = await axiosInstance.get<ApiResponse<PlayerRecentPerformanceDto[]>>(
        `/v1/players/${playerId}/recent-performances${params}`
      );
      return response.data;
    },

    /**
     * Get upcoming matches for a player
     */
    getUpcomingMatches: async (playerId: string, limit?: number): Promise<ApiResponse<PlayerUpcomingMatchDto[]>> => {
      const params = limit ? `?limit=${limit}` : '';
      const response = await axiosInstance.get<ApiResponse<PlayerUpcomingMatchDto[]>>(
        `/v1/players/${playerId}/upcoming-matches${params}`
      );
      return response.data;
    },

    /**
     * Get all report cards for a player
     */
    getReports: async (playerId: string): Promise<ApiResponse<PlayerReportSummaryDto[]>> => {
      const response = await axiosInstance.get<ApiResponse<PlayerReportSummaryDto[]>>(
        `/v1/players/${playerId}/reports`
      );
      return response.data;
    },
  },

  trainingSessions: {
    /**
     * Get a training session by ID with full detail
     */
    getById: async (sessionId: string): Promise<ApiResponse<TrainingSessionDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<TrainingSessionDetailDto>>(`/v1/training-sessions/${sessionId}`);
      return response.data;
    },

    /**
     * Create a new training session
     */
    create: async (request: CreateTrainingSessionRequest): Promise<ApiResponse<TrainingSessionDetailDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<TrainingSessionDetailDto>>(
          '/v1/training-sessions',
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing training session
     */
    update: async (sessionId: string, request: UpdateTrainingSessionRequest): Promise<ApiResponse<TrainingSessionDetailDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<TrainingSessionDetailDto>>(
          `/v1/training-sessions/${sessionId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  matches: {
    /**
     * Get a match by ID with full detail
     */
    getById: async (matchId: string): Promise<ApiResponse<MatchDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<MatchDetailDto>>(`/v1/matches/${matchId}`);
      return response.data;
    },

    /**
     * Get a match report by match ID with extended details
     * Optimized endpoint for report view with coach photos, player photos, etc.
     */
    getReport: async (matchId: string): Promise<ApiResponse<MatchDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<MatchDetailDto>>(`/v1/matches/${matchId}/report`);
      return response.data;
    },

    /**
     * Create a new match
     */
    create: async (request: CreateMatchRequest): Promise<ApiResponse<MatchDetailDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<MatchDetailDto>>(
          '/v1/matches',
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing match
     */
    update: async (matchId: string, request: UpdateMatchRequest): Promise<ApiResponse<MatchDetailDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<MatchDetailDto>>(
          `/v1/matches/${matchId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  coaches: {
    /**
     * Get a coach by ID with full profile details
     */
    getById: async (coachId: string): Promise<ApiResponse<CoachDetailDto>> => {
      const response = await axiosInstance.get<ApiResponse<CoachDetailDto>>(`/v1/coaches/${coachId}`);
      return response.data;
    },

    /**
     * Update an existing coach
     */
    update: async (coachId: string, request: UpdateCoachRequest): Promise<ApiResponse<CoachDetailDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<CoachDetailDto>>(
          `/v1/coaches/${coachId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },

  reports: {
    /**
     * Get a report card by ID
     */
    getById: async (reportId: string): Promise<ApiResponse<ReportCardDto>> => {
      const response = await axiosInstance.get<ApiResponse<ReportCardDto>>(`/v1/reports/${reportId}`);
      return response.data;
    },

    /**
     * Create a new report card
     */
    create: async (request: CreateReportCardRequest): Promise<ApiResponse<ReportCardDto>> => {
      try {
        const response = await axiosInstance.post<ApiResponse<ReportCardDto>>(
          '/v1/reports',
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    /**
     * Update an existing report card
     */
    update: async (reportId: string, request: UpdateReportCardRequest): Promise<ApiResponse<ReportCardDto>> => {
      try {
        const response = await axiosInstance.put<ApiResponse<ReportCardDto>>(
          `/v1/reports/${reportId}`,
          request
        );
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },
};