import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgeGroupById } from '@/data/ageGroups';
import { teamLevels, squadSizes } from '@/data/referenceData';
import PageTitle from '@/components/common/PageTitle';
import FormActions from '@/components/common/FormActions';
import { Routes } from '@/utils/routes';

export default function AgeGroupSettingsPage() {
  const { clubId, ageGroupId } = useParams();
  const navigate = useNavigate();
  const ageGroup = getAgeGroupById(ageGroupId!);

  const [formData, setFormData] = useState({
    name: ageGroup?.name || '',
    code: ageGroup?.code || '',
    level: ageGroup?.level || 'youth',
    season: ageGroup?.season || '2024/25',
    defaultSquadSize: ageGroup?.defaultSquadSize || 11,
    description: ageGroup?.description || ''
  });

  const [seasons, setSeasons] = useState<string[]>(ageGroup?.seasons || ['2024/25']);
  const [defaultSeason, setDefaultSeason] = useState<string>(ageGroup?.defaultSeason || ageGroup?.seasons?.[0] || '2024/25');
  const [newSeasonInput, setNewSeasonInput] = useState('');

  if (!ageGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Age group not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Parse defaultSquadSize as a number
    const finalValue = name === 'defaultSquadSize' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAddSeason = () => {
    if (!newSeasonInput.trim()) return;
    if (seasons.includes(newSeasonInput.trim())) {
      alert('This season already exists');
      return;
    }
    const newSeasons = [...seasons, newSeasonInput.trim()];
    setSeasons(newSeasons);
    if (newSeasons.length === 1) {
      setDefaultSeason(newSeasonInput.trim());
    }
    setNewSeasonInput('');
  };

  const handleRemoveSeason = (seasonToRemove: string) => {
    if (seasons.length === 1) {
      alert('Cannot remove the last season. At least one season is required.');
      return;
    }
    const newSeasons = seasons.filter(s => s !== seasonToRemove);
    setSeasons(newSeasons);
    if (defaultSeason === seasonToRemove) {
      setDefaultSeason(newSeasons[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would save to the backend
    alert('Age group settings updated successfully! (Demo - not saved to backend)');
    navigate(Routes.ageGroup(clubId!, ageGroupId!));
  };

  const handleCancel = () => {
    navigate(Routes.ageGroup(clubId!, ageGroupId!));
  };

  const handleArchive = () => {
    const isCurrentlyArchived = ageGroup.isArchived;
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    const actionPast = isCurrentlyArchived ? 'unarchived' : 'archived';
    
    if (confirm(`Are you sure you want to ${action} this age group? ${isCurrentlyArchived ? 'This will make it active again.' : 'This will lock the age group and prevent modifications.'}`)) {
      alert(`Age group ${actionPast} successfully! (Demo - not saved to backend)`);
      navigate(Routes.ageGroup(clubId!, ageGroupId!));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title="Age Group Settings"
          subtitle="Manage age group details and configuration"
          badge={ageGroup.isArchived ? "🗄️ Archived" : undefined}
        />
        {ageGroup.isArchived && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This age group is archived. You cannot modify its settings while it is archived. Unarchive it to make changes.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            
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
                  disabled={ageGroup.isArchived}
                  placeholder="e.g., 2014s, Reserves, Senior"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
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
                  disabled={ageGroup.isArchived}
                  placeholder="e.g., 2014, reserve, senior"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
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
                  disabled={ageGroup.isArchived}
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
                  disabled={ageGroup.isArchived}
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

            {/* Seasons Management */}
            <div className="mt-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seasons</h4>
              
              {/* Add Season */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSeasonInput}
                  onChange={(e) => setNewSeasonInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSeason())}
                  disabled={ageGroup.isArchived}
                  placeholder="e.g., 2024/25"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleAddSeason}
                  disabled={ageGroup.isArchived}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Add Season"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

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
                          disabled={ageGroup.isArchived}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSeason(season)}
                        disabled={ageGroup.isArchived || seasons.length === 1}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                disabled={ageGroup.isArchived}
                placeholder="Brief description of this age group..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>


          {/* Action Buttons */}
          <FormActions
            isArchived={ageGroup.isArchived}
            onArchive={handleArchive}
            onCancel={handleCancel}
            saveDisabled={ageGroup.isArchived}
          />
        </form>
      </main>
    </div>
  );
}
