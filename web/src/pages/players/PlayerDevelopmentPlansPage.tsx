import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { getPlayerById } from '@data/players';
import { getDevelopmentPlansByPlayerId } from '@data/developmentPlans';
import { getAgeGroupById } from '@data/ageGroups';
import { getTeamById } from '@data/teams';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import DevelopmentPlanListCard from '@components/player/DevelopmentPlanListCard';
import DevelopmentPlanTableRow from '@components/player/DevelopmentPlanTableRow';
import { Filter, Target } from 'lucide-react';

export default function PlayerDevelopmentPlansPage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const [sortBy, setSortBy] = useState<'date' | 'progress'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  
  const player = getPlayerById(playerId!);
  const plans = playerId ? getDevelopmentPlansByPlayerId(playerId) : [];
  const ageGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;
  const team = teamId ? getTeamById(teamId) : null;

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Player not found</h2>
          </div>
        </main>
      </div>
    );
  }

  // Determine back link based on context (team, age group, or club)
  let backLink: string;
  let subtitle: string;
  let newDevelopmentPlanLink: string;
  if (teamId && ageGroupId) {
    backLink = Routes.teamPlayer(clubId!, ageGroupId, teamId, playerId!);
    subtitle = `${ageGroup?.name || 'Age Group'} • ${team?.name || 'Team'}`;
    newDevelopmentPlanLink = Routes.newTeamPlayerDevelopmentPlan(clubId!, ageGroupId, teamId, playerId!);
  } else if (ageGroupId) {
    backLink = Routes.player(clubId!, ageGroupId, playerId!);
    subtitle = ageGroup?.name || 'Age Group';
    newDevelopmentPlanLink = Routes.newPlayerDevelopmentPlan(clubId!, ageGroupId, playerId!);
  } else {
    backLink = Routes.clubPlayers(clubId!);
    subtitle = 'Club Players';
    newDevelopmentPlanLink = '#';
  }

  // Filter plans
  let filteredPlans = [...plans];
  if (filterStatus !== 'all') {
    filteredPlans = filteredPlans.filter(plan => plan.status === filterStatus);
  }

  // Sort plans
  if (sortBy === 'progress') {
    filteredPlans.sort((a, b) => {
      const aProgress = a.goals.reduce((sum, g) => sum + g.progress, 0) / a.goals.length;
      const bProgress = b.goals.reduce((sum, g) => sum + g.progress, 0) / b.goals.length;
      return bProgress - aProgress;
    });
  }

  // Helper to generate development plan link
  const getDevelopmentPlanLink = () => {
    if (teamId && ageGroupId) {
      return Routes.teamPlayerDevelopmentPlan(clubId!, ageGroupId, teamId, playerId!);
    } else if (ageGroupId) {
      return Routes.playerDevelopmentPlan(clubId!, ageGroupId, playerId!);
    }
    return '#';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title="Development Plans"
          subtitle={`${player.firstName} ${player.lastName} • ${subtitle}`}
          backLink={backLink}
          action={{
            label: 'New Development Plan',
            href: newDevelopmentPlanLink,
            icon: 'plus',
            variant: 'success'
          }}
        />

        {/* Filters */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'progress')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="date">Most Recent</option>
                <option value="progress">Highest Progress</option>
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter Plans
              </label>
              <select
                id="filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed' | 'archived')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Plans</option>
                <option value="active">Active Plans</option>
                <option value="completed">Completed Plans</option>
                <option value="archived">Archived Plans</option>
              </select>
            </div>
          </div>
        </div>

        {/* Development Plans List */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <Target className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Development Plans Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filterStatus !== 'all' 
                ? `No ${filterStatus} development plans match the selected filter.`
                : 'No development plans have been created yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredPlans.map(plan => (
                <DevelopmentPlanListCard
                  key={plan.id}
                  plan={plan}
                  player={player}
                  linkTo={getDevelopmentPlanLink()}
                />
              ))}
            </div>

            {/* Desktop Compact Row View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {filteredPlans.map(plan => (
                <DevelopmentPlanTableRow
                  key={plan.id}
                  plan={plan}
                  player={player}
                  linkTo={getDevelopmentPlanLink()}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
