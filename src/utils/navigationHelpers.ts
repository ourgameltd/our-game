import { Routes } from '@utils/routes';
import { NavigationTab } from '@components/navigation/PageNavigation';

/**
 * Generate navigation tabs for Club pages
 */
export const getClubNavigationTabs = (clubId: string): NavigationTab[] => [
  { label: 'Overview', path: Routes.club(clubId) },
  { label: 'Players', path: Routes.clubPlayers(clubId) },
  { label: 'Coaches', path: Routes.clubCoaches(clubId) },
  { label: 'Matches', path: Routes.clubMatches(clubId) },
  { label: 'Age Groups', path: Routes.ageGroups(clubId) },
  { label: 'Kits', path: Routes.clubKits(clubId) },
  { label: 'Ethos & Principles', path: Routes.clubEthos(clubId) },
];

/**
 * Generate navigation tabs for Age Group pages
 */
export const getAgeGroupNavigationTabs = (clubId: string, ageGroupId: string): NavigationTab[] => [
  { label: 'Overview', path: Routes.ageGroup(clubId, ageGroupId) },
  { label: 'Players', path: Routes.ageGroupPlayers(clubId, ageGroupId) },
  { label: 'Coaches', path: Routes.ageGroupCoaches(clubId, ageGroupId) },
  { label: 'Matches', path: Routes.ageGroupMatches(clubId, ageGroupId) },
  { label: 'Teams', path: Routes.teams(clubId, ageGroupId) },
];

/**
 * Generate navigation tabs for Team pages
 */
export const getTeamNavigationTabs = (clubId: string, ageGroupId: string, teamId: string): NavigationTab[] => [
  { label: 'Overview', path: Routes.team(clubId, ageGroupId, teamId) },
  { label: 'Players', path: Routes.teamSquad(clubId, ageGroupId, teamId) },
  { label: 'Coaches', path: Routes.teamCoaches(clubId, ageGroupId, teamId) },
  { label: 'Matches', path: Routes.matches(clubId, ageGroupId, teamId) },
  { label: 'Kits', path: Routes.teamKits(clubId, ageGroupId, teamId) },
];

/**
 * Generate navigation tabs for Player pages
 */
export const getPlayerNavigationTabs = (clubId: string, ageGroupId: string, playerId: string): NavigationTab[] => [
  { label: 'Overview', path: Routes.player(clubId, ageGroupId, playerId) },
  { label: 'Abilities', path: Routes.playerAbilities(clubId, ageGroupId, playerId) },
  { label: 'Report Cards', path: Routes.playerReportCard(clubId, ageGroupId, playerId) },
  { label: 'Development Plans', path: Routes.playerDevelopmentPlans(clubId, ageGroupId, playerId) }
];

/**
 * Generate navigation tabs for Coach pages
 */
export const getCoachNavigationTabs = (clubId: string, coachId: string): NavigationTab[] => [
  { label: 'Settings', path: Routes.coachSettings(clubId, coachId) }
];
