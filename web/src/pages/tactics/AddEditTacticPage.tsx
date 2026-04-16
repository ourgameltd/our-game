import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Routes } from '@/utils/routes';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import TacticPitchEditor from '@/components/tactics/TacticPitchEditor';
import PrinciplePanel from '@/components/tactics/PrinciplePanel';
import { Tactic, TacticalPositionOverride, TacticPrinciple, Formation, FormationScope, PlayerDirection, PlayerPosition, SquadSize } from '@/types';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  useTactic,
  useSystemFormations,
  useCreateTactic,
  useUpdateTactic,
} from '@/api';
import type {
  TacticDetailDto,
  SystemFormationDto,
  CreateTacticRequest,
  UpdateTacticRequest,
} from '@/api';

// ---------------------------------------------------------------------------
// DTO ↔ Local State Mapping
// ---------------------------------------------------------------------------

function mapDtoToFormState(dto: TacticDetailDto): Tactic {
  // Map PositionOverrideDto[] → Record<number, TacticalPositionOverride>
  const positionOverrides: Record<number, TacticalPositionOverride> = {};
  for (const po of dto.positionOverrides) {
    const override: TacticalPositionOverride = {};
    if (po.xCoord !== undefined) override.x = po.xCoord;
    if (po.yCoord !== undefined) override.y = po.yCoord;
    if (po.direction) override.direction = po.direction as PlayerDirection;
    positionOverrides[po.positionIndex] = override;
  }

  // Map TacticPrincipleDto[] → TacticPrinciple[]
  const principles: TacticPrinciple[] = dto.principles.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description || '',
    positionIndices: p.positionIndices,
  }));

  // Derive FormationScope from TacticDetailScopeDto
  const scope: FormationScope =
    dto.scope.teamIds.length > 0
      ? { type: 'team', clubId: dto.scope.clubIds[0], ageGroupId: dto.scope.ageGroupIds[0], teamId: dto.scope.teamIds[0] }
      : dto.scope.ageGroupIds.length > 0
      ? { type: 'ageGroup', clubId: dto.scope.clubIds[0], ageGroupId: dto.scope.ageGroupIds[0] }
      : { type: 'club', clubId: dto.scope.clubIds[0] };

  return {
    id: dto.id,
    name: dto.name,
    parentFormationId: dto.parentFormationId,
    parentTacticId: dto.parentTacticId,
    squadSize: dto.squadSize as SquadSize,
    positionOverrides,
    principles,
    summary: dto.summary || '',
    style: dto.style,
    tags: dto.tags,
    scope,
  };
}

function buildOverridesPayload(overrides: Record<number, TacticalPositionOverride> | undefined) {
  if (!overrides) return [];
  return Object.entries(overrides).map(([indexStr, o]) => ({
    positionIndex: parseInt(indexStr, 10),
    xCoord: o.x,
    yCoord: o.y,
    direction: o.direction,
  }));
}

function buildPrinciplesPayload(principles: TacticPrinciple[] | undefined) {
  if (!principles) return [];
  return principles.map(p => ({
    title: p.title,
    description: p.description || undefined,
    positionIndices: p.positionIndices,
  }));
}

// ---------------------------------------------------------------------------
// Skeleton Components
// ---------------------------------------------------------------------------

function PitchEditorSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="aspect-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  );
}

function BasicInfoSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div>
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
      <div className="mt-4">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

function PrinciplesPanelSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-5 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormActionsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex justify-end gap-4">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

interface BlockingStateProps {
  title: string;
  subtitle: string;
  message: string;
  badge: string;
  backLink: string;
}

function BlockingState({ title, subtitle, message, badge, backLink }: BlockingStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <PageTitle
            title={title}
            subtitle={subtitle}
            badge={badge}
            backLink={backLink}
          />
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
          <p className="text-red-700 dark:text-red-300">{message}</p>
        </div>
      </main>
    </div>
  );
}

const squadSizeOrder: SquadSize[] = [11, 9, 7, 5, 4];
const tacticIdRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

function isValidTacticId(value: string | undefined): value is string {
  return !!value && tacticIdRegex.test(value);
}

function isSupportedSquadSize(value: number): value is SquadSize {
  return squadSizeOrder.includes(value as SquadSize);
}

function mapSystemFormationToFormation(dto: SystemFormationDto): Formation | null {
  if (!dto.id || !dto.name || !isSupportedSquadSize(dto.squadSize) || dto.positions.length === 0) {
    return null;
  }

  return {
    id: dto.id,
    name: dto.name,
    system: dto.system,
    squadSize: dto.squadSize,
    summary: dto.summary,
    tags: dto.tags,
    positions: dto.positions.map(position => ({
      position: position.position as PlayerPosition,
      x: position.x,
      y: position.y,
      direction: position.direction as PlayerDirection | undefined,
    })),
    isSystemFormation: true,
    scope: { type: 'system' },
  };
}

function groupFormationsBySquadSize(formations: Formation[]) {
  const grouped: Partial<Record<SquadSize, Formation[]>> = {};

  for (const formation of formations) {
    if (!grouped[formation.squadSize]) {
      grouped[formation.squadSize] = [];
    }

    grouped[formation.squadSize]!.push(formation);
  }

  for (const squadSize of squadSizeOrder) {
    grouped[squadSize]?.sort((left, right) => left.name.localeCompare(right.name));
  }

  return grouped;
}

// ---------------------------------------------------------------------------
// Default empty tactic for "new" mode
// ---------------------------------------------------------------------------

function createDefaultTactic(clubId?: string, ageGroupId?: string, teamId?: string): Tactic {
  const scope: FormationScope =
    teamId && ageGroupId && clubId
      ? { type: 'team', clubId, ageGroupId, teamId }
      : ageGroupId && clubId
      ? { type: 'ageGroup', clubId, ageGroupId }
      : { type: 'club', clubId: clubId || '' };

  return {
    id: '',
    name: 'New Tactic',
    parentFormationId: '',
    squadSize: 11,
    positionOverrides: {},
    principles: [],
    summary: '',
    scope,
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AddEditTacticPage() {
  usePageTitle(['Add Edit Tactic']);

  const { clubId, ageGroupId, teamId, tacticId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!tacticId;
  const hasValidEditTacticId = !isEditing || isValidTacticId(tacticId);

  // ---- API hooks -----------------------------------------------------------
  const {
    data: systemFormationDtos,
    isLoading: isLoadingSystemFormations,
    error: systemFormationsError,
  } = useSystemFormations();
  const { data: tacticDetail, isLoading, error: fetchError } = useTactic(tacticId);
  const { createTactic, isSubmitting: isCreating, data: createData, error: createError } = useCreateTactic();
  const { updateTactic, isSubmitting: isUpdating, data: updateData, error: updateError } = useUpdateTactic(tacticId || '');

  const isSubmitting = isCreating || isUpdating;
  const mutationError = createError || updateError;

  // ---- Local form state ----------------------------------------------------
  const [tactic, setTactic] = useState<Tactic>(() => createDefaultTactic(clubId, ageGroupId, teamId));
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const formInitialized = useRef(false);
  const submitInFlightRef = useRef(false);

  const systemFormations = useMemo(
    () => (systemFormationDtos ?? [])
      .map(mapSystemFormationToFormation)
      .filter((formation): formation is Formation => formation !== null),
    [systemFormationDtos],
  );

  const firstAvailableFormation = useMemo(
    () => systemFormations[0] ?? null,
    [systemFormations],
  );

  const formationsBySquadSize = useMemo(
    () => groupFormationsBySquadSize(systemFormations),
    [systemFormations],
  );

  // Initialize form state from API data (edit mode)
  useEffect(() => {
    if (isEditing && tacticDetail && !formInitialized.current) {
      setTactic(mapDtoToFormState(tacticDetail));
      formInitialized.current = true;
    }
  }, [isEditing, tacticDetail]);

  // Initialize create-mode formation from backend system formations.
  useEffect(() => {
    if (isEditing || !firstAvailableFormation) {
      return;
    }

    setTactic(prev => {
      if (prev.parentFormationId) {
        return prev;
      }

      return {
        ...prev,
        parentFormationId: firstAvailableFormation.id,
        squadSize: firstAvailableFormation.squadSize,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [isEditing, firstAvailableFormation]);

  // Navigate to detail page on successful save
  useEffect(() => {
    const savedTactic = createData || updateData;
    if (savedTactic) {
      const id = savedTactic.id;
      if (teamId && ageGroupId && clubId) {
        navigate(Routes.teamTacticDetail(clubId, ageGroupId, teamId, id));
      } else if (ageGroupId && clubId) {
        navigate(Routes.ageGroupTacticDetail(clubId, ageGroupId, id));
      } else if (clubId) {
        navigate(Routes.clubTacticDetail(clubId, id));
      }
    }
  }, [createData, updateData, clubId, ageGroupId, teamId, navigate]);

  // ---- Derived data (client-side) ------------------------------------------
  const formation = useMemo(
    () => systemFormations.find(item => item.id === tactic.parentFormationId) ?? null,
    [systemFormations, tactic.parentFormationId],
  );

  const resolvedPositions = useMemo(
    () =>
      (formation?.positions || []).map((position, index) => ({
        positionId: `${formation?.id || 'formation'}:${index}`,
        positionIndex: index,
        position: position.position,
      })),
    [formation],
  );

  const hasSystemFormationCatalog = systemFormations.length > 0;
  const isBlockingSystemFormationState = !isLoadingSystemFormations && (!!systemFormationsError || !hasSystemFormationCatalog);
  const isBlockingEditState = isEditing && !isLoading && (!hasValidEditTacticId || !!fetchError || !tacticDetail);
  const isBlockingMissingParentFormation = !isLoadingSystemFormations && hasSystemFormationCatalog && !formation;

  // ---- Helpers -------------------------------------------------------------
  const getBackUrl = () => {
    if (!clubId) return '/dashboard';
    if (tacticId) {
      if (teamId && ageGroupId) return Routes.teamTacticDetail(clubId, ageGroupId, teamId, tacticId);
      if (ageGroupId) return Routes.ageGroupTacticDetail(clubId, ageGroupId, tacticId);
      return Routes.clubTacticDetail(clubId, tacticId);
    }
    if (teamId && ageGroupId) return Routes.teamTactics(clubId, ageGroupId, teamId);
    if (ageGroupId) return Routes.ageGroupTactics(clubId, ageGroupId);
    return Routes.clubTactics(clubId);
  };

  const getScopeLabel = () => {
    if (teamId) return 'Team';
    if (ageGroupId) return 'Age Group';
    return 'Club';
  };

  // ---- Event handlers ------------------------------------------------------
  const handlePositionChange = (index: number, override: Partial<TacticalPositionOverride>) => {
    setTactic(prev => {
      const existingOverride = prev.positionOverrides?.[index] || {};

      const newOverride = { ...existingOverride };
      for (const [key, value] of Object.entries(override)) {
        if (value === undefined) {
          delete newOverride[key as keyof TacticalPositionOverride];
        } else {
          (newOverride as Record<string, unknown>)[key] = value;
        }
      }

      const newOverrides = { ...(prev.positionOverrides || {}) };
      if (Object.keys(newOverride).length === 0) {
        delete newOverrides[index];
      } else {
        newOverrides[index] = newOverride;
      }

      return {
        ...prev,
        positionOverrides: newOverrides,
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
    const newFormation = systemFormations.find(item => item.id === formationId);
    if (newFormation) {
      setTactic(prev => ({
        ...prev,
        parentFormationId: formationId,
        squadSize: newFormation.squadSize,
        positionOverrides: {},
        updatedAt: new Date().toISOString(),
      }));
      setSelectedPosition(null);
    }
  };

  const handleSave = async () => {
    if (submitInFlightRef.current || isSubmitting || isBlockingSystemFormationState || isBlockingEditState || isBlockingMissingParentFormation) {
      return;
    }

    submitInFlightRef.current = true;

    try {
      if (isEditing && tacticId) {
        const request: UpdateTacticRequest = {
          name: tactic.name,
          summary: tactic.summary || undefined,
          style: tactic.style || undefined,
          tags: tactic.tags || [],
          positionOverrides: buildOverridesPayload(tactic.positionOverrides),
          principles: buildPrinciplesPayload(tactic.principles),
        };
        await updateTactic(request);
      } else {
        const request: CreateTacticRequest = {
          name: tactic.name,
          parentFormationId: tactic.parentFormationId || '',
          parentTacticId: tactic.parentTacticId,
          summary: tactic.summary || undefined,
          style: tactic.style || undefined,
          tags: tactic.tags || [],
          scope: {
            type: teamId && ageGroupId ? 'team' : ageGroupId ? 'ageGroup' : 'club',
            clubId: clubId || '',
            ageGroupId: ageGroupId,
            teamId: teamId,
          },
          positionOverrides: buildOverridesPayload(tactic.positionOverrides),
          principles: buildPrinciplesPayload(tactic.principles),
        };
        await createTactic(request);
      }
    } finally {
      submitInFlightRef.current = false;
    }
  };

  // ---- Loading state (edit mode only) --------------------------------------
  const showSkeletons = isLoadingSystemFormations || (isEditing && hasValidEditTacticId && isLoading);

  if (showSkeletons) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <PageTitle
              title="Edit Tactic"
              subtitle="Loading…"
              badge={getScopeLabel()}
              backLink={getBackUrl()}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-4">
              <PitchEditorSkeleton />
            </div>
            <div className="lg:col-span-6 space-y-2">
              <BasicInfoSkeleton />
              <PrinciplesPanelSkeleton />
            </div>
          </div>
          <div className="mt-4">
            <FormActionsSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (isBlockingSystemFormationState) {
    return (
      <BlockingState
        title={isEditing ? 'Edit Tactic' : 'New Tactic'}
        subtitle="System formations unavailable"
        badge={getScopeLabel()}
        backLink={getBackUrl()}
        message={systemFormationsError?.message || 'No system formations are available for tactics right now.'}
      />
    );
  }

  if (isBlockingEditState) {
    const blockingMessage = !hasValidEditTacticId
      ? 'The tactic ID in the URL is invalid, so this tactic cannot be loaded for editing.'
      : fetchError?.message || 'This tactic could not be loaded.';

    return (
      <BlockingState
        title="Edit Tactic"
        subtitle="Error loading tactic"
        badge={getScopeLabel()}
        backLink={getBackUrl()}
        message={blockingMessage}
      />
    );
  }

  if (isBlockingMissingParentFormation) {
    return (
      <BlockingState
        title={isEditing ? 'Edit Tactic' : 'New Tactic'}
        subtitle="Base formation unavailable"
        badge={getScopeLabel()}
        backLink={getBackUrl()}
        message="The selected base formation is not available from the system formation catalog, so this tactic cannot be edited or saved."
      />
    );
  }

  const saveDisabled = isSubmitting || submitInFlightRef.current || !formation;

  // ---- Render form ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <PageTitle
            title={isEditing ? 'Edit Tactic' : 'New Tactic'}
            subtitle={`${formation?.name || 'Unknown Formation'}`}
            badge={getScopeLabel()}
            backLink={getBackUrl()}
          />
        </div>

        {/* Mutation error panel */}
        {mutationError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
            <div>
              <p className="text-red-700 dark:text-red-300">
                {mutationError.message}
              </p>
              {mutationError.validationErrors && (
                <ul className="mt-1 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                  {Object.entries(mutationError.validationErrors).map(([field, messages]) =>
                    messages.map((msg, i) => (
                      <li key={`${field}-${i}`}>{field}: {msg}</li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* Pitch Display - 40% width on desktop */}
          <div className="lg:col-span-4">
            {formation && (
              <TacticPitchEditor
                key={tactic.updatedAt}
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
          <div className="lg:col-span-6 space-y-2">
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
                      {formation?.name || 'Unknown'}
                    </div>
                  ) : (
                    <select
                      value={tactic.parentFormationId}
                      onChange={(e) => handleFormationChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {squadSizeOrder.map(squadSize => {
                        const formations = formationsBySquadSize[squadSize];
                        if (!formations || formations.length === 0) return null;

                        return (
                          <optgroup key={squadSize} label={`${squadSize}v${squadSize}`}>
                            {formations.map(f => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
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
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <FormActions
            isArchived={false}
            onArchive={isEditing ? () => console.log('Archive tactic') : undefined}
            onCancel={() => navigate(getBackUrl())}
            saveLabel={isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Tactic'}
            saveDisabled={saveDisabled}
            showArchive={isEditing}
          />
        </div>
        </form>
      </main>
    </div>
  );
}
