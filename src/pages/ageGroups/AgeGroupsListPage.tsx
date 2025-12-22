import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgeGroupsByClubId } from '../../data/ageGroups';
import { getAgeGroupStatistics } from '../../data/statistics';
import { sampleClubs } from '../../data/clubs';
import PageTitle from '../../components/common/PageTitle';
import { getGradientColors, getContrastTextColorClass, getPerformanceColorClass } from '../../utils/colorHelpers';
import { Routes } from '@utils/routes';

const AgeGroupsListPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [showArchived, setShowArchived] = useState(false);
  
  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroups = getAgeGroupsByClubId(clubId || '')
    .filter(ag => showArchived || !ag.isArchived)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Club not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title="Age Groups"
          subtitle="Select an age group to view teams and players"
          action={{
            label: 'Add Age Group',
            icon: 'plus',
            title: 'Add Age Group',
            onClick: () => window.location.href = Routes.ageGroupNew(clubId!),
            variant: 'success'
          }}
        />

        {/* Show Archived Checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
            />
            Show Archived Age Groups
          </label>
        </div>

        {/* Age Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ageGroups.map(ageGroup => {
            const stats = getAgeGroupStatistics(ageGroup.id);
            const { primaryColor, secondaryColor } = getGradientColors(club);
            const textColorClass = getContrastTextColorClass(primaryColor);
            
            return (
              <Link
                key={ageGroup.id}
                to={Routes.ageGroup(clubId!, ageGroup.id)}
                className={`block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden ${
                  ageGroup.isArchived ? 'opacity-75 border-2 border-orange-200 dark:border-orange-800' : ''
                }`}
              >
                {/* Header with level indicator */}
                <div 
                  className={`p-6 ${textColorClass} relative`}
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  {ageGroup.isArchived && (
                    <div className="absolute top-2 right-2">
                      <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs">
                        🗄️ Archived
                      </span>
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-1">
                    {ageGroup.name}
                  </h2>
                  <p className="text-sm opacity-90">{ageGroup.description}</p>
                </div>

                {/* Statistics */}
                <div className="p-6">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Goal Diff</p>
                    <p className={`text-xl font-bold ${getPerformanceColorClass(stats.goalDifference, 'goalDifference')}`}>
                      {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Win Rate</p>
                    <p className={`text-xl font-bold ${getPerformanceColorClass(stats.winRate, 'winRate')}`}>{stats.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Players</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.playerCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Matches</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.matchesPlayed}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-green-600 dark:text-green-400">{stats.wins}W</span>
                    <span className="mx-2">-</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">{stats.draws}D</span>
                    <span className="mx-2">-</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{stats.losses}L</span>
                  </div>
                  <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    View Details →
                  </span>
                </div>
              </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {ageGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No age groups found for this club</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgeGroupsListPage;
