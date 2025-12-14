import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeamById } from '@/data/teams';
import PageNavigation from '@/components/navigation/PageNavigation';
import { getTeamNavigationTabs } from '@/utils/navigationHelpers';
import { Routes } from '@/utils/routes';

export default function TeamSettingsPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  const team = getTeamById(teamId!);

  const [formData, setFormData] = useState({
    name: team?.name || '',
    shortName: team?.shortName || '',
    level: team?.level || 'youth',
    season: team?.season || '2024/25',
    primaryColor: team?.colors?.primary || '#1a472a',
    secondaryColor: team?.colors?.secondary || '#ffffff'
  });

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would save to the backend
    alert('Team settings updated successfully! (Demo - not saved to backend)');
    navigate(Routes.team(clubId!, ageGroupId!, teamId!));
  };

  const handleCancel = () => {
    navigate(Routes.team(clubId!, ageGroupId!, teamId!));
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      alert('Team deleted successfully! (Demo - not saved to backend)');
      navigate(Routes.teams(clubId!, ageGroupId!));
    }
  };

  const handleArchive = () => {
    const isCurrentlyArchived = team.isArchived;
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    const actionPast = isCurrentlyArchived ? 'unarchived' : 'archived';
    
    if (confirm(`Are you sure you want to ${action} this team? ${isCurrentlyArchived ? 'This will make it active again.' : 'This will lock the team and prevent modifications.'}`)) {
      alert(`Team ${actionPast} successfully! (Demo - not saved to backend)`);
      navigate(Routes.team(clubId!, ageGroupId!, teamId!));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageNavigation tabs={getTeamNavigationTabs(clubId!, ageGroupId!, teamId!)} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Settings
            </h2>
            {team.isArchived && (
              <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                🗄️ Archived
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage team details and configuration
          </p>
          {team.isArchived && (
            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                ⚠️ This team is archived. You cannot modify its settings while it is archived. Unarchive it to make changes.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={team.isArchived}
                  placeholder="e.g., Reds, Blues, Whites"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Name
                </label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleInputChange}
                  placeholder="e.g., RDS, BLS, WTS"
                  maxLength={3}
                  disabled={team.isArchived}
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
                  disabled={team.isArchived}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="youth">Youth</option>
                  <option value="amateur">Amateur</option>
                  <option value="reserve">Reserve</option>
                  <option value="senior">Senior</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Season *
                </label>
                <input
                  type="text"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  required
                  disabled={team.isArchived}
                  placeholder="e.g., 2024/25"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Team Colors */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Team Colors
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              These colors will be used for team identification in listings and may influence kit designs.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color *
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    disabled={team.isArchived}
                    className="h-10 w-20 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    disabled={team.isArchived}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color *
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    disabled={team.isArchived}
                    className="h-10 w-20 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    disabled={team.isArchived}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Preview</p>
              <div className="flex gap-2">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: formData.primaryColor }}
                />
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: formData.secondaryColor }}
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  About Teams
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Teams are groups of players within an age group. Multiple teams can exist in the same 
                  age group (e.g., Reds, Blues, Whites). Teams can have their own kits, coaches, and compete 
                  in different leagues or competitions.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleArchive}
                className={`px-6 py-2 ${
                  team.isArchived
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white rounded-lg transition-colors`}
              >
                {team.isArchived ? '📂 Unarchive Team' : '🗄️ Archive Team'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Team
              </button>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={team.isArchived}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
