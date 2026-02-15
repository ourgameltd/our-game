import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { 
  useDrillTemplateById, 
  useDrillsByScope, 
  useClubById,
  useCreateDrillTemplate,
  useUpdateDrillTemplate
} from '@/api/hooks';
import type { DrillListDto, CreateDrillTemplateRequest, UpdateDrillTemplateRequest } from '@/api';
import { getAttributeLabel } from '@/constants/referenceData';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import FormActions from '@components/common/FormActions';

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
  const [showDrillPicker, setShowDrillPicker] = useState(false);

  // Initialize form when template loads
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setSelectedDrillIds(template.drillIds);
      setIsPublic(template.isPublic);
    }
  }, [template]);

  // Initialize form when template loads
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setSelectedDrillIds(template.drillIds);
      setIsPublic(template.isPublic);
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
    const categories = drills.map(d => d.category);
    const categoryCounts: Record<string, number> = {};
    categories.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    let category: 'technical' | 'tactical' | 'physical' | 'mental' | 'mixed' = 'mixed';
    if (Object.keys(categoryCounts).length === 1) {
      category = Object.keys(categoryCounts)[0] as any;
    } else if (Object.keys(categoryCounts).length > 1) {
      category = 'mixed';
    }
    
    return { totalDuration, attributes, category };
  };

  const { totalDuration, attributes, category } = getAggregatedData();

  const addDrill = (drillId: string) => {
    if (!selectedDrillIds.includes(drillId)) {
      setSelectedDrillIds([...selectedDrillIds, drillId]);
    }
    setShowDrillPicker(false);
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
    switch (cat) {
      case 'technical': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'tactical': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'physical': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'mental': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'mixed': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
        description: description.trim(),
        drillIds: selectedDrillIds,
        isPublic
      };
      
      updateMutation.mutate(updateRequest).then(() => {
        if (updateMutation.data) {
          // Navigate back on success
          navigateBack();
        }
      });
    } else {
      // Create new template
      const createRequest: CreateDrillTemplateRequest = {
        name: name.trim(),
        description: description.trim(),
        drillIds: selectedDrillIds,
        isPublic,
        scope: {
          clubId,
          ageGroupId,
          teamId
        }
      };
      
      createMutation.mutate(createRequest).then(() => {
        if (createMutation.data) {
          // Navigate back on success
          navigateBack();
        }
      });
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

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
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
  const isSubmitting = createMutation.isSubmitting || updateMutation.isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <PageTitle
            title={isEditMode ? (isInherited ? 'View Session (Read-Only)' : 'Edit Session') : 'Create Session'}
            subtitle={`${contextName}`}
          />
        </div>

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
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800 dark:text-red-300">
                        {templateError.message || 'Failed to load session template'}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
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
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the session objectives"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isInherited || isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Drills */}
            {isLoadingDrills ? (
              <DrillsSkeleton />
            ) : (
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Drills *</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add drills to your session. You can reorder them by dragging or using the arrow buttons.
                </p>

                {drillsError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
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
                              {drill.category}
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
                            className="text-red-600 hover:text-red-700 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Drill Button */}
              {!isInherited && !drillsError && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowDrillPicker(!showDrillPicker)}
                    disabled={isSubmitting}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Drill
                  </button>

                  {/* Drill Picker */}
                  {showDrillPicker && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <h4 className="font-medium mb-3">Select a drill to add:</h4>
                      <div className="space-y-2">
                        {availableDrills
                          .filter(drill => !selectedDrillIds.includes(drill.id))
                          .map(drill => (
                            <button
                              key={drill.id}
                              type="button"
                              onClick={() => addDrill(drill.id)}
                              className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  {drill.name}
                                </h5>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(drill.category)}`}>
                                  {drill.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                {drill.description}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>⏱️ {drill.duration || 0}m</span>
                                <span>🎯 {drill.attributes.length} attributes</span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
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

            {/* Sharing */}
            {!isInherited && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Sharing</h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    disabled={isSubmitting}
                    className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Share this session template with other teams in the club
                  </span>
                </label>
              </div>
            )}

            {/* Form Actions */}
            {!isInherited && (
              <FormActions
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
    </div>
  );
}
