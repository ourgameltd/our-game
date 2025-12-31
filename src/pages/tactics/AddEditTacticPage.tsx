import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Routes } from '@/utils/routes';
import PageTitle from '@/components/common/PageTitle';
import TacticPitchEditor from '@/components/tactics/TacticPitchEditor';
import PrinciplePanel from '@/components/tactics/PrinciplePanel';
import PositionRolePanel from '@/components/tactics/PositionRolePanel';
import { getTacticById, getResolvedPositions } from '@/data/tactics';
import { getFormationById, sampleFormations } from '@/data/formations';
import { Tactic, TacticalPositionOverride, TacticPrinciple } from '@/types';

export default function AddEditTacticPage() {
  const { clubId, ageGroupId, teamId, tacticId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!tacticId;

  // Load existing tactic or create new one
  const existingTactic = tacticId ? getTacticById(tacticId) : undefined;
  
  // Local state for the tactic being edited
  const [tactic, setTactic] = useState<Tactic>(() => {
    if (existingTactic) {
      return { ...existingTactic };
    }
    // Default new tactic
    return {
      id: `tactic-new-${Date.now()}`,
      name: 'New Tactic',
      parentFormationId: sampleFormations[0]?.id || '',
      squadSize: 11,
      positionOverrides: {},
      principles: [],
      summary: '',
      scope: teamId && ageGroupId && clubId
        ? { type: 'team', clubId, ageGroupId, teamId }
        : ageGroupId && clubId
        ? { type: 'ageGroup', clubId, ageGroupId }
        : { type: 'club', clubId: clubId || '' },
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'principles'>('positions');

  const formation = useMemo(() => 
    getFormationById(tactic.parentFormationId), 
    [tactic.parentFormationId]
  );

  const resolvedPositions = useMemo(() => 
    getResolvedPositions(tactic), 
    [tactic]
  );

  const getBackUrl = () => {
    if (!clubId) return '/dashboard';
    if (tacticId) {
      // Go back to detail page when editing
      if (teamId && ageGroupId) {
        return Routes.teamTacticDetail(clubId, ageGroupId, teamId, tacticId);
      }
      if (ageGroupId) {
        return Routes.ageGroupTacticDetail(clubId, ageGroupId, tacticId);
      }
      return Routes.clubTacticDetail(clubId, tacticId);
    }
    // Go back to list when creating new
    if (teamId && ageGroupId) {
      return Routes.teamTactics(clubId, ageGroupId, teamId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTactics(clubId, ageGroupId);
    }
    return Routes.clubTactics(clubId);
  };

  const getScopeLabel = () => {
    if (teamId) return 'Team';
    if (ageGroupId) return 'Age Group';
    return 'Club';
  };

  const handlePositionChange = (index: number, override: Partial<TacticalPositionOverride>) => {
    setTactic(prev => {
      const existingOverride = prev.positionOverrides[index];
      return {
        ...prev,
        positionOverrides: {
          ...prev.positionOverrides,
          [index]: existingOverride 
            ? { ...existingOverride, ...override }
            : override,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handlePrinciplesChange = (principles: TacticPrinciple[]) => {
    setTactic(prev => ({
      ...prev,
      principles,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleFormationChange = (formationId: string) => {
    const newFormation = getFormationById(formationId);
    if (newFormation) {
      setTactic(prev => ({
        ...prev,
        parentFormationId: formationId,
        squadSize: newFormation.squadSize,
        positionOverrides: {}, // Reset overrides when changing formation
        updatedAt: new Date().toISOString(),
      }));
      setSelectedPosition(null);
    }
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving tactic:', tactic);
    // Navigate back after save
    navigate(getBackUrl());
  };

  const selectedOverride = selectedPosition !== null 
    ? tactic.positionOverrides[selectedPosition] 
    : undefined;

  // Get parent data for the selected position (from formation or parent tactic)
  const selectedParentData = selectedPosition !== null && formation
    ? {
        position: formation.positions[selectedPosition]?.position as string | undefined,
        x: formation.positions[selectedPosition]?.x,
        y: formation.positions[selectedPosition]?.y,
        direction: undefined,
      }
    : { direction: undefined };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title={isEditing ? 'Edit Tactic' : 'New Tactic'}
          subtitle={isEditing ? 'Update your tactical setup' : `Create a new ${getScopeLabel().toLowerCase()} tactic`}
          backLink={getBackUrl()}
          action={{
            label: 'Save',
            icon: 'check',
            onClick: handleSave,
            variant: 'primary',
          }}
        />

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tactic Name
              </label>
              <input
                type="text"
                value={tactic.name}
                onChange={(e) => setTactic(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., High Press 4-4-2"
              />
            </div>

            {/* Formation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Base Formation
              </label>
              <select
                value={tactic.parentFormationId}
                onChange={(e) => handleFormationChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {sampleFormations.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.squadSize}-a-side)
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Playing Style
              </label>
              <input
                type="text"
                value={tactic.style || ''}
                onChange={(e) => setTactic(prev => ({ ...prev, style: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., High Press, Counter Attack"
              />
            </div>

            {/* Scope indicator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scope
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                {getScopeLabel()} Level
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitch Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Formation Editor
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag positions to adjust placement. Click to select and edit direction.
              </p>
              {formation && (
                <TacticPitchEditor
                  tactic={tactic}
                  parentFormation={formation}
                  onPositionChange={handlePositionChange}
                  snapToGrid={true}
                  gridSize={5}
                  onPositionSelect={setSelectedPosition}
                  selectedPositionIndex={selectedPosition}
                />
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Tab Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('positions')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'positions'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Positions
              </button>
              <button
                onClick={() => setActiveTab('principles')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'principles'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Principles
              </button>
            </div>

            {/* Position Panel */}
            {activeTab === 'positions' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                {selectedPosition !== null && formation ? (
                  <PositionRolePanel
                    positionIndex={selectedPosition}
                    position={formation.positions[selectedPosition].position}
                    override={selectedOverride}
                    parentData={selectedParentData}
                    onUpdate={(override) => handlePositionChange(selectedPosition, override)}
                    onResetField={(field) => {
                      if (selectedOverride) {
                        const newOverride = { ...selectedOverride };
                        delete newOverride[field as keyof TacticalPositionOverride];
                        // If override is now empty, remove it entirely
                        if (Object.keys(newOverride).length === 0) {
                          setTactic(prev => {
                            const newOverrides = { ...prev.positionOverrides };
                            delete newOverrides[selectedPosition];
                            return { ...prev, positionOverrides: newOverrides };
                          });
                        } else {
                          setTactic(prev => ({
                            ...prev,
                            positionOverrides: {
                              ...prev.positionOverrides,
                              [selectedPosition]: newOverride,
                            },
                          }));
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a position on the pitch to edit its direction
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Principles Panel */}
            {activeTab === 'principles' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <PrinciplePanel
                  principles={tactic.principles}
                  resolvedPositions={resolvedPositions}
                  onPrinciplesChange={handlePrinciplesChange}
                  selectedPositionIndex={selectedPosition}
                  onPositionClick={setSelectedPosition}
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tactic Summary
          </h2>
          <textarea
            value={tactic.summary}
            onChange={(e) => setTactic(prev => ({ ...prev, summary: e.target.value }))}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            rows={6}
            placeholder="Describe your tactical approach, key principles, and coaching points..."
          />
        </div>
      </main>
    </div>
  );
}
