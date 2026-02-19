import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgeGroupById, useUpdateAgeGroup } from '@/api';
import type { UpdateAgeGroupRequest } from '@/api';
import { teamLevels, squadSizes, type AgeGroupLevel } from '@/constants/referenceData';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@/utils/routes';

export default function AgeGroupSettingsPage() {
  const { clubId, ageGroupId } = useParams();
  const navigate = useNavigate();

  // API data fetching
  const { data: ageGroup, isLoading, error: loadError } = useAgeGroupById(ageGroupId);
  const { updateAgeGroup, isSubmitting, data: updatedData, error: updateError } = useUpdateAgeGroup(ageGroupId!);

  // Form initialization tracking
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: 'youth' as AgeGroupLevel,
    season: '',
    defaultSquadSize: 11,
    description: '',
  });

  const [seasons, setSeasons] = useState<string[]>([]);
  const [defaultSeason, setDefaultSeason] = useState<string>('');
  const [newSeasonInput, setNewSeasonInput] = useState('');

  // Validation & submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hydrate form once when age group data loads
  useEffect(() => {
    if (ageGroup && !isFormInitialized) {
      const normalizeLevel = (level: string): AgeGroupLevel => {
        const validLevels = ['youth', 'amateur', 'reserve', 'senior'];
        return validLevels.includes(level) ? (level as AgeGroupLevel) : 'youth';
      };

      setFormData({
        name: ageGroup.name || '',
        code: ageGroup.code || '',
        level: normalizeLevel(ageGroup.level),
        season: ageGroup.season || '',
        defaultSquadSize: ageGroup.defaultSquadSize || 11,
        description: ageGroup.description || '',
      });
      setSeasons(ageGroup.seasons?.length ? [...ageGroup.seasons] : [ageGroup.season || '2024/25']);
      setDefaultSeason(ageGroup.defaultSeason || ageGroup.seasons?.[0] || ageGroup.season || '2024/25');
      setIsFormInitialized(true);
    }
  }, [ageGroup, isFormInitialized]);

  // Handle update success
  useEffect(() => {
    if (updatedData) {
      setSuccessMessage('Age group settings updated successfully!');
      // Clear success message after a few seconds
      const timeout = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [updatedData]);

  // Handle update errors
  useEffect(() => {
    if (updateError) {
      setSubmitError(updateError.message);
      if (updateError.validationErrors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(updateError.validationErrors).forEach(([field, messages]) => {
          const fieldName = field.charAt(0).toLowerCase() + field.slice(1);
          fieldErrors[fieldName] = messages[0];
        });
        setErrors(fieldErrors);
      }
    }
  }, [updateError]);

  // Missing ageGroupId — render error state
  if (!ageGroupId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
              Missing Age Group ID
            </h2>
            <p className="text-red-700 dark:text-red-400 mb-4">
              No age group ID was provided in the URL.
            </p>
            <button
              onClick={() => navigate(Routes.dashboard())}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // API load error
  if (!isLoading && (loadError || !ageGroup)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
              Age Group Not Found
            </h2>
            <p className="text-red-700 dark:text-red-400 mb-4">
              {loadError?.message || 'The requested age group could not be found.'}
            </p>
            <button
              onClick={() => clubId ? navigate(Routes.ageGroups(clubId)) : navigate(Routes.dashboard())}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Determine disabled state — archived or still loading
  const isDisabled = isLoading || isSubmitting || !!ageGroup?.isArchived;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const finalValue = name === 'defaultSquadSize' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSeason = () => {
    if (!newSeasonInput.trim()) return;
    if (seasons.includes(newSeasonInput.trim())) {
      setErrors(prev => ({ ...prev, seasons: 'This season already exists' }));
      return;
    }
    const newSeasons = [...seasons, newSeasonInput.trim()];
    setSeasons(newSeasons);
    if (newSeasons.length === 1) {
      setDefaultSeason(newSeasonInput.trim());
    }
    setNewSeasonInput('');
    if (errors.seasons) {
      setErrors(prev => ({ ...prev, seasons: '' }));
    }
  };

  const handleRemoveSeason = (seasonToRemove: string) => {
    if (seasons.length === 1) {
      setErrors(prev => ({ ...prev, seasons: 'Cannot remove the last season. At least one season is required.' }));
      return;
    }
    const newSeasons = seasons.filter(s => s !== seasonToRemove);
    setSeasons(newSeasons);
    if (defaultSeason === seasonToRemove) {
      setDefaultSeason(newSeasons[0]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Age group name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Age group code is required';
    }
    if (seasons.length === 0) {
      newErrors.seasons = 'At least one season is required';
    }
    // Check for duplicate seasons
    const uniqueSeasons = new Set(seasons);
    if (uniqueSeasons.size !== seasons.length) {
      newErrors.seasons = 'Seasons must be unique';
    }
    // Check for empty season strings
    if (seasons.some(s => !s.trim())) {
      newErrors.seasons = 'Season names cannot be empty';
    }
    if (defaultSeason && !seasons.includes(defaultSeason)) {
      newErrors.defaultSeason = 'Default season must be one of the listed seasons';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitError(null);
    setSuccessMessage(null);

    const payload: UpdateAgeGroupRequest = {
      clubId: ageGroup!.clubId,
      name: formData.name,
      code: formData.code,
      level: formData.level,
      season: ageGroup!.season, // Settings page doesn't edit current season
      seasons,
      defaultSeason,
      defaultSquadSize: formData.defaultSquadSize,
      description: formData.description || undefined,
    };

    await updateAgeGroup(payload);
  };

  const handleCancel = () => {
    navigate(Routes.ageGroup(clubId!, ageGroupId!));
  };

  const handleArchive = () => {
    const isCurrentlyArchived = ageGroup?.isArchived;
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    const actionPast = isCurrentlyArchived ? 'unarchived' : 'archived';
    
    if (confirm(`Are you sure you want to ${action} this age group? ${isCurrentlyArchived ? 'This will make it active again.' : 'This will lock the age group and prevent modifications.'}`)) {
      alert(`Age group ${actionPast} successfully! (Demo - not saved to backend)`);
      navigate(Routes.ageGroup(clubId!, ageGroupId!));
    }
  };

  // Skeleton placeholder for a form field
  const FieldSkeleton = ({ wide = false }: { wide?: boolean }) => (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className={`h-10 ${wide ? 'w-full' : 'w-full'} bg-gray-200 dark:bg-gray-700 rounded`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title="Age Group Settings"
          subtitle="Manage age group details and configuration"
          badge={ageGroup?.isArchived ? "🗄️ Archived" : undefined}
        />

        {/* Archived banner */}
        {ageGroup?.isArchived && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This age group is archived. You cannot modify its settings while it is archived. Unarchive it to make changes.
            </p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Submit error banner */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{submitError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                <FieldSkeleton />
                <FieldSkeleton />
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
            ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age Group Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isDisabled}
                  placeholder="e.g., 2014s, Reserves, Senior"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  disabled={isDisabled}
                  placeholder="e.g., 2014, reserve, senior"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  disabled={isDisabled}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {teamLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Squad Size
                </label>
                <select
                  name="defaultSquadSize"
                  value={formData.defaultSquadSize}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {squadSizes.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Default match format for this age group
                </p>
              </div>

            </div>
            )}

            {/* Seasons Management */}
            <div className="mt-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seasons</h4>

              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ) : (
              <>
              {/* Add Season */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSeasonInput}
                  onChange={(e) => setNewSeasonInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSeason())}
                  disabled={isDisabled}
                  placeholder="e.g., 2024/25"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleAddSeason}
                  disabled={isDisabled}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Add Season"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {errors.seasons && <p className="mb-2 text-sm text-red-500">{errors.seasons}</p>}
              {errors.defaultSeason && <p className="mb-2 text-sm text-red-500">{errors.defaultSeason}</p>}

              {/* Season List */}
              <div className="space-y-2">
                {seasons.map((season) => (
                  <div
                    key={season}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                      season === defaultSeason
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">{season}</span>
                      {season === defaultSeason && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">Default</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {season !== defaultSeason && (
                        <button
                          type="button"
                          onClick={() => setDefaultSeason(season)}
                          disabled={isDisabled}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSeason(season)}
                        disabled={isDisabled || seasons.length === 1}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              </>
              )}
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ) : (
              <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                disabled={isDisabled}
                placeholder="Brief description of this age group..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              </>
              )}
            </div>
          </div>


          {/* Action Buttons */}
          <FormActions
            isArchived={ageGroup?.isArchived}
            onArchive={handleArchive}
            onCancel={handleCancel}
            saveDisabled={isDisabled}
          />
        </form>
      </main>
    </div>
  );
}
