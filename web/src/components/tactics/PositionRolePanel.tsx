import { ArrowDown, ArrowRight, ArrowUp, ArrowLeft, ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft, RotateCcw } from 'lucide-react';
import { PlayerDirection, TacticalPositionOverride } from '@/types';
import { playerDirections } from '@/data/referenceData';

interface PositionRolePanelProps {
  positionIndex: number;
  position: string; // Position label (e.g., "CM", "ST")
  override: TacticalPositionOverride | undefined;
  parentData: {
    position?: string;
    x?: number;
    y?: number;
    direction?: PlayerDirection;
  };
  onUpdate: (override: Partial<TacticalPositionOverride>) => void;
  onResetField: (field: 'direction' | 'x' | 'y') => void;
  className?: string;
}

export default function PositionRolePanel({
  positionIndex: _positionIndex,
  position,
  override,
  parentData,
  onUpdate,
  onResetField,
  className = '',
}: PositionRolePanelProps) {
  const currentDirection = override?.direction ?? parentData.direction;
  const isDirectionInherited = override?.direction === undefined && parentData.direction !== undefined;
  const hasPositionOverride = override?.x !== undefined || override?.y !== undefined;

  const handleDirectionChange = (direction: PlayerDirection) => {
    onUpdate({
      direction,
    });
  };

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Position: {position}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure direction and position adjustments
        </p>
      </div>

      <div className="space-y-2">
        {/* Position Override Status */}
        {hasPositionOverride && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Position Adjusted
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Drag on the pitch to reposition, or reset to default
                </p>
              </div>
              <button
                onClick={() => {
                  onResetField('x');
                  onResetField('y');
                }}
                className="text-xs text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-100 dark:hover:bg-orange-800/30"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Position
              </button>
            </div>
          </div>
        )}

        {/* Direction Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Movement Direction
              {isDirectionInherited && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(inherited)</span>
              )}
            </label>
            {!isDirectionInherited && currentDirection && (
              <button
                onClick={() => onResetField('direction')}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                title="Reset to parent"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {/* Primary directions: N, S, E, W */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Primary</p>
              <div className="grid grid-cols-4 gap-2">
                {(['N', 'S', 'E', 'W'] as const).map((dir) => {
                  const dirData = playerDirections.find(d => d.value === dir);
                  const Icon = dir === 'N' ? ArrowUp : dir === 'S' ? ArrowDown : dir === 'E' ? ArrowRight : ArrowLeft;
                  return (
                    <button
                      key={dir}
                      onClick={() => handleDirectionChange(dir)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        currentDirection === dir
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${isDirectionInherited ? 'opacity-70' : ''}`}
                      title={dirData?.label}
                    >
                      <Icon className={`w-5 h-5 ${
                        currentDirection === dir ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{dir}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Diagonal directions: NE, NW, SE, SW */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Diagonal</p>
              <div className="grid grid-cols-4 gap-2">
                {(['NW', 'NE', 'SW', 'SE'] as const).map((dir) => {
                  const dirData = playerDirections.find(d => d.value === dir);
                  const Icon = dir === 'NE' ? ArrowUpRight : dir === 'NW' ? ArrowUpLeft : dir === 'SE' ? ArrowDownRight : ArrowDownLeft;
                  return (
                    <button
                      key={dir}
                      onClick={() => handleDirectionChange(dir)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        currentDirection === dir
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${isDirectionInherited ? 'opacity-70' : ''}`}
                      title={dirData?.label}
                    >
                      <Icon className={`w-5 h-5 ${
                        currentDirection === dir ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{dir}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Bent run directions: WN, WS, EN, ES */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Curved Runs</p>
              <div className="grid grid-cols-4 gap-2">
                {(['WN', 'EN', 'WS', 'ES'] as const).map((dir) => {
                  const dirData = playerDirections.find(d => d.value === dir);
                  return (
                    <button
                      key={dir}
                      onClick={() => handleDirectionChange(dir)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        currentDirection === dir
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${isDirectionInherited ? 'opacity-70' : ''}`}
                      title={dirData?.label}
                    >
                      <span className={`text-lg ${
                        currentDirection === dir ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>{dirData?.icon}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{dir}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Current direction info */}
          {currentDirection && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  {playerDirections.find(d => d.value === currentDirection)?.label}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
