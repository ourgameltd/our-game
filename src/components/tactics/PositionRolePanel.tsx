import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, RotateCcw, Plus, X } from 'lucide-react';
import { Direction, TacticalPositionOverride } from '@/types';

interface PositionRolePanelProps {
  positionIndex: number;
  position: string; // Position label (e.g., "CM", "ST")
  override: TacticalPositionOverride | undefined;
  parentData: {
    direction?: Direction;
    role?: string;
    keyResponsibilities?: string[];
  };
  onUpdate: (override: Partial<TacticalPositionOverride>) => void;
  onResetField: (field: 'direction' | 'role' | 'keyResponsibilities') => void;
  className?: string;
}

export default function PositionRolePanel({
  positionIndex,
  position,
  override,
  parentData,
  onUpdate,
  onResetField,
  className = '',
}: PositionRolePanelProps) {
  const [newResponsibility, setNewResponsibility] = useState('');
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  const currentDirection = override?.direction ?? parentData.direction;
  const currentRole = override?.role ?? parentData.role ?? '';
  const currentResponsibilities = override?.keyResponsibilities ?? parentData.keyResponsibilities ?? [];

  const isDirectionInherited = override?.direction === undefined && parentData.direction !== undefined;
  const isRoleInherited = override?.role === undefined && parentData.role !== undefined;
  const isResponsibilitiesInherited = override?.keyResponsibilities === undefined && parentData.keyResponsibilities !== undefined;

  const handleDirectionChange = (direction: Direction) => {
    onUpdate({
      positionIndex,
      direction,
    });
  };

  const handleRoleChange = (role: string) => {
    onUpdate({
      positionIndex,
      role,
    });
  };

  const handleAddResponsibility = () => {
    if (!newResponsibility.trim()) return;
    
    const updatedResponsibilities = [...currentResponsibilities, newResponsibility.trim()];
    onUpdate({
      positionIndex,
      keyResponsibilities: updatedResponsibilities,
    });
    setNewResponsibility('');
  };

  const handleRemoveResponsibility = (index: number) => {
    const updatedResponsibilities = currentResponsibilities.filter((_, i) => i !== index);
    onUpdate({
      positionIndex,
      keyResponsibilities: updatedResponsibilities,
    });
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    return text
      .split('\n')
      .map((line) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Lists
        if (line.trim().startsWith('- ')) {
          line = `<li>${line.substring(2)}</li>`;
        }
        return line;
      })
      .join('<br/>');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Position: {position}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure tactical role and responsibilities
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Direction Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Direction
              {isDirectionInherited && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(inherited)</span>
              )}
            </label>
            {!isDirectionInherited && (
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
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDirectionChange('defensive')}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                currentDirection === 'defensive'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${isDirectionInherited ? 'opacity-70' : ''}`}
            >
              <ArrowDown className={`w-5 h-5 ${
                currentDirection === 'defensive' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Defensive</span>
            </button>
            <button
              onClick={() => handleDirectionChange('neutral')}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                currentDirection === 'neutral'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${isDirectionInherited ? 'opacity-70' : ''}`}
            >
              <ArrowRight className={`w-5 h-5 ${
                currentDirection === 'neutral' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Neutral</span>
            </button>
            <button
              onClick={() => handleDirectionChange('attacking')}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                currentDirection === 'attacking'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${isDirectionInherited ? 'opacity-70' : ''}`}
            >
              <ArrowUp className={`w-5 h-5 ${
                currentDirection === 'attacking' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Attacking</span>
            </button>
          </div>
        </div>

        {/* Role Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role Description
              {isRoleInherited && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(inherited)</span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {showMarkdownPreview ? 'Edit' : 'Preview'}
              </button>
              {!isRoleInherited && (
                <button
                  onClick={() => onResetField('role')}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                  title="Reset to parent"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
          {showMarkdownPreview ? (
            <div
              className={`min-h-[100px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-700 dark:text-gray-300 ${
                isRoleInherited ? 'opacity-70' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(currentRole) }}
            />
          ) : (
            <textarea
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              placeholder="Describe the tactical role for this position..."
              className={`w-full min-h-[100px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isRoleInherited ? 'opacity-70' : ''
              }`}
            />
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Supports markdown: **bold**, *italic*, - lists
          </p>
        </div>

        {/* Key Responsibilities */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Key Responsibilities
              {isResponsibilitiesInherited && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(inherited)</span>
              )}
            </label>
            {!isResponsibilitiesInherited && currentResponsibilities.length > 0 && (
              <button
                onClick={() => onResetField('keyResponsibilities')}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                title="Reset to parent"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
          
          {/* List of responsibilities */}
          <div className="space-y-2 mb-3">
            {currentResponsibilities.map((responsibility, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 ${
                  isResponsibilitiesInherited ? 'opacity-70' : ''
                }`}
              >
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {responsibility}
                </span>
                {!isResponsibilitiesInherited && (
                  <button
                    onClick={() => handleRemoveResponsibility(index)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add new responsibility */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddResponsibility()}
              placeholder="Add a responsibility..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleAddResponsibility}
              disabled={!newResponsibility.trim()}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
