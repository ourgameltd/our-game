/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AgeGroupDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  clubId?: string;
  name?: string;
  code?: string;
  level?: string;
  seasons?: string[];
  defaultSquadSize?: string;
  /** @format int32 */
  teamCount?: number;
  /** @format int32 */
  playerCount?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface ApiResponseClubDetailDto {
  success?: boolean;
  data?: ClubDetailDto;
  error?: ErrorResponse;
  /** @format int32 */
  statusCode?: number;
}

export interface ApiResponseMatchDto {
  success?: boolean;
  data?: MatchDto;
  error?: ErrorResponse;
  /** @format int32 */
  statusCode?: number;
}

export interface ApiResponseMatchLineupDto {
  success?: boolean;
  data?: MatchLineupDto;
  error?: ErrorResponse;
  /** @format int32 */
  statusCode?: number;
}

export interface ApiResponsePlayerAttributesDto {
  success?: boolean;
  data?: PlayerAttributesDto;
  error?: ErrorResponse;
  /** @format int32 */
  statusCode?: number;
}

export interface ApiResponsePlayerProfileDto {
  success?: boolean;
  data?: PlayerProfileDto;
  error?: ErrorResponse;
  /** @format int32 */
  statusCode?: number;
}

export interface ApiResponseTeamDetailDto {
  success?: boolean;
  data?: TeamDetailDto;
  error?: ErrorResponse;
  /** @format int32 */
  statusCode?: number;
}

export interface ClubDetailDto {
  /** @format uuid */
  id?: string;
  name?: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  city?: string;
  country?: string;
  venue?: string;
  address?: string;
  /** @format int32 */
  foundedYear?: number;
  history?: string;
  ethos?: string;
  principles?: string[];
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  statistics?: ClubStatisticsDto;
}

export interface ClubStatisticsDto {
  /** @format int32 */
  totalPlayers?: number;
  /** @format int32 */
  totalTeams?: number;
  /** @format int32 */
  totalAgeGroups?: number;
  /** @format int32 */
  totalCoaches?: number;
  /** @format int32 */
  matchesPlayed?: number;
  /** @format int32 */
  matchesWon?: number;
  /** @format int32 */
  matchesDrawn?: number;
  /** @format int32 */
  matchesLost?: number;
  /** @format int32 */
  goalsScored?: number;
  /** @format int32 */
  goalsConceded?: number;
}

export interface DateOnly {
  /** @format int32 */
  year?: number;
  /** @format int32 */
  month?: number;
  /** @format int32 */
  day?: number;
  /**
   * @format int32
   * @default 0
   */
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** @format int32 */
  dayOfYear?: number;
  /** @format int32 */
  dayNumber?: number;
}

export interface ErrorResponse {
  message?: string;
  code?: string;
  validationErrors?: Record<string, ListString>;
  details?: string;
}

export interface LineupPlayerDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  playerId?: string;
  playerFirstName?: string;
  playerLastName?: string;
  position?: string;
  /** @format int32 */
  positionIndex?: number;
  isStarting?: boolean;
  isSubstitute?: boolean;
  isCaptain?: boolean;
}

export type ListString = string[];

export interface MatchDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  teamId?: string;
  seasonId?: string;
  squadSize?: string;
  opposition?: string;
  /** @format date-time */
  matchDate?: string;
  /** @format date-time */
  meetTime?: string;
  /** @format date-time */
  kickOffTime?: string;
  location?: string;
  isHome?: boolean;
  competition?: string;
  /** @format uuid */
  primaryKitId?: string;
  /** @format uuid */
  secondaryKitId?: string;
  /** @format uuid */
  goalkeeperKitId?: string;
  /** @format int32 */
  homeScore?: number;
  /** @format int32 */
  awayScore?: number;
  status?: string;
  isLocked?: boolean;
  notes?: string;
  weatherCondition?: string;
  /** @format int32 */
  weatherTemperature?: number;
  coachIds?: string[];
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface MatchLineupDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  matchId?: string;
  /** @format uuid */
  formationId?: string;
  /** @format uuid */
  tacticId?: string;
  lineupPlayers?: LineupPlayerDto[];
}

export interface PlayerAttributesDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  playerId?: string;
  /** @format int32 */
  ballControl?: number;
  /** @format int32 */
  crossing?: number;
  /** @format int32 */
  weakFoot?: number;
  /** @format int32 */
  dribbling?: number;
  /** @format int32 */
  finishing?: number;
  /** @format int32 */
  freeKick?: number;
  /** @format int32 */
  heading?: number;
  /** @format int32 */
  longPassing?: number;
  /** @format int32 */
  longShot?: number;
  /** @format int32 */
  penalties?: number;
  /** @format int32 */
  shortPassing?: number;
  /** @format int32 */
  shotPower?: number;
  /** @format int32 */
  slidingTackle?: number;
  /** @format int32 */
  standingTackle?: number;
  /** @format int32 */
  volleys?: number;
  /** @format int32 */
  acceleration?: number;
  /** @format int32 */
  agility?: number;
  /** @format int32 */
  balance?: number;
  /** @format int32 */
  jumping?: number;
  /** @format int32 */
  pace?: number;
  /** @format int32 */
  reactions?: number;
  /** @format int32 */
  sprintSpeed?: number;
  /** @format int32 */
  stamina?: number;
  /** @format int32 */
  strength?: number;
  /** @format int32 */
  aggression?: number;
  /** @format int32 */
  attackingPosition?: number;
  /** @format int32 */
  awareness?: number;
  /** @format int32 */
  communication?: number;
  /** @format int32 */
  composure?: number;
  /** @format int32 */
  defensivePositioning?: number;
  /** @format int32 */
  interceptions?: number;
  /** @format int32 */
  marking?: number;
  /** @format int32 */
  positivity?: number;
  /** @format int32 */
  positioning?: number;
  /** @format int32 */
  vision?: number;
  /** @format date-time */
  updatedAt?: string;
}

export interface PlayerProfileDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  clubId?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  dateOfBirth?: DateOnly;
  photo?: string;
  associationId?: string;
  preferredPositions?: string[];
  /** @format int32 */
  overallRating?: number;
  allergies?: string[];
  medicalConditions?: string[];
  isArchived?: boolean;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  ageGroupIds?: string[];
  teamIds?: string[];
}

export interface TeamDetailDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  clubId?: string;
  /** @format uuid */
  ageGroupId?: string;
  name?: string;
  shortName?: string;
  level?: string;
  season?: string;
  /** @format uuid */
  formationId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isArchived?: boolean;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  coachIds?: string[];
  statistics?: TeamStatisticsDto;
}

export interface TeamStatisticsDto {
  /** @format int32 */
  playerCount?: number;
  /** @format int32 */
  matchesPlayed?: number;
  /** @format int32 */
  matchesWon?: number;
  /** @format int32 */
  matchesDrawn?: number;
  /** @format int32 */
  matchesLost?: number;
  /** @format int32 */
  goalsScored?: number;
  /** @format int32 */
  goalsConceded?: number;
  /** @format int32 */
  goalDifference?: number;
}

export interface ApiResponseList1 {
  success?: boolean;
  data?: AgeGroupDto[];
  error?: ErrorResponse;
  /** @format int32 */
  statusCode?: number;
}
