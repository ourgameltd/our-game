import type { DrillDiagramConfigDto } from '@/api/client';

export interface EquipmentItem {
  type: string;
  label: string;
  count: number;
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

/**
 * Extracts equipment counts from a drill diagram config by taking the
 * highest count of each equipment type across all frames. Frames represent
 * the same physical items in different positions, not additional equipment.
 */
export function extractEquipmentFromDiagram(
  config: DrillDiagramConfigDto | undefined,
): EquipmentItem[] {
  if (!config?.frames?.length) return [];

  const maxCounts = new Map<string, number>();

  for (const frame of config.frames) {
    const frameCounts = new Map<string, number>();
    if (frame.objects?.length) {
      for (const obj of frame.objects) {
        const type = String(obj.type ?? '').toLowerCase();
        if (type in EQUIPMENT_TYPES) {
          frameCounts.set(type, (frameCounts.get(type) ?? 0) + 1);
        }
      }
    }
    for (const [type, count] of frameCounts) {
      maxCounts.set(type, Math.max(maxCounts.get(type) ?? 0, count));
    }
  }

  return TYPE_ORDER
    .filter((t) => maxCounts.has(t))
    .map((t) => ({
      type: t,
      label: EQUIPMENT_TYPES[t],
      count: maxCounts.get(t)!,
    }));
}

/**
 * Aggregates equipment items from multiple drills into combined totals.
 */
export function aggregateEquipment(drillEquipment: EquipmentItem[][]): EquipmentItem[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const items of drillEquipment) {
    for (const item of items) {
      const existing = counts.get(item.type);
      if (existing) {
        existing.count += item.count;
      } else {
        counts.set(item.type, { label: item.label, count: item.count });
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
