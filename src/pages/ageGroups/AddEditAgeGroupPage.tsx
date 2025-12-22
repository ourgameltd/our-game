import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgeGroupById } from '../../data/ageGroups';
import { sampleClubs } from '../../data/clubs';
import { teamLevels, squadSizes, type AgeGroupLevel } from '@/data/referenceData';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@utils/routes';

const AddEditAgeGroupPage: React.FC = () => {
  const { clubId, ageGroupId } = useParams<{ clubId: string; ageGroupId?: string }>();
  const navigate = useNavigate();
  
  const club = sampleClubs.find(c => c.id === clubId);
  const existingAgeGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;
  const isEditing = !!existingAgeGroup;
  
  const [formData, setFormData] = useState({
    name: existingAgeGroup?.name || '',
    code: existingAgeGroup?.code || '',
    level: (existingAgeGroup?.level || 'youth') as AgeGroupLevel,
    season: existingAgeGroup?.season || '2024/25',
    defaultSquadSize: existingAgeGroup?.defaultSquadSize || 11,
    description: existingAgeGroup?.description || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Club not found</p>
      </div>
    );
  }
  
  // Prevent editing archived age groups
  if (isEditing && existingAgeGroup?.isArchived) {
    return (
      <div className="container mx-auto px-4 py-8">
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // In a real application, this would make an API call to save the age group
    console.log(isEditing ? 'Updating age group:' : 'Creating age group:', formData);
    
    // Show success message (in a real app, this would be a toast notification)
    alert(`Age group ${isEditing ? 'updated' : 'created'} successfully!`);
    
    // Navigate back to age groups list
    navigate(Routes.ageGroups(clubId!));
  };
  
  const handleCancel = () => {
    navigate(Routes.ageGroups(clubId!));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title={isEditing ? 'Edit Age Group' : 'Add New Age Group'}
          subtitle={`${club.name} - ${club.location.city}`}
        />
        
        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="e.g., 2014s, 2013s, Amateur, Reserves, Senior"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
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
                placeholder="e.g., 2014, amateur, reserves, senior"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                placeholder="e.g., 2024/25"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.season ? 'border-red-500' : 'border-gray-300'
                }`}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                rows={3}
                placeholder="Brief description of the age group..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Action Buttons */}
            <FormActions
              onCancel={handleCancel}
              saveLabel={isEditing ? 'Update Age Group' : 'Create Age Group'}
              showArchive={false}
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddEditAgeGroupPage;
