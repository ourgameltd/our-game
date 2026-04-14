import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import { getAttributeCategory, playerAttributes, linkTypes } from '@/constants/referenceData';
import { Routes } from '@utils/routes';
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
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [links, setLinks] = useState<Array<{url: string; title: string; type: string}>>([]);
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
      setSelectedAttributes(drillData.attributes);
      setInstructions(drillData.instructions.length > 0 ? drillData.instructions : ['']);
      setLinks(drillData.links.map(l => ({
        url: l.url,
        title: l.title || '',
        type: l.linkType
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

  // Calculate category based on selected attributes
  const getCategory = (): 'technical' | 'tactical' | 'physical' | 'mental' => {
    const categories = selectedAttributes.map(attr => {
      const category = getAttributeCategory(attr);
      if (category === 'Skills') return 'technical';
      if (category === 'Physical') return 'physical';
      if (category === 'Mental') return 'mental';
      return 'technical';
    });
    
    const categoryCounts: Record<string, number> = {};
    categories.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    let maxCategory: 'technical' | 'tactical' | 'physical' | 'mental' = 'technical';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategory = cat as any;
      }
    });
    
    return maxCategory;
  };

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

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: 'url' | 'title' | 'type', value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const addLink = () => {
    setLinks([...links, { url: '', title: '', type: 'youtube' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
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
    if (instructions.filter(i => i.trim()).length === 0) {
      alert('Please add at least one instruction');
      return;
    }

    // Clean up data
    const cleanedInstructions = instructions.filter(i => i.trim());
    const cleanedLinks = links.filter(l => l.url.trim() && l.title.trim());

    if (isEditMode && drillId) {
      // Update existing drill
      const request: UpdateDrillRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        durationMinutes: duration,
        category: getCategory(),
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
        category: getCategory(),
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
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the drill"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isInherited}
                    required
                  />
                </div>

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
              </div>
            </div>

            {/* Attributes */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Attributes Developed *</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the player attributes this drill improves. Category is auto-calculated.
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

              {selectedAttributes.length > 0 && (
                <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <p className="text-sm font-medium text-primary-900 dark:text-primary-200">
                    Category: <span className="capitalize">{getCategory()}</span> ({selectedAttributes.length} attributes selected)
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Instructions *</h3>
              <div className="space-y-2">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 mt-2">{index + 1}.</span>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder="Instruction step..."
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isInherited}
                    />
                    {!isInherited && instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {!isInherited && (
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="btn btn-secondary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Instruction
                  </button>
                )}
              </div>
            </div>

            {/* Links (Optional) */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Reference Links (Optional)</h3>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex gap-2">
                      <select
                        value={link.type}
                        onChange={(e) => updateLink(index, 'type', e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isInherited}
                      >
                        {linkTypes.map(lt => (
                          <option key={lt.value} value={lt.value}>{lt.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateLink(index, 'title', e.target.value)}
                        placeholder="Link title"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isInherited}
                      />
                      {!isInherited && (
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isInherited}
                    />
                  </div>
                ))}
                {!isInherited && (
                  <button
                    type="button"
                    onClick={addLink}
                    className="btn btn-secondary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </button>
                )}
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

            {/* Sharing */}
            {!isInherited && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Sharing</h3>
                <label className="flex items-center gap-3">
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
      </main>
    </div>
  );
}
