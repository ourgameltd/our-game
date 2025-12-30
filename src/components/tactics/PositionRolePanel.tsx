import { PlayerPosition } from '@/types';

interface PositionRolePanelProps {
  position: PlayerPosition | null;
  role?: string;
  duties?: string[];
  instructions?: string;
  onRoleChange?: (role: string) => void;
  onDutiesChange?: (duties: string[]) => void;
  onInstructionsChange?: (instructions: string) => void;
}

/**
 * Placeholder component for PositionRolePanel
 * This component will be fully implemented as part of the tactics system
 * TODO: Add full role editing capabilities
 */
export default function PositionRolePanel({
  position,
  role,
  duties = [],
  instructions = '',
  onRoleChange,
  onDutiesChange,
  onInstructionsChange
}: PositionRolePanelProps) {
  if (!position) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Select a position to edit its role
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Position: {position}
      </h3>
      
      <div className="space-y-4">
        {/* Role Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <input
            type="text"
            value={role || ''}
            onChange={(e) => onRoleChange?.(e.target.value)}
            placeholder="e.g., Ball-Playing Defender"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Duties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duties
          </label>
          <textarea
            value={duties.join('\n')}
            onChange={(e) => onDutiesChange?.(e.target.value.split('\n').filter(d => d.trim()))}
            placeholder="One duty per line"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => onInstructionsChange?.(e.target.value)}
            placeholder="Specific tactical instructions for this position"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
