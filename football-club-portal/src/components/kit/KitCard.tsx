import { Kit } from '@/types';

interface KitCardProps {
  kit: Kit;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function KitCard({ kit, onClick, onEdit, onDelete, showActions = true }: KitCardProps) {
  return (
    <div 
      className={`card-hover ${onClick ? 'cursor-pointer' : ''} ${!kit.isActive ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{kit.name}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {kit.type} Kit
          </span>
        </div>
        {!kit.isActive && (
          <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            Inactive
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Shirt */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shirt</div>
          <div 
            className="w-full aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: kit.shirtColor }}
          />
        </div>

        {/* Shorts */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shorts</div>
          <div 
            className="w-full aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: kit.shortsColor }}
          />
        </div>

        {/* Socks */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Socks</div>
          <div 
            className="w-full aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: kit.socksColor }}
          />
        </div>
      </div>

      {showActions && (onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
