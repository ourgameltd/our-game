import { useState } from 'react';
import { Plus, Trash2, Users, User, ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import { TacticPrinciple } from '@/types';
import { ResolvedPosition } from '@/data/tactics';

interface PrinciplePanelProps {
  principles: TacticPrinciple[];
  resolvedPositions: ResolvedPosition[];
  onPrinciplesChange?: (principles: TacticPrinciple[]) => void;
  selectedPositionIndex?: number | null;
  onPositionClick?: (index: number | null) => void;
  selectedPrincipleId?: string | null;
  onPrincipleClick?: (principleId: string | null) => void;
  readOnly?: boolean;
}

/**
 * Panel for viewing and editing tactical principles
 * In view mode: Shows principles for selected position
 * In edit mode: Allows adding/removing principles and assigning positions
 */
export default function PrinciplePanel({
  principles,
  resolvedPositions,
  onPrinciplesChange,
  selectedPositionIndex,
  onPositionClick,
  selectedPrincipleId,
  onPrincipleClick,
  readOnly = false,
}: PrinciplePanelProps) {
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);
  const [editingPrinciple, setEditingPrinciple] = useState<string | null>(null);

  // Filter principles based on mode
  // In read-only mode with a selected position, show only relevant principles
  const displayPrinciples = readOnly && selectedPositionIndex !== null && selectedPositionIndex !== undefined
    ? principles.filter(p => 
        p.positionIndices.length === 0 || // Global principles
        p.positionIndices.includes(selectedPositionIndex)
      )
    : principles;

  // Get global principles (apply to all)
  const globalPrinciples = displayPrinciples.filter(p => p.positionIndices.length === 0);
  const specificPrinciples = displayPrinciples.filter(p => p.positionIndices.length > 0);

  const handleAddPrinciple = () => {
    if (!onPrinciplesChange) return;
    
    // Start with selected position if available, otherwise empty (not global)
    const initialPositions = selectedPositionIndex !== null && selectedPositionIndex !== undefined 
      ? [selectedPositionIndex]
      : [];
    
    const newPrinciple: TacticPrinciple = {
      id: `principle-${Date.now()}`,
      title: 'New Principle',
      description: '',
      positionIndices: initialPositions,
    };
    
    onPrinciplesChange([...principles, newPrinciple]);
    setEditingPrinciple(newPrinciple.id);
    setExpandedPrinciple(newPrinciple.id);
  };

  const handleDeletePrinciple = (principleId: string) => {
    if (!onPrinciplesChange) return;
    onPrinciplesChange(principles.filter(p => p.id !== principleId));
  };

  const handleUpdatePrinciple = (principleId: string, updates: Partial<TacticPrinciple>) => {
    if (!onPrinciplesChange) return;
    onPrinciplesChange(
      principles.map(p => 
        p.id === principleId ? { ...p, ...updates } : p
      )
    );
  };

  const handleTogglePosition = (principleId: string, positionIndex: number) => {
    if (!onPrinciplesChange) return;
    
    const principle = principles.find(p => p.id === principleId);
    if (!principle) return;

    const newIndices = principle.positionIndices.includes(positionIndex)
      ? principle.positionIndices.filter(i => i !== positionIndex)
      : [...principle.positionIndices, positionIndex];

    handleUpdatePrinciple(principleId, { positionIndices: newIndices });
  };

  const handleToggleAllPositions = (principleId: string) => {
    if (!onPrinciplesChange) return;
    
    const principle = principles.find(p => p.id === principleId);
    if (!principle) return;

    // Toggle: if already global (empty array), stay global but user clicked so do nothing
    // If has specific positions, clear them to make global
    // The key is: empty array = global/team-wide mode
    // We always set to empty when clicking "Team-Wide" button
    // Individual positions can only be clicked when NOT in team-wide mode
    handleUpdatePrinciple(principleId, { positionIndices: [] });
  };

  const handlePrincipleCardClick = (principle: TacticPrinciple) => {
    // Toggle expand state
    setExpandedPrinciple(expandedPrinciple === principle.id ? null : principle.id);
    
    // If in read-only mode with onPrincipleClick, toggle principle selection
    if (readOnly && onPrincipleClick) {
      // Toggle: if already selected, deselect; otherwise select
      onPrincipleClick(selectedPrincipleId === principle.id ? null : principle.id);
    }
  };

  const renderPrincipleCard = (principle: TacticPrinciple, isGlobal: boolean) => {
    const isExpanded = expandedPrinciple === principle.id;
    const isEditing = editingPrinciple === principle.id;
    const isPrincipleSelected = selectedPrincipleId === principle.id;
    
    // Determine color scheme based on state
    const getColorScheme = () => {
      if (isPrincipleSelected) {
        return {
          border: 'border-yellow-500 dark:border-yellow-400 ring-2 ring-yellow-500/50',
          header: 'bg-yellow-50 dark:bg-yellow-900/20',
        };
      }
      if (isGlobal) {
        return {
          border: 'border-blue-300 dark:border-blue-700',
          header: 'bg-blue-50 dark:bg-blue-900/20',
        };
      }
      if (principle.positionIndices.length > 0) {
        return {
          border: 'border-purple-300 dark:border-purple-700',
          header: 'bg-purple-50 dark:bg-purple-900/20',
        };
      }
      // No positions selected (gray)
      return {
        border: 'border-gray-300 dark:border-gray-600',
        header: 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
      };
    };
    
    const colors = getColorScheme();

    return (
      <div
        key={principle.id}
        className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${colors.border}`}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-2 p-3 cursor-pointer ${colors.header} rounded-t-lg`}
          onClick={() => handlePrincipleCardClick(principle)}
        >
          {!readOnly && (
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          )}
          
          <div className="flex-1 min-w-0">
            {isEditing && !readOnly ? (
              <input
                type="text"
                value={principle.title}
                onChange={(e) => handleUpdatePrinciple(principle.id, { title: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Principle title"
                autoFocus
              />
            ) : (
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {principle.title}
              </h4>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isGlobal ? (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                <Users className="w-3 h-3" />
                Team
              </span>
            ) : principle.positionIndices.length > 0 ? (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                <User className="w-3 h-3" />
                {principle.positionIndices.length}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                <User className="w-3 h-3" />
                0
              </span>
            )}
            
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-3 space-y-3 border-t border-gray-200 dark:border-gray-700">
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              {isEditing && !readOnly ? (
                <textarea
                  value={principle.description}
                  onChange={(e) => handleUpdatePrinciple(principle.id, { description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe this principle..."
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {principle.description || 'No description provided'}
                </p>
              )}
            </div>

            {/* Position Selection - Always show, disable when not editing */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Assigned Positions
                </label>
                <button
                  type="button"
                  onClick={() => handleToggleAllPositions(principle.id)}
                  disabled={readOnly}
                  className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                    isGlobal
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
                  } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Team-Wide
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {resolvedPositions.map((pos, index) => {
                  const isAssigned = principle.positionIndices.includes(index);
                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={() => {
                        if (!readOnly) {
                          // If team-wide is active and user clicks a position, 
                          // switch to position-specific mode with just that position
                          if (isGlobal) {
                            handleUpdatePrinciple(principle.id, { positionIndices: [index] });
                          } else {
                            handleTogglePosition(principle.id, index);
                          }
                        } else {
                          onPositionClick?.(index);
                        }
                      }}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        isGlobal
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-400'
                          : isAssigned
                          ? index === selectedPositionIndex
                            ? 'bg-yellow-400 text-yellow-900 dark:bg-yellow-500 dark:text-yellow-950'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-400'
                      } ${readOnly && !isAssigned ? 'opacity-50' : ''}`}
                    >
                      {pos.position}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            {!readOnly && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditingPrinciple(isEditing ? null : principle.id)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePrinciple(principle.id)}
                  className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {readOnly ? 'Principles' : 'Tactical Principles'}
        </h3>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAddPrinciple}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* No position selected message */}
      {readOnly && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            {selectedPositionIndex !== null && selectedPositionIndex !== undefined
              ? `Showing principles for ${resolvedPositions[selectedPositionIndex]?.position || 'selected position'}`
              : 'Select a position on the pitch to filter principles'
            }
          </p>
          {selectedPositionIndex !== null && selectedPositionIndex !== undefined && onPositionClick && (
            <button
              onClick={() => onPositionClick(null)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <X className="w-3 h-3" />
              Show All
            </button>
          )}
        </div>
      )}

      {/* Principles List */}
      {displayPrinciples.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400">
            {readOnly 
              ? 'No principles assigned to this position'
              : 'No principles defined yet. Add one to get started.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Team-Wide Principles */}
          {globalPrinciples.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Team-Wide Principles
              </h4>
              {globalPrinciples.map(p => renderPrincipleCard(p, true))}
            </div>
          )}

          {/* Position-Specific Principles */}
          {specificPrinciples.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Position-Specific Principles
              </h4>
              {specificPrinciples.map(p => renderPrincipleCard(p, false))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
