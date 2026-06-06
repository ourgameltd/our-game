import type { DrillDiagramConfigDto } from '@/api/client';

export interface EquipmentItem {
  type: string;
  label: string;
  count: number;
  /** Hex colour — present on player items for swatch rendering */
  color?: string;
}

const EQUIPMENT_TYPES: Record<string, string> = {
  cone: 'Cones',
  ball: 'Balls',
  marker: 'Markers',
  mannequin: 'Mannequins',
  goal: 'Goals',
};

/** Display order for equipment types */
const TYPE_ORDER = ['cone', 'ball', 'marker', 'mannequin', 'goal'];

/** Reverse mapping from label back to type key */
const LABEL_TO_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(EQUIPMENT_TYPES).map(([k, v]) => [v, k]),
);

const PLAYER_COLOR_NAMES: Record<string, string> = {
  '#1d4ed8': 'Blue',
  '#dc2626': 'Red',
  '#16a34a': 'Green',
  '#f59e0b': 'Amber',
  '#7c3aed': 'Purple',
  '#ec4899': 'Pink',
  '#111827': 'Black',
  '#ffffff': 'White',
};

const DEFAULT_PLAYER_COLOR = '#1d4ed8';

/**
 * Extracts equipment counts from a drill diagram config by taking the
 * highest count of each equipment type across all frames. Frames represent
 * the same physical items in different positions, not additional equipment.
 * Players are grouped by colour and shown before other equipment.
 */
export function extractEquipmentFromDiagram(
  config: DrillDiagramConfigDto | undefined,
): EquipmentItem[] {
  if (!config?.frames?.length) return [];

  const maxCounts = new Map<string, number>();
  const maxPlayerCounts = new Map<string, number>(); // hex color → max count

  for (const frame of config.frames) {
    const frameCounts = new Map<string, number>();
    const framePlayerCounts = new Map<string, number>();

    if (frame.objects?.length) {
      for (const obj of frame.objects) {
        const type = String((obj as Record<string, unknown>).type ?? '').toLowerCase();
        if (type === 'player') {
          const color = String((obj as Record<string, unknown>).color ?? DEFAULT_PLAYER_COLOR).toLowerCase();
          framePlayerCounts.set(color, (framePlayerCounts.get(color) ?? 0) + 1);
        } else if (type in EQUIPMENT_TYPES) {
          frameCounts.set(type, (frameCounts.get(type) ?? 0) + 1);
        }
      }
    }

    for (const [type, count] of frameCounts) {
      maxCounts.set(type, Math.max(maxCounts.get(type) ?? 0, count));
    }
    for (const [color, count] of framePlayerCounts) {
      maxPlayerCounts.set(color, Math.max(maxPlayerCounts.get(color) ?? 0, count));
    }
  }

  const playerItems: EquipmentItem[] = Array.from(maxPlayerCounts.entries())
    .sort(([, a], [, b]) => a - b) // consistent order by count descending
    .sort(([a], [b]) => (PLAYER_COLOR_NAMES[a] ?? a).localeCompare(PLAYER_COLOR_NAMES[b] ?? b))
    .map(([color, count]) => ({
      type: `player-${color}`,
      label: 'Players',
      count,
      color,
    }));

  const equipmentItems = TYPE_ORDER
    .filter((t) => maxCounts.has(t))
    .map((t) => ({
      type: t,
      label: EQUIPMENT_TYPES[t],
      count: maxCounts.get(t)!,
    }));

  return [...playerItems, ...equipmentItems];
}

/**
 * Aggregates equipment items from multiple drills into combined totals.
 */
export function aggregateEquipment(drillEquipment: EquipmentItem[][]): EquipmentItem[] {
  const counts = new Map<string, { label: string; count: number; color?: string }>();

  for (const items of drillEquipment) {
    for (const item of items) {
      const existing = counts.get(item.type);
      if (existing) {
        existing.count += item.count;
      } else {
        counts.set(item.type, { label: item.label, count: item.count, color: item.color });
      }
    }
  }

  const playerItems: EquipmentItem[] = Array.from(counts.entries())
    .filter(([t]) => t.startsWith('player-'))
    .sort(([, a], [, b]) => a.label.localeCompare(b.label))
    .map(([type, { label, count, color }]) => ({ type, label, count, color }));

  const equipmentItems = TYPE_ORDER
    .filter((t) => counts.has(t))
    .map((t) => ({
      type: t,
      label: counts.get(t)!.label,
      count: counts.get(t)!.count,
    }));

  return [...playerItems, ...equipmentItems];
}

/**
 * Parses backend equipment strings (e.g. "4x Cones") into EquipmentItem objects,
 * then aggregates across all drills.
 */
export function aggregateEquipmentStrings(drillEquipmentArrays: string[][]): EquipmentItem[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const equipment of drillEquipmentArrays) {
    for (const entry of equipment) {
      const match = entry.match(/^(\d+)x\s+(.+)$/);
      if (!match) continue;
      const count = parseInt(match[1], 10);
      const label = match[2];
      const type = LABEL_TO_TYPE[label];
      if (!type) continue;
      const existing = counts.get(type);
      if (existing) {
        existing.count += count;
      } else {
        counts.set(type, { label, count });
      }
    }
  }

  return TYPE_ORDER
    .filter((t) => counts.has(t))
    .map((t) => ({
      type: t,
      label: counts.get(t)!.label,
      count: counts.get(t)!.count,
    }));
}
