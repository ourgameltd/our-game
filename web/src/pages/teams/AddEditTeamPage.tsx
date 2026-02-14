import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamLevels, TeamLevel } from '@/constants/referenceData';
import { useClubById, useAgeGroupById, useTeamOverview, useCreateTeam, useUpdateTeam } from '@/api/hooks';
import { CreateTeamRequest, UpdateTeamRequest } from '@/api/client';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@utils/routes';

const AddEditTeamPage: React.FC = () => {
  const { clubId, ageGroupId, teamId } = useParams<{ clubId: string; ageGroupId: string; teamId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!teamId;

  // API data hooks
  const { data: club, isLoading: clubLoading, error: clubError } = useClubById(clubId);
  const { data: ageGroup, isLoading: ageGroupLoading, error: ageGroupError } = useAgeGroupById(ageGroupId);
  const { data: overview, isLoading: teamLoading } = useTeamOverview(isEditing ? teamId : undefined);

  // Mutation hooks
  const { createTeam, isSubmitting: isCreating, error: createError } = useCreateTeam();
  const { updateTeam, isSubmitting: isUpdating, error: updateError } = useUpdateTeam(teamId || '');

  const isLoading = clubLoading || ageGroupLoading || (isEditing && teamLoading);
  const existingTeam = overview?.team;

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    level: 'youth' as TeamLevel,
    season: '',
    primaryColor: '#DC2626',
    secondaryColor: '#FFFFFF',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form from API data once loaded
  useEffect(() => {
    if (isInitialized) return;

    if (isEditing && existingTeam) {
      setFormData({
        name: existingTeam.name || '',
        shortName: existingTeam.shortName || '',
        level: (existingTeam.level || 'youth') as TeamLevel,
        season: existingTeam.season || '',
        primaryColor: existingTeam.colors?.primary || '#DC2626',
        secondaryColor: existingTeam.colors?.secondary || '#FFFFFF',
      });
      setIsInitialized(true);
    } else if (!isEditing && club && ageGroup) {
      setFormData(prev => ({
        ...prev,
        level: (ageGroup.level || 'youth') as TeamLevel,
        season: ageGroup.season || '',
        primaryColor: club.colors?.primary || '#DC2626',
        secondaryColor: club.colors?.secondary || '#FFFFFF',
      }));
      setIsInitialized(true);
    }
  }, [isEditing, existingTeam, club, ageGroup, isInitialized]);

  // Map validation errors from API to form fields
  useEffect(() => {
    const apiError = createError || updateError;
    if (!apiError?.validationErrors) return;

    const fieldMap: Record<string, string> = {
      Name: 'name',
      ShortName: 'shortName',
      Level: 'level',
      Season: 'season',
      PrimaryColor: 'primaryColor',
      SecondaryColor: 'secondaryColor',
    };

    const mapped: Record<string, string> = {};
    for (const [serverField, messages] of Object.entries(apiError.validationErrors)) {
      const formField = fieldMap[serverField] || serverField.charAt(0).toLowerCase() + serverField.slice(1);
      mapped[formField] = messages[0] || 'Invalid value';
    }
    setErrors(prev => ({ ...prev, ...mapped }));
  }, [createError, updateError]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error states for missing data
  if (clubError && !clubLoading) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Club Not Found</h2>
          <p className="text-red-700 dark:text-red-400 mb-4">The requested club could not be found.</p>
          <button
            onClick={() => navigate(Routes.dashboard())}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (ageGroupError && !ageGroupLoading) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Age Group Not Found</h2>
          <p className="text-red-700 dark:text-red-400 mb-4">The requested age group could not be found.</p>
          <button
            onClick={() => navigate(Routes.club(clubId!))}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Return to Club
          </button>
        </div>
      </div>
    );
  }

  if (!club || !ageGroup) {
    return (
      <div className="mx-auto px-4 py-8">
        <p className="text-red-500">{!club ? 'Club not found' : 'Age group not found'}</p>
      </div>
    );
  }

  // Prevent adding teams to archived age groups
  if (!isEditing && ageGroup.isArchived) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-2">
            Cannot Add Team
          </h2>
          <p className="text-orange-700 dark:text-orange-400 mb-4">
            This age group is archived. You cannot add new teams to an archived age group. Please unarchive the age group first.
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
  
  // Prevent editing archived teams
  if (isEditing && existingTeam?.isArchived) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-2">
            Cannot Edit Archived Team
          </h2>
          <p className="text-orange-700 dark:text-orange-400 mb-4">
            This team is archived. You cannot edit an archived team. Please unarchive the team first in Settings.
          </p>
          <button
            onClick={() => navigate(Routes.team(clubId!, ageGroupId!, teamId!))}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Team
          </button>
        </div>
      </div>
    );
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    if (!formData.season.trim()) {
      newErrors.season = 'Season is required';
    }
    
    // Validate hex color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(formData.primaryColor)) {
      newErrors.primaryColor = 'Invalid color format (use #RRGGBB)';
    }
    
    if (!hexColorRegex.test(formData.secondaryColor)) {
      newErrors.secondaryColor = 'Invalid color format (use #RRGGBB)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditing) {
        const request: UpdateTeamRequest = {
          name: formData.name.trim(),
          shortName: formData.shortName.trim() || undefined,
          level: formData.level,
          season: formData.season.trim(),
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        };
        await updateTeam(request);
      } else {
        const request: CreateTeamRequest = {
          clubId: clubId!,
          ageGroupId: ageGroupId!,
          name: formData.name.trim(),
          shortName: formData.shortName.trim() || undefined,
          level: formData.level,
          season: formData.season.trim(),
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        };
        await createTeam(request);
      }

      // Navigate back on success (errors are handled by the useEffect above)
      navigate(Routes.ageGroup(clubId!, ageGroupId!));
    } catch {
      // Errors are captured by mutation hooks and mapped via useEffect
    }
  };
  
  const handleCancel = () => {
    navigate(Routes.ageGroup(clubId!, ageGroupId!));
  };

  const mutationError = createError || updateError;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title={isEditing ? 'Edit Team' : 'Add New Team'}
          subtitle={`${club.name} - ${ageGroup.name}`}
        />

        {/* API Error Banner */}
        {mutationError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 font-medium">
              {mutationError.message}
            </p>
          </div>
        )}
        
        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Reds, Blues, Whites, Greens"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            {/* Short Name */}
            <div>
              <label htmlFor="shortName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short Name
              </label>
              <input
                type="text"
                id="shortName"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                placeholder="e.g., RDS, BLS, WTS"
                maxLength={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                3-letter abbreviation for the team (optional)
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {teamLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Defaults to the age group level: {ageGroup.level}
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
                placeholder="e.g., 2024/25"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.season ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.season && (
                <p className="mt-1 text-sm text-red-500">{errors.season}</p>
              )}
            </div>
            
            {/* Team Colors */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Colors</h3>
              
              {/* Primary Color */}
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color *
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#DC2626"
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.primaryColor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.primaryColor && (
                  <p className="mt-1 text-sm text-red-500">{errors.primaryColor}</p>
                )}
                
              </div>
              
              {/* Secondary Color */}
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color *
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#FFFFFF"
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.secondaryColor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.secondaryColor && (
                  <p className="mt-1 text-sm text-red-500">{errors.secondaryColor}</p>
                )}
              </div>
              
              {/* Color Preview */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
                <div 
                  className="w-full h-16 rounded-lg flex items-center justify-center text-lg font-bold border-2"
                  style={{ 
                    backgroundColor: formData.primaryColor,
                    color: formData.secondaryColor,
                    borderColor: formData.secondaryColor 
                  }}
                >
                  {formData.name || 'Team Name'}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <FormActions
              onCancel={handleCancel}
              saveLabel={
                isEditing
                  ? (isUpdating ? 'Updating...' : 'Update Team')
                  : (isCreating ? 'Creating...' : 'Create Team')
              }
              saveDisabled={isCreating || isUpdating || isLoading}
              showArchive={false}
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddEditTeamPage;
