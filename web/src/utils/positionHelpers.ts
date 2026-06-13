import type { PlayerPosition } from '@/types';

/**
 * A player is treated as a goalkeeper when their primary (first) preferred position is GK.
 * Mirrors the backend GoalkeeperDetection rule.
 */
export function isGoalkeeper(positions: PlayerPosition[] | string[] | undefined | null): boolean {
  return positions?.[0] === 'GK';
}
