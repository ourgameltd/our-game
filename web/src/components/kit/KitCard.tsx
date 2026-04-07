import { Kit } from '@/types';

interface KitCardProps {
  kit: Kit;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 shrink-0"
      style={{ backgroundColor: color }}
      title={label}
    />
  );
}

export default function KitCard({ kit, onClick, onEdit, onDelete, showActions = true }: KitCardProps) {
  return (
    <div
      className={`card-hover ${onClick ? 'cursor-pointer' : ''} ${!kit.isActive ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Desktop: single row layout */}
      <div className="hidden md:flex items-center gap-4">
        {/* Color swatches */}
        <div className="flex gap-1.5 shrink-0">
          <ColorSwatch color={kit.shirtColor} label="Shirt" />
          <ColorSwatch color={kit.shortsColor} label="Shorts" />
          <ColorSwatch color={kit.socksColor} label="Socks" />
        </div>

        {/* Kit name */}
        <div className="flex-1 min-w-0">
          <span className="font-medium text-gray-900 dark:text-white truncate block">{kit.name}</span>
        </div>

        {/* Type badge */}
        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize shrink-0">
          {kit.type}
        </span>

        {/* Status */}
        {!kit.isActive && (
          <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 shrink-0">
            Inactive
          </span>
        )}

        {/* Actions */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-2 shrink-0">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile: compact card layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1 shrink-0">
              <ColorSwatch color={kit.shirtColor} label="Shirt" />
              <ColorSwatch color={kit.shortsColor} label="Shorts" />
              <ColorSwatch color={kit.socksColor} label="Socks" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">{kit.name}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{kit.type} kit</span>
            </div>
          </div>
          {!kit.isActive && (
            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 shrink-0 ml-2">
              Inactive
            </span>
          )}
        </div>
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="flex-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="flex-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
