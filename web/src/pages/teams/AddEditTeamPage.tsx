import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgeGroupById } from '../../data/ageGroups';
import { getTeamById } from '../../data/teams';
import { sampleClubs } from '../../data/clubs';
import { teamLevels, TeamLevel } from '@/data/referenceData';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@utils/routes';

const AddEditTeamPage: React.FC = () => {
  const { clubId, ageGroupId, teamId } = useParams<{ clubId: string; ageGroupId: string; teamId?: string }>();
  const navigate = useNavigate();
  
  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroup = getAgeGroupById(ageGroupId || '');
  const existingTeam = teamId ? getTeamById(teamId) : null;
  const isEditing = !!existingTeam;
  
  const [formData, setFormData] = useState({
    name: existingTeam?.name || '',
    shortName: existingTeam?.shortName || '',
    level: (existingTeam?.level || ageGroup?.level || 'youth') as TeamLevel,
    season: existingTeam?.season || ageGroup?.season || '2024/25',
    primaryColor: existingTeam?.colors?.primary || club?.colors.primary || '#DC2626',
    secondaryColor: existingTeam?.colors?.secondary || club?.colors.secondary || '#FFFFFF',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // In a real application, this would make an API call to save the team
    console.log(isEditing ? 'Updating team:' : 'Creating team:', {
      ...formData,
      clubId,
      ageGroupId,
    });
    
    // Show success message (in a real app, this would be a toast notification)
    alert(`Team ${isEditing ? 'updated' : 'created'} successfully!`);
    
    // Navigate back to age group overview
    navigate(Routes.ageGroup(clubId!, ageGroupId!));
  };
  
  const handleCancel = () => {
    navigate(Routes.ageGroup(clubId!, ageGroupId!));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title={isEditing ? 'Edit Team' : 'Add New Team'}
          subtitle={`${club.name} - ${ageGroup.name}`}
        />
        
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
              saveLabel={isEditing ? 'Update Team' : 'Create Team'}
              showArchive={false}
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddEditTeamPage;
