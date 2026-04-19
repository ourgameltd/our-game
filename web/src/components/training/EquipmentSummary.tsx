import {
  Circle,
  Goal,
  RectangleHorizontal,
  Package,
} from 'lucide-react';
import type { EquipmentItem } from '@/utils/equipmentFromDiagram';

const ICON_MAP: Record<string, typeof Circle> = {
  cone: Goal,
  ball: Circle,
  marker: Circle,
  mannequin: RectangleHorizontal,
  goal: RectangleHorizontal,
};

const COLOR_MAP: Record<string, string> = {
  cone: 'text-amber-500',
  ball: 'text-gray-800 dark:text-gray-200',
  marker: 'text-yellow-400',
  mannequin: 'text-orange-500',
  goal: 'text-gray-600 dark:text-gray-300',
};

interface EquipmentSummaryProps {
  equipment: EquipmentItem[];
  title?: string;
}

export default function EquipmentSummary({
  equipment,
  title = 'Equipment Needed',
}: EquipmentSummaryProps) {
  if (equipment.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-3">
        {equipment.map((item) => {
          const Icon = ICON_MAP[item.type] ?? Circle;
          const colorClass = COLOR_MAP[item.type] ?? 'text-gray-500';
          return (
            <div
              key={item.type}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <Icon className={`w-4 h-4 ${colorClass}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.count}× {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
