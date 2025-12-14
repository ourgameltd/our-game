import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgeGroupsByClubId } from '../../data/ageGroups';
import { getAgeGroupStatistics } from '../../data/statistics';
import { sampleClubs } from '../../data/clubs';
import PageNavigation from '../../components/navigation/PageNavigation';
import { getClubNavigationTabs } from '../../utils/navigationHelpers';
import { Routes } from '@utils/routes';

const AgeGroupsListPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  
  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroups = getAgeGroupsByClubId(clubId || '').sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Club not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getClubNavigationTabs(clubId!)} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Age Groups</h2>
            <p className="text-gray-600 dark:text-gray-400">Select an age group to view teams and players</p>
          </div>
          <Link
            to={Routes.ageGroupNew(clubId!)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>+</span>
            Add Age Group
          </Link>
        </div>

        {/* Age Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ageGroups.map(ageGroup => {
            const stats = getAgeGroupStatistics(ageGroup.id);
            
            return (
              <Link
                key={ageGroup.id}
                to={Routes.ageGroup(clubId!, ageGroup.id)}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
              {/* Header with level indicator */}
              <div 
                className={`p-6 text-white ${
                  ageGroup.level === 'senior' ? 'bg-gradient-to-br from-primary-600 to-primary-800' :
                  ageGroup.level === 'reserve' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                  ageGroup.level === 'amateur' ? 'bg-gradient-to-br from-green-600 to-green-800' :
                  'bg-gradient-to-br from-purple-600 to-purple-800'
                }`}
              >
                <h2 className="text-2xl font-bold mb-1">{ageGroup.name}</h2>
                <p className="text-sm opacity-90">{ageGroup.description}</p>
              </div>

              {/* Statistics */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Goal Diff</p>
                    <p className={`text-xl font-bold ${stats.goalDifference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Win Rate</p>
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{stats.winRate}%</p>
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
