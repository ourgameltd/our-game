import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { getClubById } from '@/data/clubs';
import { getAgeGroupById } from '@/data/ageGroups';
import { getTeamById } from '@/data/teams';
import { getTacticById, getAvailableParentTactics } from '@/data/tactics';
import { getFormationsBySquadSize } from '@/data/formations';
import { Tactic, TacticStyle, TacticScope, SquadSize } from '@/types';
import { Routes } from '@/utils/routes';
import PageTitle from '@/components/common/PageTitle';
import TacticPitchEditor from '@/components/tactics/TacticPitchEditor';
import PositionRolePanel from '@/components/tactics/PositionRolePanel';
import RelationshipDrawer from '@/components/tactics/RelationshipDrawer';
import ResetOverridesModal from '@/components/tactics/ResetOverridesModal';

type TabType = 'settings' | 'positions' | 'relationships' | 'summary';

export default function AddEditTacticPage() {
  const { clubId, ageGroupId, teamId, tacticId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isEditing = tacticId && tacticId !== 'new';
  const copyFromId = searchParams.get('copyFrom');

  // Determine scope from route
  const scope: TacticScope = teamId ? 'team' : ageGroupId ? 'ageGroup' : 'club';

  // Get context data
  const club = getClubById(clubId!);
  const ageGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;
  const team = teamId ? getTeamById(teamId) : null;
  const existingTactic = isEditing ? getTacticById(tacticId) : null;
  const copyFromTactic = copyFromId ? getTacticById(copyFromId) : null;

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  
  // Form state
  const [name, setName] = useState(existingTactic?.name || copyFromTactic?.name || '');
  const [style, setStyle] = useState<TacticStyle>(existingTactic?.style || copyFromTactic?.style || 'balanced');
  const [squadSize, setSquadSize] = useState<SquadSize>(existingTactic?.squadSize || copyFromTactic?.squadSize || 11);
  const [parentFormationId, setParentFormationId] = useState(existingTactic?.parentFormationId || copyFromTactic?.parentFormationId || '');
  const [parentTacticId, setParentTacticId] = useState(existingTactic?.parentTacticId || copyFromTactic?.parentTacticId || '');
  const [tags, setTags] = useState<string[]>(existingTactic?.tags || copyFromTactic?.tags || []);
  const [summary, setSummary] = useState(existingTactic?.summary || copyFromTactic?.summary || '');
  const [showInheritance, setShowInheritance] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);
  
  // Modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingFormationId, setPendingFormationId] = useState('');

  // Get available formations and parent tactics
  const availableFormations = getFormationsBySquadSize(squadSize);
  const availableParentTactics = getAvailableParentTactics(scope, clubId, ageGroupId);

  // Initialize tactic object for editing
  const [tactic, setTactic] = useState<Tactic>(() => {
    if (existingTactic) return existingTactic;
    if (copyFromTactic) {
      return {
        ...copyFromTactic,
        id: 'new',
        name: `Copy of ${copyFromTactic.name}`,
        scope,
        clubId,
        ageGroupId,
        teamId
      };
    }
    return {
      id: 'new',
      name: '',
      style: 'balanced',
      scope,
      clubId,
      ageGroupId,
      teamId,
      parentFormationId: '',
      squadSize: 11,
      positionRoles: [],
      relationships: []
    };
  });

  if (!club) {
    return <div>Club not found</div>;
  }

  // Handle parent formation change
  const handleParentFormationChange = (newFormationId: string) => {
    if (tactic.positionOverrides && tactic.positionOverrides.length > 0 || 
        tactic.relationships && tactic.relationships.length > 0) {
      // Show warning modal
      setPendingFormationId(newFormationId);
      setShowResetModal(true);
    } else {
      setParentFormationId(newFormationId);
      setTactic({ ...tactic, parentFormationId: newFormationId });
    }
  };

  // Confirm reset overrides
  const handleConfirmReset = () => {
    setParentFormationId(pendingFormationId);
    setTactic({
      ...tactic,
      parentFormationId: pendingFormationId,
      positionOverrides: [],
      relationships: []
    });
    setShowResetModal(false);
    setPendingFormationId('');
  };

  // Cancel reset
  const handleCancelReset = () => {
    setShowResetModal(false);
    setPendingFormationId('');
  };

  // Handle save
  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      alert('Please enter a tactic name');
      return;
    }
    if (!parentFormationId) {
      alert('Please select a parent formation');
      return;
    }

    // In a real app, this would save to backend
    console.log('Saving tactic:', {
      ...tactic,
      name,
      style,
      squadSize,
      parentFormationId,
      parentTacticId,
      tags,
      summary
    });

    // Navigate back to list
    if (teamId) {
      navigate(Routes.teamTactics(clubId!, ageGroupId!, teamId));
    } else if (ageGroupId) {
      navigate(Routes.ageGroupTactics(clubId!, ageGroupId));
    } else {
      navigate(Routes.clubTactics(clubId!));
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (teamId) {
      navigate(Routes.teamTactics(clubId!, ageGroupId!, teamId));
    } else if (ageGroupId) {
      navigate(Routes.ageGroupTactics(clubId!, ageGroupId));
    } else {
      navigate(Routes.clubTactics(clubId!));
    }
  };

  // Tab styling
  const tabClass = (tab: TabType) => `
    px-4 py-2 font-medium transition-colors
    ${activeTab === tab 
      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' 
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }
  `;

  const pageTitle = isEditing ? 'Edit Tactic' : 'Create Tactic';
  const pageSubtitle = team ? team.name : ageGroup ? ageGroup.name : club.name;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle title={pageTitle} subtitle={pageSubtitle} />

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6 px-6">
            <button onClick={() => setActiveTab('settings')} className={tabClass('settings')}>
              Settings
            </button>
            <button onClick={() => setActiveTab('positions')} className={tabClass('positions')}>
              Positions
            </button>
            <button onClick={() => setActiveTab('relationships')} className={tabClass('relationships')}>
              Relationships
            </button>
            <button onClick={() => setActiveTab('summary')} className={tabClass('summary')}>
              Summary
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow p-6 mb-6">
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tactic Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., High Press 4-3-3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Style *
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as TacticStyle)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="attacking">Attacking</option>
                  <option value="balanced">Balanced</option>
                  <option value="defensive">Defensive</option>
                  <option value="possession">Possession</option>
                  <option value="counter-attack">Counter-Attack</option>
                  <option value="high-press">High Press</option>
                </select>
              </div>

              {/* Squad Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Squad Size *
                </label>
                <select
                  value={squadSize}
                  onChange={(e) => setSquadSize(parseInt(e.target.value) as SquadSize)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="4">4-a-side</option>
                  <option value="5">5-a-side</option>
                  <option value="7">7-a-side</option>
                  <option value="9">9-a-side</option>
                  <option value="11">11-a-side</option>
                </select>
              </div>

              {/* Parent Formation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent Formation *
                </label>
                <select
                  value={parentFormationId}
                  onChange={(e) => handleParentFormationChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a formation...</option>
                  {availableFormations.map((formation) => (
                    <option key={formation.id} value={formation.id}>
                      {formation.name} ({formation.system})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Filtered to {squadSize}-a-side formations
                </p>
              </div>

              {/* Parent Tactic (Optional) */}
              {availableParentTactics.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent Tactic (Optional)
                  </label>
                  <select
                    value={parentTacticId}
                    onChange={(e) => setParentTacticId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">None - start from formation</option>
                    {availableParentTactics.map((tactic) => (
                      <option key={tactic.id} value={tactic.id}>
                        {tactic.name} ({tactic.scope})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Inherit from a higher-level tactic
                  </p>
                </div>
              )}

              {/* Scope Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scope
                </label>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                  {scope === 'team' ? 'Team' : scope === 'ageGroup' ? 'Age Group' : 'Club'}
                  {' - '}
                  {pageSubtitle}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags.join(', ')}
                  onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  placeholder="High Press, Wing Play, Quick Tempo (comma separated)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Position Editor
                </h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showInheritance}
                      onChange={(e) => setShowInheritance(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Show Inheritance</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={snapToGrid}
                      onChange={(e) => setSnapToGrid(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Snap to Grid</span>
                  </label>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TacticPitchEditor
                    tactic={tactic}
                    showInheritance={showInheritance}
                    snapToGrid={snapToGrid}
                  />
                </div>
                <div>
                  <PositionRolePanel
                    position={null}
                    role={tactic.positionRoles?.find(r => r.position === null)?.role}
                    duties={tactic.positionRoles?.find(r => r.position === null)?.duties}
                    instructions={tactic.positionRoles?.find(r => r.position === null)?.instructions}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Relationships Tab */}
          {activeTab === 'relationships' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tactical Relationships
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Define how positions relate to each other tactically
              </p>
              <RelationshipDrawer
                relationships={tactic.relationships || []}
                onAddRelationship={() => console.log('Add relationship')}
                onDeleteRelationship={(id) => console.log('Delete relationship', id)}
              />
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tactical Summary
                </h3>
                <button
                  onClick={() => setShowSummaryPreview(!showSummaryPreview)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {showSummaryPreview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {!showSummaryPreview ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Markdown Summary
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="## Tactical Philosophy&#10;Describe your tactical approach...&#10;&#10;### Key Principles&#10;- Point 1&#10;- Point 2"
                    rows={16}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Supports markdown formatting (headings, lists, bold, italic)
                  </p>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {summary ? (
                    summary.split('\n').map((line, index) => {
                      if (line.startsWith('## ')) {
                        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>;
                      } else if (line.startsWith('### ')) {
                        return <h4 key={index} className="text-base font-semibold mt-3 mb-2">{line.replace('### ', '')}</h4>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="ml-4">{line.replace('- ', '')}</li>;
                      } else if (line.trim()) {
                        return <p key={index} className="mb-2">{line}</p>;
                      }
                      return null;
                    })
                  ) : (
                    <p className="text-gray-500">No summary provided</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Save Changes' : 'Create Tactic'}
          </button>
        </div>

        {/* Reset Overrides Modal */}
        <ResetOverridesModal
          isOpen={showResetModal}
          onConfirm={handleConfirmReset}
          onCancel={handleCancelReset}
          overrideCount={tactic.positionOverrides?.length || 0}
          relationshipCount={tactic.relationships?.length || 0}
        />
      </main>
    </div>
  );
}
