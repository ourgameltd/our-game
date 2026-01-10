import { AlertTriangle, X } from 'lucide-react';
import { TacticalPositionOverride } from '@/types';

interface OverrideEntry {
  positionIndex: number;
  override: TacticalPositionOverride;
}

interface ResetOverridesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  overrides: Record<number, TacticalPositionOverride>;
  positions: string[]; // Array of position labels
}

export default function ResetOverridesModal({
  isOpen,
  onClose,
  onConfirm,
  overrides,
  positions,
}: ResetOverridesModalProps) {
  if (!isOpen) return null;

  // Convert Record to array for iteration
  const overrideEntries: OverrideEntry[] = Object.entries(overrides).map(([key, value]) => ({
    positionIndex: parseInt(key, 10),
    override: value,
  }));

  const getOverrideDescription = (override: TacticalPositionOverride): string[] => {
    const changes: string[] = [];
    
    if (override.x !== undefined || override.y !== undefined) {
      changes.push('position');
    }
    if (override.direction !== undefined) {
      changes.push('direction');
    }
    
    return changes;
  };

  const totalOverrides = overrideEntries.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reset All Overrides?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This action will remove all customizations and revert to the parent formation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Overrides to be Lost
              </h3>
              <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                {totalOverrides} {totalOverrides === 1 ? 'position' : 'positions'}
              </span>
            </div>
            
            {overrideEntries.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                No overrides to reset
              </p>
            ) : (
              <div className="space-y-2">
                {overrideEntries.map(({ positionIndex, override }) => {
                  const position = positions[positionIndex] || `Position ${positionIndex}`;
                  const changes = getOverrideDescription(override);
                  
                  return (
                    <div
                      key={positionIndex}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                          {position}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          Position {positionIndex + 1} ({position})
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Modified: {changes.join(', ')}
                        </div>
                        
                        {/* Show details of changes */}
                        <div className="mt-2 space-y-1">
                          {override.direction && (
                            <div className="text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Direction:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300 font-medium capitalize">
                                {override.direction}
                              </span>
                            </div>
                          )}
                          {(override.x !== undefined || override.y !== undefined) && (
                            <div className="text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Position:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300">
                                {override.x !== undefined ? `X: ${override.x}%` : ''} 
                                {override.y !== undefined ? `Y: ${override.y}%` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                  Warning: This action cannot be undone
                </h4>
                <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
                  All position overrides and directions will be permanently removed.
                  You will need to reconfigure them manually if needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={overrideEntries.length === 0}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Reset All Overrides
          </button>
        </div>
      </div>
    </div>
  );
}
