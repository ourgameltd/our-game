import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ExternalLink, Globe, Play, Trash2, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { drillCategories, normalizeDrillCategory, drillCompetencies } from '@/constants/referenceData';
import { Routes } from '@utils/routes';
import { detectLinkProvider } from '@utils/linkProviders';
import PageTitle from '@components/common/PageTitle';
import FormActions from '@components/common/FormActions';
import DrillDiagramEditor from '@components/training/DrillDiagramEditor';
import EquipmentSummary from '@components/training/EquipmentSummary';
import { extractEquipmentFromDiagram } from '@utils/equipmentFromDiagram';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  useDrill,
  useCreateDrill,
  useUpdateDrill,
  useClubById,
  useAgeGroupsByClubId,
  useClubTeams,
} from '@/api';
import { useArchiveDrill } from '@/api/hooks';
import type {
  CreateDrillRequest,
  UpdateDrillRequest,
} from '@/api';
import type { DrillDiagramConfigDto } from '@/api/client';

// ---------------------------------------------------------------------------
// Skeleton Components
// ---------------------------------------------------------------------------

function BasicInfoSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-2">
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div>
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}


function SectionSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function FormActionsSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex justify-end gap-4">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

type DrillFormLink = {
  url: string;
  title: string;
  type: string;
};

function getProviderIcon(type: string) {
  switch (type) {
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-label="YouTube icon" role="img">
          <rect x="2" y="5" width="20" height="14" rx="4" fill="#ff0000" />
          <path d="M10 9l6 3-6 3V9z" fill="#ffffff" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-label="Instagram icon" role="img">
          <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="#e1306c" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="#e1306c" strokeWidth="2" />
          <circle cx="17" cy="7" r="1.2" fill="#e1306c" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-label="TikTok icon" role="img">
          <path d="M14 4c.4 1.8 1.5 3.3 3 4.3 1 .7 2.2 1.1 3.5 1.2v3.2c-1.7-.1-3.3-.6-4.8-1.4v5.7c0 3.2-2.7 5.8-5.9 5.8S4 20.2 4 17s2.7-5.8 5.8-5.8c.3 0 .6 0 .8.1v3.2c-.2 0-.5-.1-.7-.1-1.5 0-2.7 1.2-2.7 2.7S8.4 19.8 9.9 19.8s2.7-1.2 2.7-2.7V4h1.4z" fill="#111111" />
        </svg>
      );
    case 'website':
      return <Globe className="w-5 h-5" />;
    default:
      return <ExternalLink className="w-5 h-5" />;
  }
}

function isSupportedLinkType(type: string): boolean {
  return ['youtube', 'instagram', 'tiktok', 'website', 'other'].includes(type);
}

function detectSupportedLinkType(url: string): string {
  const detected = detectLinkProvider(url);
  if (detected && isSupportedLinkType(detected)) {
    return detected;
  }

  return 'website';
}

export default function DrillFormPage() {
  usePageTitle(['Drill Form']);

  const { clubId, ageGroupId, teamId, drillId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditMode = !!drillId;
  
  // API Hooks
  const { data: drillData, isLoading: isDrillLoading, error: fetchError } = useDrill(drillId);
  const { mutate: createDrill, isSubmitting: isCreating, data: createData, error: createError } = useCreateDrill();
  const { mutate: updateDrill, isSubmitting: isUpdating, data: updateData, error: updateError } = useUpdateDrill(drillId || '');
  const archiveMutation = useArchiveDrill(drillId);
  const { data: club } = useClubById(clubId);
  const { data: ageGroups } = useAgeGroupsByClubId(clubId);
  const { data: teams } = useClubTeams(clubId);
  
  const isSubmitting = isCreating || isUpdating || archiveMutation.isSubmitting;
  
  // Find context data
  const ageGroup = ageGroupId && ageGroups ? ageGroups.find(ag => ag.id === ageGroupId) : undefined;
  const team = teamId && teams ? teams.find(t => t.id === teamId) : undefined;
  
  // Form initialization flag
  const formInitialized = useRef(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(10);
  const [category, setCategory] = useState<'Drill' | 'Skills Practice' | 'Game Related Practice' | 'Conditioned Game'>('Drill');
  const [selectedCompetencyIds, setSelectedCompetencyIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [links, setLinks] = useState<DrillFormLink[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkError, setNewLinkError] = useState<string | null>(null);
  const [drillDiagramConfig, setDrillDiagramConfig] = useState<DrillDiagramConfigDto | undefined>(undefined);
  const [showDiagram, setShowDiagram] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Check if drill is inherited (can only view, not edit)
  const isInherited = isEditMode && drillData ? (() => {
    const { scope } = drillData;
    if (teamId && !scope.teamIds.includes(teamId)) return true;
    if (ageGroupId && !scope.ageGroupIds.includes(ageGroupId) && scope.clubIds.length > 0 && scope.teamIds.length === 0) return true;
    return false;
  })() : false;

  const inheritedFromLabel = isInherited && drillData ? (() => {
    const { scope } = drillData;
    if (scope.ageGroupIds.length > 0) return 'Inherited from age group';
    if (scope.clubIds.length > 0) return 'Inherited from club';
    return 'Inherited from higher level';
  })() : null;

  // Initialize form state from API data (edit mode)
  useEffect(() => {
    if (isEditMode && drillData && !formInitialized.current) {
      setName(drillData.name);
      setDescription(drillData.description || '');
      setDuration(drillData.durationMinutes || 10);
      const normalizedCategory = normalizeDrillCategory(drillData.category);
      setCategory(normalizedCategory === 'Mixed' ? 'Drill' : normalizedCategory);
      setSelectedCompetencyIds(drillData.competencies.map(c => c.id));
      setInstructions(drillData.instructions);
      setLinks(drillData.links.map(l => ({
        url: l.url,
        title: l.title || '',
        type: isSupportedLinkType(l.linkType) ? l.linkType : detectSupportedLinkType(l.url)
      })));
      setDrillDiagramConfig(drillData.drillDiagramConfig);
      setShowDiagram(!!drillData.drillDiagramConfig?.frames?.length);
      setIsPublic(drillData.isPublic);
      formInitialized.current = true;
    }
  }, [isEditMode, drillData]);

  useEffect(() => {
    const savedDrill = createData || updateData;
    if (savedDrill) {
      addToast('success', isEditMode ? 'Drill updated successfully' : 'Drill created successfully');
    }
  }, [createData, updateData, addToast, isEditMode]);

  useEffect(() => {
    const error = createError || updateError;
    if (error && !error.validationErrors) {
      addToast('error', error.message || 'Failed to save drill');
    }
  }, [createError, updateError, addToast]);

  const toggleCompetency = (competencyId: string) => {
    setSelectedCompetencyIds(prev =>
      prev.includes(competencyId)
        ? prev.filter(id => id !== competencyId)
        : [...prev, competencyId]
    );
  };

  const normalizeUrl = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const openAddLinkModal = () => {
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkError(null);
    setIsLinkModalOpen(true);
  };

  const closeAddLinkModal = () => {
    setIsLinkModalOpen(false);
    setNewLinkError(null);
  };

  const handleAddLink = () => {
    const normalizedUrl = normalizeUrl(newLinkUrl);

    if (!normalizedUrl) {
      setNewLinkError('Please enter a link URL.');
      return;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setNewLinkError('Please enter a valid URL.');
      return;
    }

    setLinks((prev) => [
      ...prev,
      {
        url: normalizedUrl,
        title: newLinkTitle.trim(),
        type: detectSupportedLinkType(normalizedUrl),
      },
    ]);
    closeAddLinkModal();
  };

  const handlePlayLink = (link: DrillFormLink) => {
    if (!link.url.trim()) {
      return;
    }

    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteLink = (indexToDelete: number) => {
    setLinks((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const getDiagramInstructions = (): string[] => {
    return (drillDiagramConfig?.frames ?? [])
      .map((frame) => {
        const pitchData = (frame.pitch as Record<string, unknown> | undefined) ?? {};
        const rawText = pitchData.instructionsText;
        return typeof rawText === 'string' ? rawText.trim() : '';
      })
      .filter((instruction) => instruction.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isInherited) {
      return;
    }

    // Validate
    if (!name.trim()) {
      alert('Please enter a drill name');
      return;
    }
    if (selectedCompetencyIds.length === 0) {
      alert('Please select at least one competency');
      return;
    }
    if (!category.trim()) {
      alert('Please select a category');
      return;
    }

    // Clean up data
    const diagramInstructions = getDiagramInstructions();
    const fallbackInstructions = instructions.filter(i => i.trim());
    const cleanedInstructions = diagramInstructions.length > 0 ? diagramInstructions : fallbackInstructions;

    const cleanedLinks = links.filter(l => l.url.trim());

    if (isEditMode && drillId) {
      // Update existing drill
      const request: UpdateDrillRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        durationMinutes: duration,
        category,
        competencyIds: selectedCompetencyIds,
        equipment: [],
        instructions: cleanedInstructions,
        variations: [],
        links: cleanedLinks.map(l => ({
          url: l.url,
          title: l.title || undefined,
          type: l.type
        })),
        drillDiagramConfig,
        isPublic
      };
      updateDrill(request);
    } else {
      // Create new drill
      const request: CreateDrillRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        durationMinutes: duration,
        category,
        competencyIds: selectedCompetencyIds,
        equipment: [],
        instructions: cleanedInstructions,
        variations: [],
        links: cleanedLinks.map(l => ({
          url: l.url,
          title: l.title || undefined,
          linkType: l.type
        })),
        drillDiagramConfig,
        isPublic,
        scope: {
          clubId: clubId,
          ageGroupId: ageGroupId,
          teamId: teamId
        }
      };
      createDrill(request);
    }
  };

  const handleArchive = async () => {
    if (!drillId || !isEditMode) return;

    const isCurrentlyArchived = drillData?.isArchived ?? false;
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    const drillName = name.trim() || 'this drill';
    if (!confirm(`Are you sure you want to ${action} "${drillName}"?`)) return;

    const success = await archiveMutation.mutate(!isCurrentlyArchived);
    if (success) {
      addToast('success', isCurrentlyArchived ? 'Drill unarchived' : 'Drill archived');
      navigate(backLink);
    } else if (archiveMutation.error) {
      addToast('error', archiveMutation.error.message || 'Failed to update drill archive status');
    }
  };

  const handleCancel = () => {
    navigate(backLink);
  };

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Club not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const contextName = team ? team.name : ageGroup ? ageGroup.name : club.name;
  const backLink = team && clubId && ageGroupId && teamId
    ? Routes.teamDrills(clubId, ageGroupId, teamId)
    : ageGroup && clubId && ageGroupId
      ? Routes.ageGroupDrills(clubId, ageGroupId)
      : clubId
        ? Routes.drills(clubId)
        : Routes.dashboard();

  // ---- Loading state (edit mode only) --------------------------------------
  const showSkeletons = isEditMode && isDrillLoading;

  if (showSkeletons) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="mb-4">
            <PageTitle
              title="Edit Drill"
              subtitle={`${contextName} • Loading…`}
              backLink={backLink}
            />
          </div>

          <div className="space-y-2">
            <BasicInfoSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
            <FormActionsSkeleton />
          </div>
        </main>
      </div>
    );
  }

  // ---- Error state (edit mode fetch failed) --------------------------------
  if (isEditMode && fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="mb-4">
            <PageTitle
              title="Edit Drill"
              subtitle={`${contextName} • Error`}
              backLink={backLink}
            />
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
            <p className="text-red-700 dark:text-red-300">
              Failed to load drill: {fetchError.message}
            </p>
          </div>

        </main>
      </div>
    );
  }

  // ---- Render form ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <PageTitle
            title={isEditMode ? (isInherited ? 'View Inherited Drill' : 'Edit Drill') : 'Create Drill'}
            subtitle={`${contextName}`}
            backLink={backLink}
          />
        </div>


        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Basic Information&nbsp;
                    {inheritedFromLabel && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-gray-600 dark:bg-gray-500 text-white rounded align-middle">
                        {inheritedFromLabel}
                      </span>
                    )}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Left column: Name, Category, Duration + Checkbox */}
                <div className="space-y-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <label className="label">
                        Drill Name *
                      </label>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Passing Triangle, Dribbling Gates"
                      className="input"
                      disabled={isInherited}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as 'Drill' | 'Skills Practice' | 'Game Related Practice' | 'Conditioned Game')}
                      className="input"
                      disabled={isInherited}
                      required
                    >
                      {drillCategories
                        .filter((drillCategory) => drillCategory.value !== 'Mixed')
                        .map((drillCategory) => (
                          <option key={drillCategory.value} value={drillCategory.value}>
                            {drillCategory.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="sm:w-40 shrink-0">
                      <label className="label">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min={1}
                        max={120}
                        className="input"
                        disabled={isInherited}
                        required
                      />
                    </div>

                    {!isInherited && (
                      <div className="flex items-end">
                        <label className="flex items-center gap-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Share this drill with other teams in the club
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right column: Competencies */}
                <div>
                  <label className="label">
                    Competencies *
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {drillCompetencies.map(competency => {
                      const isSelected = selectedCompetencyIds.includes(competency.id);
                      return (
                        <button
                          key={competency.id}
                          type="button"
                          onClick={() => !isInherited && toggleCompetency(competency.id)}
                          disabled={isInherited}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            isSelected
                              ? 'bg-primary-600 text-white dark:bg-primary-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } ${isInherited ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          {competency.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Drill Diagram Editor + Equipment Needed */}
            <div className={showDiagram ? 'grid gap-2 items-start lg:grid-cols-[1fr_260px]' : ''}>
              <div className="card min-w-0 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Drill Diagram</h3>
                  {!isInherited && (
                    showDiagram ? (
                      <button
                        type="button"
                        onClick={() => { setShowDiagram(false); setDrillDiagramConfig(undefined); }}
                        className="btn-sm btn-danger"
                      >
                        Remove Diagram
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDiagram(true)}
                        className="btn-sm btn-secondary"
                      >
                        Add Diagram
                      </button>
                    )
                  )}
                </div>
                {showDiagram ? (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Draw your setup directly on the pitch. Add players, cones, balls, markers, mannequins, and more across multiple frames, with canvas resizing behaviour preserved for those drill items.
                    </p>
                    <DrillDiagramEditor
                      value={drillDiagramConfig}
                      onChange={setDrillDiagramConfig}
                      disabled={isInherited}
                    />
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No diagram added. Click "Add Diagram" to draw one, or add a reference video link below.
                  </p>
                )}
              </div>

              {showDiagram && (
                <EquipmentSummary equipment={extractEquipmentFromDiagram(drillDiagramConfig)} showEmpty />
              )}
            </div>

            {/* Links (Optional) */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Reference Links</h3>
                {!isInherited && (
                  <button
                    type="button"
                    onClick={openAddLinkModal}
                    className="btn-success btn-md"
                    aria-label="Add reference link"
                    title="Add reference link"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {links.some((link) => link.url.trim().length > 0) ? (
                  links
                    .filter((link) => link.url.trim().length > 0)
                    .map((link, index) => (
                      <div
                        key={`${link.url}-${index}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="shrink-0">
                          {getProviderIcon(link.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {link.title.trim() || link.url}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlayLink(link)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          Open
                        </button>
                        {!isInherited && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(index)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                            aria-label="Delete link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-400">
                    No reference links added yet. Click the + button to add one.
                  </div>
                )}

              </div>
            </div>


            {/* Form Actions */}
            {isEditMode && isInherited ? (
              <FormActions
                isArchived={drillData?.isArchived}
                onArchive={handleArchive}
                onCancel={handleCancel}
                saveLabel="Update Drill"
                showSave={false}
              />
            ) : (
              <FormActions
                isArchived={drillData?.isArchived}
                onArchive={isEditMode ? handleArchive : undefined}
                onCancel={handleCancel}
                saveLabel={isEditMode ? 'Update Drill' : 'Create Drill'}
                saveDisabled={isSubmitting}
              />
            )}

          </div>
        </form>

        {isLinkModalOpen && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/50" onClick={closeAddLinkModal}>
            <div
              className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Add Reference Link</h4>
                <button
                  type="button"
                  onClick={closeAddLinkModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close add link modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="label">
                    Link Title (optional)
                  </label>
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="e.g. Passing tutorial"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    Link URL *
                  </label>
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => {
                      setNewLinkUrl(e.target.value);
                      if (newLinkError) {
                        setNewLinkError(null);
                      }
                    }}
                    placeholder="https://..."
                    className="input"
                  />
                  {newLinkError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{newLinkError}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeAddLinkModal}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
