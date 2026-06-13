/**
 * Maps each outfield position to a priority level (high/medium/low) for each of the
 * 9 competencies (keyed by displayOrder 1-9):
 *   1 Control & Receiving   4 Striking & Finishing  7 Speed & Acceleration
 *   2 Passing & Distribution 5 Defending & Tackling  8 Physical Literacy
 *   3 Dribbling & Manipulation 6 Game Intelligence   9 Mental & Psycho-Social
 */

export type CompetencyPriority = 'high' | 'medium' | 'low';

type PriorityMap = Record<number, CompetencyPriority>;

const POSITION_PRIORITIES: Record<string, PriorityMap> = {
  CB:  { 1:'medium', 2:'medium', 3:'low',    4:'low',    5:'high',   6:'high',   7:'medium', 8:'high',   9:'medium' },
  LB:  { 1:'medium', 2:'medium', 3:'medium', 4:'low',    5:'high',   6:'high',   7:'high',   8:'medium', 9:'low'    },
  RB:  { 1:'medium', 2:'medium', 3:'medium', 4:'low',    5:'high',   6:'high',   7:'high',   8:'medium', 9:'low'    },
  LWB: { 1:'medium', 2:'medium', 3:'high',   4:'low',    5:'high',   6:'medium', 7:'high',   8:'medium', 9:'low'    },
  RWB: { 1:'medium', 2:'medium', 3:'high',   4:'low',    5:'high',   6:'medium', 7:'high',   8:'medium', 9:'low'    },
  CDM: { 1:'medium', 2:'high',   3:'medium', 4:'low',    5:'high',   6:'high',   7:'medium', 8:'medium', 9:'medium' },
  CM:  { 1:'high',   2:'high',   3:'medium', 4:'low',    5:'medium', 6:'high',   7:'medium', 8:'medium', 9:'medium' },
  CAM: { 1:'high',   2:'high',   3:'high',   4:'medium', 5:'low',    6:'high',   7:'medium', 8:'low',    9:'medium' },
  LM:  { 1:'high',   2:'medium', 3:'high',   4:'medium', 5:'low',    6:'medium', 7:'high',   8:'low',    9:'medium' },
  RM:  { 1:'high',   2:'medium', 3:'high',   4:'medium', 5:'low',    6:'medium', 7:'high',   8:'low',    9:'medium' },
  LW:  { 1:'high',   2:'medium', 3:'high',   4:'high',   5:'low',    6:'medium', 7:'high',   8:'low',    9:'medium' },
  RW:  { 1:'high',   2:'medium', 3:'high',   4:'high',   5:'low',    6:'medium', 7:'high',   8:'low',    9:'medium' },
  CF:  { 1:'high',   2:'medium', 3:'high',   4:'high',   5:'low',    6:'medium', 7:'high',   8:'medium', 9:'medium' },
  ST:  { 1:'high',   2:'low',    3:'medium', 4:'high',   5:'low',    6:'medium', 7:'high',   8:'high',   9:'medium' },
};

const PRIORITY_RANK: Record<CompetencyPriority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Returns the highest-priority level for a competency (by displayOrder) across all
 * of the player's positions. GK positions are ignored — GK competency names are already
 * handled separately; returning null signals "use default sorting".
 */
export function getCompetencyPriority(
  positions: string[],
  displayOrder: number,
): CompetencyPriority | null {
  const outfield = positions.filter(p => p !== 'GK');
  if (!outfield.length) return null;

  let best: CompetencyPriority = 'low';
  for (const pos of outfield) {
    const map = POSITION_PRIORITIES[pos];
    if (!map) continue;
    const p = map[displayOrder];
    if (p && PRIORITY_RANK[p] < PRIORITY_RANK[best]) best = p;
  }
  return best;
}

export interface WithPriority {
  displayOrder: number;
  band?: string | null;
}

/**
 * Returns competencies sorted for the "Areas to Focus" panel:
 *   1. High-priority competencies for the player's positions, weakest band first.
 *   2. Medium-priority competencies, weakest band first.
 *   3. Low-priority competencies, weakest band first (fallback if not enough above).
 *
 * Falls back to simple ascending-band order when no positions are known or all are GK.
 */
export function prioritisedFocusAreas<T extends WithPriority>(
  competencies: T[],
  positions: string[],
  bandValue: (band: string | null | undefined) => number,
  count = 3,
): T[] {
  const outfield = positions.filter(p => p !== 'GK');

  if (!outfield.length) {
    return [...competencies].sort((a, b) => bandValue(a.band) - bandValue(b.band)).slice(0, count);
  }

  const byLevel = new Map<CompetencyPriority, T[]>([['high', []], ['medium', []], ['low', []]]);
  for (const c of competencies) {
    const priority = getCompetencyPriority(outfield, c.displayOrder) ?? 'low';
    byLevel.get(priority)!.push(c);
  }

  const sortByWeakest = (arr: T[]) => [...arr].sort((a, b) => bandValue(a.band) - bandValue(b.band));

  return [
    ...sortByWeakest(byLevel.get('high')!),
    ...sortByWeakest(byLevel.get('medium')!),
    ...sortByWeakest(byLevel.get('low')!),
  ].slice(0, count);
}
