import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { sampleClubs } from '@/data/clubs';
import { sampleAgeGroups } from '@/data/ageGroups';
import { sampleTeams } from '@/data/teams';
import { samplePlayers } from '@/data/players';
import { getDevelopmentPlansByTeamId } from '@/data/developmentPlans';
import PageTitle from '@components/common/PageTitle';
import DevelopmentPlanListCard from '@components/player/DevelopmentPlanListCard';
import DevelopmentPlanTableRow from '@components/player/DevelopmentPlanTableRow';
import { Routes } from '@utils/routes';
import { Filter, Target } from 'lucide-react';

export default function TeamDevelopmentPlansPage() {
  const { clubId, ageGroupId, teamId } = useParams<{ clubId: string; ageGroupId: string; teamId: string }>();
  const [sortBy, setSortBy] = useState<'date' | 'progress'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroup = sampleAgeGroups.find(ag => ag.id === ageGroupId);
  const team = sampleTeams.find(t => t.id === teamId);
  const plans = clubId && ageGroupId && teamId ? getDevelopmentPlansByTeamId(clubId, ageGroupId, teamId) : [];

  if (!club || !ageGroup || !team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
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

  // Get player for each plan
  const plansWithPlayers = filteredPlans.map(plan => ({
    plan,
    player: samplePlayers.find(p => p.id === plan.playerId)!
  })).filter(item => item.player);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle 
          title="Development Plans"
          subtitle={`${team.name} development plans`}
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
        {plansWithPlayers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <Target className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Development Plans Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filterStatus !== 'all' 
                ? `No ${filterStatus} development plans match the selected filter.`
                : 'No development plans have been created for this team yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {plansWithPlayers.map(({ plan, player }) => {
                const linkTo = Routes.teamPlayerDevelopmentPlan(clubId!, ageGroupId!, teamId!, player.id);
                
                return (
                  <DevelopmentPlanListCard
                    key={plan.id}
                    plan={plan}
                    player={player}
                    linkTo={linkTo}
                  />
                );
              })}
            </div>

            {/* Desktop Compact Row View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {plansWithPlayers.map(({ plan, player }) => {
                const linkTo = Routes.teamPlayerDevelopmentPlan(clubId!, ageGroupId!, teamId!, player.id);
                
                return (
                  <DevelopmentPlanTableRow
                    key={plan.id}
                    plan={plan}
                    player={player}
                    linkTo={linkTo}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
