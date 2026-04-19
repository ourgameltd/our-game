import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { 
  useDrillTemplateById, 
  useDrillsByScope, 
  useClubById,
  useCreateDrillTemplate,
  useUpdateDrillTemplate,
  useArchiveDrillTemplate
} from '@/api/hooks';
import type { DrillListDto, CreateDrillTemplateRequest, UpdateDrillTemplateRequest } from '@/api';
import { getAttributeLabel, getDrillCategoryColors, getDrillCategoryLabel, normalizeDrillCategory } from '@/constants/referenceData';
import { sessionCategories, normalizeSessionCategory } from '@/constants/sessionCategories';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import FormActions from '@components/common/FormActions';
import DrillDiagramRenderer from '@/components/training/DrillDiagramRenderer';

// Skeleton components for loading states
function BasicInfoSkeleton() {
  return (
    <div className="card animate-pulse">
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="space-y-2">
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function DrillsSkeleton() {
  return (
    <div className="card animate-pulse">
      <h3 className="text-lg font-semibold mb-2">Drills</h3>
      <div className="h-4 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
    </div>
  );
}

export default function DrillTemplateFormPage() {
  usePageTitle(['Drill Template Form']);

  const { clubId, ageGroupId, teamId, templateId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!templateId;
  
  // Fetch data
  const { data: club } = useClubById(clubId);
  const { data: template, isLoading: isLoadingTemplate, error: templateError } = useDrillTemplateById(templateId);
  const { data: drillsData, isLoading: isLoadingDrills, error: drillsError } = useDrillsByScope(clubId, ageGroupId, teamId);
  
  // Mutations
  const createMutation = useCreateDrillTemplate();
  const updateMutation = useUpdateDrillTemplate(templateId || '');
  const archiveMutation = useArchiveDrillTemplate(templateId);
  
  // Determine if user can edit based on scope
  const canEdit = useMemo(() => {
    if (!isEditMode || !template) return true;
    
    // Check scope against route context
    if (teamId) {
      return template.scopeType === 'team' && template.scopeTeamId === teamId;
    }
    if (ageGroupId) {
      return template.scopeType === 'agegroup' && template.scopeAgeGroupId === ageGroupId;
    }
    if (clubId) {
      return template.scopeType === 'club' && template.scopeClubId === clubId;
    }
    
    return false;
  }, [isEditMode, template, clubId, ageGroupId, teamId]);
  
  const isInherited = isEditMode && !canEdit;

  const availableDrills = drillsData?.drills || [];

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDrillIds, setSelectedDrillIds] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [sessionCategory, setSessionCategory] = useState<'Whole Part Whole' | 'Skills Practice' | 'Circuits' | 'Scenario'>('Whole Part Whole');
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillSearchTerm, setDrillSearchTerm] = useState('');
  const [drillCategoryFilter, setDrillCategoryFilter] = useState<string>('all');
  const [pendingSelectedDrillIds, setPendingSelectedDrillIds] = useState<string[]>([]);
  const [previewDrillId, setPreviewDrillId] = useState<string | null>(null);
  const [focusedSlideIndex, setFocusedSlideIndex] = useState(0);

  // Initialize form when template loads
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setSelectedDrillIds(template.drillIds);
      setIsPublic(template.isPublic);
      setSessionCategory(normalizeSessionCategory(template.sessionCategory));
    }
  }, [template]);

  // Calculate aggregated data from selected drills
  const getAggregatedData = () => {
    const drills = selectedDrillIds
      .map(id => availableDrills.find(d => d.id === id))
      .filter((d): d is DrillListDto => d !== undefined);
    
    // Total duration
    const totalDuration = drills.reduce((sum, drill) => sum + (drill.duration || 0), 0);
    
    // Unique attributes
    const attributeSet = new Set<string>();
    drills.forEach(drill => {
      drill.attributes.forEach(attr => attributeSet.add(attr));
    });
    const attributes = Array.from(attributeSet);
    
    // Category calculation
    const categories = drills.map(d => normalizeDrillCategory(d.category));
    const categoryCounts: Record<string, number> = {};
    categories.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    let category: 'Drill' | 'Skills Practice' | 'Game Related Practice' | 'Conditioned Game' | 'Mixed' = 'Mixed';
    if (Object.keys(categoryCounts).length === 1) {
      category = Object.keys(categoryCounts)[0] as any;
    } else if (Object.keys(categoryCounts).length > 1) {
      category = 'Mixed';
    }
    
    return { totalDuration, attributes, category };
  };

  const { totalDuration, attributes, category } = getAggregatedData();

  const availableDrillsForSelection = useMemo(
    () => availableDrills.filter((drill) => !selectedDrillIds.includes(drill.id)),
    [availableDrills, selectedDrillIds]
  );

  const filteredAvailableDrills = useMemo(() => {
    return availableDrillsForSelection.filter((drill) => {
      if (drillSearchTerm) {
        const searchLower = drillSearchTerm.toLowerCase();
        const description = (drill.description || '').toLowerCase();
        const attrMatch = drill.attributes.some((attr) => getAttributeLabel(attr).toLowerCase().includes(searchLower));
        if (!drill.name.toLowerCase().includes(searchLower) && !description.includes(searchLower) && !attrMatch) {
          return false;
        }
      }

      if (drillCategoryFilter !== 'all' && normalizeDrillCategory(drill.category) !== drillCategoryFilter) {
        return false;
      }

      return true;
    });
  }, [availableDrillsForSelection, drillSearchTerm, drillCategoryFilter]);

  const previewDrill = useMemo(
    () => availableDrillsForSelection.find((drill) => drill.id === previewDrillId) ?? null,
    [availableDrillsForSelection, previewDrillId]
  );
  const previewFrames = previewDrill?.drillDiagramConfig?.frames ?? [];
  const focusedFrame = previewFrames[focusedSlideIndex] ?? previewFrames[0] ?? null;

  const openDrillModal = () => {
    setPendingSelectedDrillIds([]);
    setDrillSearchTerm('');
    setDrillCategoryFilter('all');
    setPreviewDrillId(null);
    setFocusedSlideIndex(0);
    setShowDrillModal(true);
  };

  const closeDrillModal = () => {
    setShowDrillModal(false);
    setPendingSelectedDrillIds([]);
    setDrillSearchTerm('');
    setDrillCategoryFilter('all');
    setPreviewDrillId(null);
    setFocusedSlideIndex(0);
  };

  const togglePendingDrillSelection = (drillId: string) => {
    setPendingSelectedDrillIds((prev) =>
      prev.includes(drillId) ? prev.filter((id) => id !== drillId) : [...prev, drillId]
    );
  };

  const addSelectedDrills = () => {
    if (pendingSelectedDrillIds.length === 0) {
      closeDrillModal();
      return;
    }

    const idsToAdd = filteredAvailableDrills
      .filter((drill) => pendingSelectedDrillIds.includes(drill.id))
      .map((drill) => drill.id);

    setSelectedDrillIds((prev) => [...prev, ...idsToAdd.filter((id) => !prev.includes(id))]);
    closeDrillModal();
  };

  const removeDrill = (drillId: string) => {
    setSelectedDrillIds(selectedDrillIds.filter(id => id !== drillId));
  };

  const moveDrillUp = (index: number) => {
    if (index === 0) return;
    const updated = [...selectedDrillIds];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setSelectedDrillIds(updated);
  };

  const moveDrillDown = (index: number) => {
    if (index === selectedDrillIds.length - 1) return;
    const updated = [...selectedDrillIds];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setSelectedDrillIds(updated);
  };

  const getCategoryColor = (cat?: string) => {
    const colors = getDrillCategoryColors(cat || 'Mixed');
    return `${colors.bgColor} ${colors.textColor}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions when users click Save repeatedly.
    if (createMutation.isSubmitting || updateMutation.isSubmitting || archiveMutation.isSubmitting) {
      return;
    }
    
    if (!canEdit) {
      alert('You cannot edit inherited session templates. Please create a new template instead.');
      return;
    }

    // Validate
    if (!name.trim()) {
      alert('Please enter a session name');
      return;
    }
    if (selectedDrillIds.length === 0) {
      alert('Please add at least one drill');
      return;
    }

    if (isEditMode && templateId) {
      // Update existing template
      const updateRequest: UpdateDrillTemplateRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        drillIds: selectedDrillIds,
        isPublic,
        sessionCategory
      };
      
      const updated = await updateMutation.mutate(updateRequest);
      if (updated) {
        navigateBack();
      }
    } else {
      // Create new template
      const createRequest: CreateDrillTemplateRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        drillIds: selectedDrillIds,
        isPublic,
        sessionCategory,
        scope: {
          clubId,
          ageGroupId,
          teamId
        }
      };
      
      const created = await createMutation.mutate(createRequest);
      if (created) {
        navigateBack();
      }
    }
  };

  const navigateBack = () => {
    if (teamId) {
      navigate(Routes.teamDrillTemplates(clubId!, ageGroupId!, teamId!));
    } else if (ageGroupId) {
      navigate(Routes.ageGroupDrillTemplates(clubId!, ageGroupId!));
    } else {
      navigate(Routes.drillTemplates(clubId!));
    }
  };

  const handleCancel = () => {
    navigateBack();
  };

  const handleArchive = async () => {
    if (!templateId || !isEditMode || isInherited) {
      return;
    }

    const isCurrentlyArchived = template?.isArchived ?? false;
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    const templateName = name.trim() || 'this session';
    if (!confirm(`Are you sure you want to ${action} "${templateName}"?`)) {
      return;
    }

    const updated = await archiveMutation.mutate(!isCurrentlyArchived);
    if (updated) {
      navigateBack();
    }
  };

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Club not found</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  The requested club could not be found.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const contextName = club.name;
  const isSubmitting = createMutation.isSubmitting || updateMutation.isSubmitting || archiveMutation.isSubmitting;
  const mutationError = createMutation.error || updateMutation.error || archiveMutation.error;
  const backLink = teamId
    ? Routes.teamDrillTemplates(clubId!, ageGroupId!, teamId)
    : ageGroupId
      ? Routes.ageGroupDrillTemplates(clubId!, ageGroupId)
      : Routes.drillTemplates(clubId!);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <PageTitle
              title={isEditMode ? (isInherited ? 'View Session (Read-Only)' : 'Edit Session') : 'Create Session'}
              subtitle={`${contextName}`}
              backLink={backLink}
            />
          </div>
        </div>

        {mutationError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
            <p className="text-red-700 dark:text-red-300">{mutationError.message}</p>
          </div>
        )}

        {isInherited && (
          <div className="card mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  Inherited Session Template
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  This session template was created at a higher level and cannot be edited here. 
                  You can view it or create a copy by creating a new template with similar content.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            {/* Basic Information */}
            {isLoadingTemplate && isEditMode ? (
              <BasicInfoSkeleton />
            ) : (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                
                {templateError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800 dark:text-red-300">
                        {templateError.message || 'Failed to load session template'}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Technical Foundation, Possession Play"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isInherited || isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Category
                      </label>
                      <select
                        value={sessionCategory}
                        onChange={(e) => setSessionCategory(e.target.value as typeof sessionCategory)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isInherited || isSubmitting}
                      >
                        {sessionCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the session objectives"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isInherited || isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sharing
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            disabled={isInherited || isSubmitting}
                            className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Share this session template with other teams in the club
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Drills */}
            {isLoadingDrills ? (
              <DrillsSkeleton />
            ) : (
              <div className="card">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Drills *</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add drills to your session. You can reorder them by using the arrow buttons.
                    </p>
                  </div>
                  {!isInherited && !drillsError && (
                    <button
                      type="button"
                      onClick={openDrillModal}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {drillsError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800 dark:text-red-300">
                        {drillsError.message || 'Failed to load drills'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Drills */}
                {selectedDrillIds.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {selectedDrillIds.map((drillId, index) => {
                      const drill = availableDrills.find(d => d.id === drillId);
                      if (!drill) return null;
                    
                    return (
                      <div
                        key={drillId}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveDrillUp(index)}
                            disabled={isInherited || isSubmitting || index === 0}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDrillDown(index)}
                            disabled={isInherited || isSubmitting || index === selectedDrillIds.length - 1}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              {index + 1}.
                            </span>
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {drill.name}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(drill.category)}`}>
                              {getDrillCategoryLabel(drill.category)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {drill.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>⏱️ {drill.duration || 0}m</span>
                            <span>🎯 {drill.attributes.length} attributes</span>
                          </div>
                        </div>
                        
                        {!isInherited && (
                          <button
                            type="button"
                            onClick={() => removeDrill(drillId)}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedDrillIds.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No drills added yet. Click "Add Drill" to get started.
                </p>
              )}
            </div>
            )}

            {/* Session Summary */}
            {selectedDrillIds.length > 0 && (
              <div className="card bg-primary-50 dark:bg-primary-900/20">
                <h3 className="text-lg font-semibold mb-4">Session Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {totalDuration} mins
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Number of Drills</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {selectedDrillIds.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 capitalize">
                      {category}
                    </p>
                  </div>
                </div>
                
                {attributes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Attributes Developed ({attributes.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {attributes.slice(0, 10).map(attr => (
                        <span
                          key={attr}
                          className="px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
                        >
                          {getAttributeLabel(attr)}
                        </span>
                      ))}
                      {attributes.length > 10 && (
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                          +{attributes.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            {!isInherited && (
              <FormActions
                isArchived={template?.isArchived}
                onArchive={isEditMode ? handleArchive : undefined}
                onCancel={handleCancel}
                saveLabel={isEditMode ? 'Update Session' : 'Create Session'}
                saveDisabled={isSubmitting || !!templateError}
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
                  Back to Sessions
                </button>
              </div>
            )}
          </div>
        </form>
      </main>

      {/* Drill Selection Modal */}
      {showDrillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-1000">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[88vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Drills to Session</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Search and select one or more drills to add.</p>
              </div>
              <button
                type="button"
                onClick={closeDrillModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                  <input
                    type="text"
                    value={drillSearchTerm}
                    onChange={(e) => setDrillSearchTerm(e.target.value)}
                    placeholder="Search by name, description, or attributes..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={drillCategoryFilter}
                    onChange={(e) => setDrillCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Categories</option>
                    {[
                      { value: 'Drill', label: 'Drill' },
                      { value: 'Skills Practice', label: 'Skills Practice' },
                      { value: 'Game Related Practice', label: 'Game Related Practice' },
                      { value: 'Conditioned Game', label: 'Conditioned Game' }
                    ].map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
              <div className={`p-6 overflow-y-auto ${previewDrill ? 'w-1/2 border-r border-gray-200 dark:border-gray-700' : 'w-full'}`}>
                {filteredAvailableDrills.length > 0 ? (
                  <div className="space-y-2">
                    {filteredAvailableDrills.map((drill) => {
                      const isChecked = pendingSelectedDrillIds.includes(drill.id);
                      const isPreviewed = previewDrillId === drill.id;

                      return (
                        <div
                          key={drill.id}
                          onClick={() => {
                            setPreviewDrillId(drill.id);
                            setFocusedSlideIndex(0);
                          }}
                          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                            isPreviewed
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                              : isChecked
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => togglePendingDrillSelection(drill.id)}
                              className="mt-1 w-4 h-4"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{drill.name}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(drill.category)}`}>
                                  {getDrillCategoryLabel(drill.category)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">⏱️ {drill.duration || 0}m</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">🎯 {drill.attributes.length} attributes</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{drill.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No available drills found matching your search.
                  </p>
                )}
              </div>

              {previewDrill && (
                <div className="w-1/2 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{previewDrill.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(previewDrill.category)}`}>
                          {getDrillCategoryLabel(previewDrill.category)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">⏱️ {previewDrill.duration || 0} minutes</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewDrillId(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    {previewDrill.drillDiagramConfig?.frames?.length ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Slides ({previewDrill.drillDiagramConfig.frames.length})
                        </h4>

                        {/* Primary slide */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Focused slide</p>
                          <div className="w-full max-w-65 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {focusedFrame ? (
                              <DrillDiagramRenderer
                                drillDiagramConfig={{
                                  schemaVersion: previewDrill.drillDiagramConfig.schemaVersion,
                                  meta: previewDrill.drillDiagramConfig.meta,
                                  frames: [focusedFrame],
                                }}
                                forceSquare
                              />
                            ) : null}
                          </div>
                        </div>

                        {/* Additional slides */}
                        {previewDrill.drillDiagramConfig.frames.length > 1 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">All slides</p>
                            <div className="grid grid-cols-4 gap-1">
                              {previewDrill.drillDiagramConfig.frames.map((frame, index) => (
                                <button
                                  type="button"
                                  key={`slide-${index}`}
                                  onClick={() => setFocusedSlideIndex(index)}
                                  className={`border rounded-md p-0.5 bg-white dark:bg-gray-800 text-left transition-colors ${
                                    focusedSlideIndex === index
                                      ? 'border-primary-500 ring-1 ring-primary-400'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                                  }`}
                                >
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 px-0.5">S{index + 1}</div>
                                  <DrillDiagramRenderer
                                    drillDiagramConfig={{
                                      schemaVersion: previewDrill.drillDiagramConfig!.schemaVersion,
                                      meta: previewDrill.drillDiagramConfig!.meta,
                                      frames: [frame],
                                    }}
                                    forceSquare
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{previewDrill.description || 'No description provided.'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Attributes</h4>
                      <div className="flex flex-wrap gap-1">
                        {previewDrill.attributes.map((attr) => (
                          <span
                            key={attr}
                            className="px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700"
                          >
                            {getAttributeLabel(attr)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePendingDrillSelection(previewDrill.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        pendingSelectedDrillIds.includes(previewDrill.id)
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {pendingSelectedDrillIds.includes(previewDrill.id) ? 'Remove from selection' : 'Select this drill'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pendingSelectedDrillIds.length} selected from {filteredAvailableDrills.length} results
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeDrillModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addSelectedDrills}
                    disabled={pendingSelectedDrillIds.length === 0}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Selected ({pendingSelectedDrillIds.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
