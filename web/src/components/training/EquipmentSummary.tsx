import {
  Circle,
  Goal,
  Package,
  RectangleHorizontal,
  UserRound,
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
  showEmpty?: boolean;
}

export default function EquipmentSummary({
  equipment,
  title = 'Equipment Needed',
  showEmpty = false,
}: EquipmentSummaryProps) {
  if (equipment.length === 0 && !showEmpty) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {title}
      </h3>
      {equipment.length === 0 ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          Add items to your diagram to see equipment needed.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {equipment.map((item) => {
            const isPlayer = item.type.startsWith('player-');
            const Icon = isPlayer ? UserRound : (ICON_MAP[item.type] ?? Circle);
            const colorClass = COLOR_MAP[item.type] ?? 'text-gray-500';
            return (
              <div
                key={item.type}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                {isPlayer && item.color ? (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                ) : (
                  <Icon className={`w-4 h-4 ${colorClass}`} />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.count}× {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
