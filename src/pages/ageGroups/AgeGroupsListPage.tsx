import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgeGroupsByClubId } from '../../data/ageGroups';
import { getAgeGroupStatistics } from '../../data/statistics';
import { sampleClubs } from '../../data/clubs';
import { getTeamsByAgeGroupId } from '../../data/teams';
import PageTitle from '../../components/common/PageTitle';
import AgeGroupListCard from '../../components/ageGroup/AgeGroupListCard';
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

        {/* Age Groups List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
          {ageGroups.map(ageGroup => {
            const stats = getAgeGroupStatistics(ageGroup.id);
            const teams = getTeamsByAgeGroupId(ageGroup.id);
            
            return (
              <Link
                key={ageGroup.id}
                to={Routes.ageGroup(clubId!, ageGroup.id)}
                className="block"
              >
                <AgeGroupListCard
                  ageGroup={ageGroup}
                  club={club}
                  stats={{
                    teamCount: teams.length,
                    playerCount: stats.playerCount,
                    matchesPlayed: stats.matchesPlayed,
                    wins: stats.wins,
                    draws: stats.draws,
                    losses: stats.losses,
                    winRate: stats.winRate,
                    goalDifference: stats.goalDifference
                  }}
                  badges={ageGroup.isArchived ? (
                    <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      🗄️ Archived
                    </span>
                  ) : undefined}
                />
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
