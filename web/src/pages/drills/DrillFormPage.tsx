import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle, ExternalLink, Globe, Play, Trash2, X } from 'lucide-react';
import { drillCategories, normalizeDrillCategory, playerAttributes } from '@/constants/referenceData';
import { Routes } from '@utils/routes';
import { detectLinkProvider } from '@utils/linkProviders';
import PageTitle from '@components/common/PageTitle';
import FormActions from '@components/common/FormActions';
import DrillDiagramEditor from '@components/training/DrillDiagramEditor';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  useDrill,
  useCreateDrill,
  useUpdateDrill,
  useClubById,
  useAgeGroupsByClubId,
  useClubTeams,
} from '@/api';
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

function AttributesSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
              ))}
            </div>
          </div>
        ))}
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
  const isEditMode = !!drillId;
  
  // API Hooks
  const { data: drillData, isLoading: isDrillLoading, error: fetchError } = useDrill(drillId);
  const { mutate: createDrill, isSubmitting: isCreating, data: createData, error: createError } = useCreateDrill();
  const { mutate: updateDrill, isSubmitting: isUpdating, data: updateData, error: updateError } = useUpdateDrill(drillId || '');
  const { data: club } = useClubById(clubId);
  const { data: ageGroups } = useAgeGroupsByClubId(clubId);
  const { data: teams } = useClubTeams(clubId);
  
  const isSubmitting = isCreating || isUpdating;
  const mutationError = createError || updateError;
  
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
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [links, setLinks] = useState<DrillFormLink[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkError, setNewLinkError] = useState<string | null>(null);
  const [drillDiagramConfig, setDrillDiagramConfig] = useState<DrillDiagramConfigDto | undefined>(undefined);
  const [isPublic, setIsPublic] = useState(true);

  // Check if drill is inherited (can only view, not edit)
  const isInherited = isEditMode && drillData ? (() => {
    const { scope } = drillData;
    if (teamId && !scope.teamIds.includes(teamId)) return true;
    if (ageGroupId && !scope.ageGroupIds.includes(ageGroupId) && scope.clubIds.length > 0 && scope.teamIds.length === 0) return true;
    return false;
  })() : false;

  // Initialize form state from API data (edit mode)
  useEffect(() => {
    if (isEditMode && drillData && !formInitialized.current) {
      setName(drillData.name);
      setDescription(drillData.description || '');
      setDuration(drillData.durationMinutes || 10);
      const normalizedCategory = normalizeDrillCategory(drillData.category);
      setCategory(normalizedCategory === 'Mixed' ? 'Drill' : normalizedCategory);
      setSelectedAttributes(drillData.attributes);
      setInstructions(drillData.instructions);
      setLinks(drillData.links.map(l => ({
        url: l.url,
        title: l.title || '',
        type: isSupportedLinkType(l.linkType) ? l.linkType : detectSupportedLinkType(l.url)
      })));
      setDrillDiagramConfig(drillData.drillDiagramConfig);
      setIsPublic(drillData.isPublic);
      formInitialized.current = true;
    }
  }, [isEditMode, drillData]);

  // Navigate to list on successful save
  useEffect(() => {
    const savedDrill = createData || updateData;
    if (savedDrill) {
      if (team) {
        navigate(Routes.teamDrills(clubId!, ageGroupId!, teamId!));
      } else if (ageGroup) {
        navigate(Routes.ageGroupDrills(clubId!, ageGroupId!));
      } else {
        navigate(Routes.drills(clubId!));
      }
    }
  }, [createData, updateData, clubId, ageGroupId, teamId, team, ageGroup, navigate]);

  // Group attributes by category
  const attributesByCategory: Record<string, Array<{key: string; label: string}>> = {
    Skills: [...playerAttributes.skills],
    Physical: [...playerAttributes.physical],
    Mental: [...playerAttributes.mental]
  };

  const toggleAttribute = (attrKey: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attrKey) 
        ? prev.filter(a => a !== attrKey)
        : [...prev, attrKey]
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
    if (selectedAttributes.length === 0) {
      alert('Please select at least one attribute');
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

    if (cleanedInstructions.length === 0) {
      alert('Please add at least one diagram instruction');
      return;
    }

    const cleanedLinks = links.filter(l => l.url.trim());

    if (isEditMode && drillId) {
      // Update existing drill
      const request: UpdateDrillRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        durationMinutes: duration,
        category,
        attributes: selectedAttributes,
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
        attributes: selectedAttributes,
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

  const handleCancel = () => {
    if (team) {
      navigate(Routes.teamDrills(clubId!, ageGroupId!, teamId!));
    } else if (ageGroup) {
      navigate(Routes.ageGroupDrills(clubId!, ageGroupId!));
    } else {
      navigate(Routes.drills(clubId!));
    }
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
            />
          </div>

          <div className="space-y-2">
            <BasicInfoSkeleton />
            <AttributesSkeleton />
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
            />
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
            <p className="text-red-700 dark:text-red-300">
              Failed to load drill: {fetchError.message}
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Drills
            </button>
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
            title={isEditMode ? (isInherited ? 'View Drill (Read-Only)' : 'Edit Drill') : 'Create Drill'}
            subtitle={`${contextName}`}
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

        {isInherited && (
          <div className="card mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  Inherited Drill
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  This drill was created at a higher level and cannot be edited here. 
                  You can view it or create a copy by creating a new drill with similar content.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Drill Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Passing Triangle, Dribbling Gates"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isInherited}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the drill"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isInherited}
                  />
                </div>

                <div className={`grid gap-3 ${!isInherited ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      min={1}
                      max={120}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isInherited}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as 'Drill' | 'Skills Practice' | 'Game Related Practice' | 'Conditioned Game')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

                  {!isInherited && (
                    <div className="flex items-end">
                      <label className="w-full flex items-center gap-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
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
            </div>

            {/* Drill Diagram Editor */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Drill Diagram</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Draw your setup directly on the pitch. Add multiple frames and edit each frame from the slide list.
              </p>
              <DrillDiagramEditor
                value={drillDiagramConfig}
                onChange={setDrillDiagramConfig}
                disabled={isInherited}
              />
            </div>

            {/* Attributes */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Attributes Developed *</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the player attributes this drill improves.
              </p>

              {Object.entries(attributesByCategory).map(([category, attrs]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {category} {category === 'Skills' ? '⚽' : category === 'Physical' ? '💪' : '🧠'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {attrs.map(attr => {
                      const isSelected = selectedAttributes.includes(attr.key);
                      return (
                        <button
                          key={attr.key}
                          type="button"
                          onClick={() => !isInherited && toggleAttribute(attr.key)}
                          disabled={isInherited}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            isSelected
                              ? 'bg-primary-600 text-white dark:bg-primary-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          } ${isInherited ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          {attr.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Links (Optional) */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Reference Links</h3>
                {!isInherited && (
                  <button
                    type="button"
                    onClick={openAddLinkModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-2 rounded-lg transition-colors inline-flex items-center"
                    aria-label="Add reference link"
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
            {!isInherited && (
              <FormActions
                onCancel={handleCancel}
                saveLabel={isEditMode ? 'Update Drill' : 'Create Drill'}
                saveDisabled={isSubmitting}
              />
            )}

            {isInherited && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Drills
                </button>
              </div>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link Title (optional)
                  </label>
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="e.g. Passing tutorial"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
