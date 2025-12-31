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
    
    const newPrinciple: TacticPrinciple = {
      id: `principle-${Date.now()}`,
      title: 'New Principle',
      description: '',
      positionIndices: [],
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

    // If already global (empty array), do nothing
    // If has specific positions, clear them to make global
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

    return (
      <div
        key={principle.id}
        className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${
          isPrincipleSelected
            ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/50'
            : isGlobal
            ? 'border-green-200 dark:border-green-800'
            : 'border-purple-200 dark:border-purple-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-2 p-3 cursor-pointer ${
            isPrincipleSelected
              ? 'bg-purple-100 dark:bg-purple-900/40'
              : isGlobal
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-purple-50 dark:bg-purple-900/20'
          } rounded-t-lg`}
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
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                <Users className="w-3 h-3" />
                All
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                <User className="w-3 h-3" />
                {principle.positionIndices.length}
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

            {/* Position Selection (edit mode only) */}
            {!readOnly && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Assigned Positions
                  </label>
                  <button
                    onClick={() => handleToggleAllPositions(principle.id)}
                    className={`text-xs px-2 py-1 rounded ${
                      isGlobal
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-green-100 hover:text-green-700'
                    }`}
                  >
                    {isGlobal ? 'Applies to All' : 'Apply to All'}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {resolvedPositions.map((pos, index) => {
                    const isAssigned = principle.positionIndices.includes(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleTogglePosition(principle.id, index)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          isGlobal
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                            : isAssigned
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}
                        disabled={isGlobal}
                      >
                        {pos.position}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Assigned positions (read-only view) */}
            {readOnly && !isGlobal && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned Positions
                </label>
                <div className="flex flex-wrap gap-2">
                  {principle.positionIndices.map((index) => {
                    const pos = resolvedPositions[index];
                    return (
                      <button
                        key={index}
                        onClick={() => onPositionClick?.(index)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          index === selectedPositionIndex
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40'
                        }`}
                      >
                        {pos?.position || `#${index}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            {!readOnly && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setEditingPrinciple(isEditing ? null : principle.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isEditing ? 'Done Editing' : 'Edit'}
                </button>
                <button
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
        <div className="space-y-3">
          {/* Global Principles Section */}
          {globalPrinciples.length > 0 && (
            <div className="space-y-2">
              {!readOnly && specificPrinciples.length > 0 && (
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team-Wide
                </h4>
              )}
              {globalPrinciples.map(p => renderPrincipleCard(p, true))}
            </div>
          )}

          {/* Position-Specific Principles Section */}
          {specificPrinciples.length > 0 && (
            <div className="space-y-2">
              {!readOnly && globalPrinciples.length > 0 && (
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-4">
                  Position-Specific
                </h4>
              )}
              {specificPrinciples.map(p => renderPrincipleCard(p, false))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
