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
 * Extracts equipment counts from a drill diagram config by counting
 * placed objects of each equipment type across all frames.
 */
export function extractEquipmentFromDiagram(
  config: DrillDiagramConfigDto | undefined,
): EquipmentItem[] {
  if (!config?.frames?.length) return [];

  const counts = new Map<string, number>();

  for (const frame of config.frames) {
    if (!frame.objects?.length) continue;
    for (const obj of frame.objects) {
      const type = String(obj.type ?? '').toLowerCase();
      if (type in EQUIPMENT_TYPES) {
        counts.set(type, (counts.get(type) ?? 0) + 1);
      }
    }
  }

  return TYPE_ORDER
    .filter((t) => counts.has(t))
    .map((t) => ({
      type: t,
      label: EQUIPMENT_TYPES[t],
      count: counts.get(t)!,
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
