import { Kit } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

interface KitCardProps {
  kit: Kit;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  variant?: 'card' | 'list';
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

export default function KitCard({
  kit,
  onClick,
  onEdit,
  onDelete,
  showActions = true,
  variant = 'card',
}: KitCardProps) {
  const containerClass = variant === 'list'
    ? `bg-white dark:bg-gray-800 p-3 md:p-4 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${onClick ? 'cursor-pointer' : ''} ${!kit.isActive ? 'opacity-60' : ''}`
    : `card-hover p-3 md:p-4 ${onClick ? 'cursor-pointer' : ''} ${!kit.isActive ? 'opacity-60' : ''}`;

  return (
    <div
      className={containerClass}
      onClick={onClick}
    >
      <div className="flex items-stretch gap-3">
        <div
          className={`w-1 self-stretch rounded-full shrink-0 ${
            kit.isActive ? 'bg-primary-500 dark:bg-primary-400' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        />

        <div className="flex-1 min-w-0">
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
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="btn-sm btn-secondary gap-1.5"
                    aria-label={`Edit ${kit.name}`}
                    title={`Edit ${kit.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="btn-sm btn-danger gap-1.5"
                    aria-label={`Delete ${kit.name}`}
                    title={`Delete ${kit.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
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
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="btn-sm btn-secondary gap-1.5 flex-1 justify-center"
                    aria-label={`Edit ${kit.name}`}
                    title={`Edit ${kit.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="btn-sm btn-danger gap-1.5 flex-1 justify-center"
                    aria-label={`Delete ${kit.name}`}
                    title={`Delete ${kit.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
