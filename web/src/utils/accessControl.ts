import { matchPath } from 'react-router-dom';
import type { AccessProfile } from '@/hooks/useAccessProfile';

const SHARED_ALLOWED_PATHS = ['/dashboard', '/profile', '/notifications', '/help'];

const RESTRICTED_ALLOWED_PATH_PATTERNS = [
  '/dashboard/:clubId',
  '/dashboard/:clubId/ethos',
  '/dashboard/:clubId/age-groups',
  '/dashboard/:clubId/age-groups/:ageGroupId',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/new',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/:matchId',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/:matchId/edit',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/training',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/training/new',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/training/:sessionId/edit',
];

const PLAYER_ROUTE_PATTERNS = [
  '/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId',
  '/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/settings',
  '/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/album',
  '/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/abilities',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/settings',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/album',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/abilities',
  '/dashboard/:clubId/players/:playerId/settings',
  '/dashboard/:clubId/players/:playerId/album',
];

const PLAYER_ABILITIES_PATTERNS = [
  '/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/abilities',
  '/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/abilities',
];

function isSharedAllowedPath(pathname: string): boolean {
  return SHARED_ALLOWED_PATHS.includes(pathname);
}

function matchesAnyPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => !!matchPath({ path: pattern, end: true }, pathname));
}

function getPlayerIdFromPath(pathname: string): string | null {
  for (const pattern of PLAYER_ROUTE_PATTERNS) {
    const match = matchPath({ path: pattern, end: true }, pathname);
    if (match?.params.playerId) {
      return match.params.playerId;
    }
  }
  return null;
}

export function canViewPlayerAbilities(profile: AccessProfile): boolean {
  return !profile.isRestrictedLinkedAccount;
}

export function canAccessPath(pathname: string, profile: AccessProfile): boolean {
  if (!profile.isRestrictedLinkedAccount) {
    return true;
  }

  if (isSharedAllowedPath(pathname)) {
    return true;
  }

  if (matchesAnyPattern(pathname, RESTRICTED_ALLOWED_PATH_PATTERNS)) {
    return true;
  }

  const linkedPlayerId = getPlayerIdFromPath(pathname);
  if (linkedPlayerId) {
    if (!profile.linkedPlayerIds.includes(linkedPlayerId)) {
      return false;
    }

    if (!canViewPlayerAbilities(profile) && matchesAnyPattern(pathname, PLAYER_ABILITIES_PATTERNS)) {
      return false;
    }

    return true;
  }

  return false;
}