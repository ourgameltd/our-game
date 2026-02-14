import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/api';
import type { AgeGroupDetailDto, ClubDetailDto } from '@/api';
import { teamLevels, squadSizes, type AgeGroupLevel } from '@/data/referenceData';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@utils/routes';

const AddEditAgeGroupPage: React.FC = () => {
  const { clubId, ageGroupId } = useParams<{ clubId: string; ageGroupId?: string }>();
  const navigate = useNavigate();

  // Club state
  const [club, setClub] = useState<ClubDetailDto | null>(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [clubError, setClubError] = useState<string | null>(null);

  // Age group state (for edit mode)
  const [ageGroup, setAgeGroup] = useState<AgeGroupDetailDto | null>(null);
  const [ageGroupLoading, setAgeGroupLoading] = useState(false);
  const [ageGroupError, setAgeGroupError] = useState<string | null>(null);

  // Form initialization tracking
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Editing mode detection
  const isEditing = Boolean(ageGroupId);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: 'youth' as AgeGroupLevel,
    season: '2024/25',
    defaultSquadSize: 11,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch club and age group data
  useEffect(() => {
    if (!clubId) {
      setClubError('Club ID is required');
      setClubLoading(false);
      return;
    }

    // Fetch club
    setClubLoading(true);
    apiClient.clubs.getClubById(clubId)
      .then((response) => {
        if (response.success && response.data) {
          setClub(response.data);
          setClubError(null);
        } else {
          setClubError(response.error?.message || 'Failed to load club');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch club:', err);
        setClubError('Failed to load club from API');
      })
      .finally(() => setClubLoading(false));

    // Fetch age group (edit mode only)
    if (ageGroupId) {
      setAgeGroupLoading(true);
      apiClient.ageGroups.getById(ageGroupId)
        .then((response) => {
          if (response.success && response.data) {
            setAgeGroup(response.data);
            setAgeGroupError(null);
          } else {
            setAgeGroupError(response.error?.message || 'Failed to load age group');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch age group:', err);
          setAgeGroupError('Failed to load age group from API');
        })
        .finally(() => setAgeGroupLoading(false));
    }
  }, [clubId, ageGroupId]);

  // Hydrate form in edit mode (one-time initialization)
  useEffect(() => {
    if (isEditing && ageGroup && !isFormInitialized) {
      const normalizeLevel = (level: string): AgeGroupLevel => {
        const validLevels = ['youth', 'amateur', 'reserve', 'senior'];
        return validLevels.includes(level) ? (level as AgeGroupLevel) : 'youth';
      };

      setFormData({
        name: ageGroup.name || '',
        code: ageGroup.code || '',
        level: normalizeLevel(ageGroup.level),
        season: ageGroup.season || '2024/25',
        defaultSquadSize: ageGroup.defaultSquadSize || 11,
        description: ageGroup.description || '',
      });
      setIsFormInitialized(true);
    }
  }, [isEditing, ageGroup, isFormInitialized]);

  // Show skeleton while loading
  if (clubLoading || (isEditing && ageGroupLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="animate-pulse">
            <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Club error handling
  if (clubError || (!clubLoading && !club)) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
            Club Not Found
          </h2>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {clubError || 'The requested club could not be found.'}
          </p>
          <button
            onClick={() => navigate(Routes.dashboard())}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Age group error handling (edit mode only)
  if (isEditing && (ageGroupError || (!ageGroupLoading && !ageGroup))) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
            Age Group Not Found
          </h2>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {ageGroupError || 'The requested age group could not be found.'}
          </p>
          <button
            onClick={() => navigate(Routes.ageGroups(clubId!))}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Age Groups
          </button>
        </div>
      </div>
    );
  }

  // Cross-club mismatch check
  if (isEditing && ageGroup && ageGroup.clubId !== clubId) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
            Invalid Age Group
          </h2>
          <p className="text-red-700 dark:text-red-400 mb-4">
            This age group does not belong to the selected club.
          </p>
          <button
            onClick={() => navigate(Routes.ageGroups(clubId!))}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Age Groups
          </button>
        </div>
      </div>
    );
  }

  // Prevent editing archived age groups
  if (isEditing && !ageGroupLoading && ageGroup?.isArchived) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-2">
            Cannot Edit Archived Age Group
          </h2>
          <p className="text-orange-700 dark:text-orange-400 mb-4">
            This age group is archived. You cannot edit an archived age group. Please unarchive it first in Settings.
          </p>
          <button
            onClick={() => navigate(Routes.ageGroup(clubId!, ageGroupId!))}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Age Group
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Parse defaultSquadSize as a number
    const finalValue = name === 'defaultSquadSize' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

    if (!formData.season.trim()) {
      newErrors.season = 'Season is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clear any previous submission errors
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        clubId: clubId!,
        name: formData.name,
        code: formData.code,
        level: formData.level,
        season: formData.season,
        defaultSquadSize: formData.defaultSquadSize,
        description: formData.description || undefined,
      };

      let response;
      if (isEditing) {
        // Update existing age group
        response = await apiClient.ageGroups.update(ageGroupId!, payload);
      } else {
        // Create new age group
        response = await apiClient.ageGroups.create(payload);
      }

      if (response.success && response.data) {
        // Success - navigate to the age group overview page
        navigate(Routes.ageGroup(clubId!, response.data.id));
      } else {
        // API returned error response
        const errorMessage = response.error?.message || 'Failed to save age group';
        setSubmitError(errorMessage);

        // Check for validation errors and map them to form fields
        if (response.error?.validationErrors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(response.error.validationErrors).forEach(([field, messages]) => {
            // Take the first error message for each field
            const fieldName = field.charAt(0).toLowerCase() + field.slice(1); // Convert to camelCase
            fieldErrors[fieldName] = messages[0];
          });
          setErrors(fieldErrors);
        }
      }
    } catch (err) {
      console.error('Failed to save age group:', err);
      setSubmitError('An unexpected error occurred while saving the age group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(Routes.ageGroups(clubId!));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title={isEditing ? 'Edit Age Group' : 'Add New Age Group'}
          subtitle={`${club!.name} - ${club!.location.city}`}
        />

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Submission Error Display */}
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 dark:text-red-300">{submitError}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age Group Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g., 2014s, 2013s, Amateur, Reserves, Senior"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age Group Code *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g., 2014, amateur, reserves, senior"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-500">{errors.code}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                A short identifier for the age group (lowercase, no spaces)
              </p>
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level *
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {teamLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Youth: Under-18 teams | Amateur: Recreational adult teams | Reserve: Second team | Senior: First team
              </p>
            </div>

            {/* Season */}
            <div>
              <label htmlFor="season" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Season *
              </label>
              <input
                type="text"
                id="season"
                name="season"
                value={formData.season}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g., 2024/25"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.season ? 'border-red-500' : 'border-gray-300'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.season && (
                <p className="mt-1 text-sm text-red-500">{errors.season}</p>
              )}
            </div>

            {/* Default Squad Size */}
            <div>
              <label htmlFor="defaultSquadSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Squad Size
              </label>
              <select
                id="defaultSquadSize"
                name="defaultSquadSize"
                value={formData.defaultSquadSize}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {squadSizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Default match format for this age group. Can be changed per match.
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={3}
                placeholder="Brief description of the age group..."
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Action Buttons */}
            <FormActions
              onCancel={handleCancel}
              saveLabel={isEditing ? 'Update Age Group' : 'Create Age Group'}
              showArchive={false}
              saveDisabled={isSubmitting}
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddEditAgeGroupPage;
