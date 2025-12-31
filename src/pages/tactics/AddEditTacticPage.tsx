import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Routes } from '@/utils/routes';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
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

  const formation = useMemo(() => 
    getFormationById(tactic.parentFormationId || ''), 
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
      const existingOverride = prev.positionOverrides?.[index];
      return {
        ...prev,
        positionOverrides: {
          ...(prev.positionOverrides || {}),
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
    ? tactic.positionOverrides?.[selectedPosition] 
    : undefined;

  // Get parent data for the selected position (from formation or parent tactic)
  const selectedParentData = selectedPosition !== null && formation
    ? {
        position: formation.positions?.[selectedPosition]?.position as string | undefined,
        x: formation.positions?.[selectedPosition]?.x,
        y: formation.positions?.[selectedPosition]?.y,
        direction: undefined,
      }
    : { direction: undefined };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <PageTitle
            title={isEditing ? 'Edit Tactic' : 'New Tactic'}
            subtitle={`${formation?.name || 'Unknown Formation'} • ${tactic.squadSize}-a-side`}
            badge={getScopeLabel()}
            backLink={getBackUrl()}
          />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Pitch Display - 40% width on desktop */}
          <div className="lg:col-span-4">
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

          {/* Tactic Details - 60% width on desktop */}
          <div className="lg:col-span-6 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {isEditing ? (
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                      {formation?.name || 'Unknown'} ({tactic.squadSize}-a-side)
                    </div>
                  ) : (
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
                  )}
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tactic.tags?.join(', ') || ''}
                    onChange={(e) => setTactic(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., pressing, attacking, 4-4-2"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Summary
                </label>
                <textarea
                  value={tactic.summary}
                  onChange={(e) => setTactic(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Describe your tactical approach..."
                />
              </div>
            </div>

            {/* Position Direction Panel */}
            {selectedPosition !== null && formation && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <PositionRolePanel
                  positionIndex={selectedPosition}
                  position={formation.positions?.[selectedPosition]?.position || ''}
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
              </div>
            )}
            
            {/* Principles Panel */}
            <PrinciplePanel
              principles={tactic.principles || []}
              resolvedPositions={resolvedPositions}
              onPrinciplesChange={handlePrinciplesChange}
              selectedPositionIndex={selectedPosition}
              onPositionClick={(index) => setSelectedPosition(index)}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <FormActions
            isArchived={false}
            onArchive={isEditing ? () => console.log('Archive tactic') : undefined}
            onCancel={() => navigate(getBackUrl())}
            saveLabel={isEditing ? 'Save Changes' : 'Create Tactic'}
            showArchive={isEditing}
          />
        </div>
        </form>
      </main>
    </div>
  );
}
