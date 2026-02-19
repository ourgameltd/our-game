import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useTeamOverview, useTeamDevelopmentPlans } from '@/api';
import type { TeamDevelopmentPlanDto } from '@/api';
import PageTitle from '@components/common/PageTitle';
import DevelopmentPlanListCard from '@components/player/DevelopmentPlanListCard';
import DevelopmentPlanTableRow from '@components/player/DevelopmentPlanTableRow';
import { Routes } from '@utils/routes';
import { Filter, Target, AlertCircle } from 'lucide-react';
import type { DevelopmentPlan, Player, PlayerPosition } from '@/types';

/**
 * Skeleton component for development plan card loading state (mobile)
 */
function DevelopmentPlanSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        {/* Player Photo Skeleton */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Plan Content Skeleton */}
        <div className="flex-1 min-w-0">
          {/* Player Name Skeleton */}
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />

          {/* Plan Title Skeleton */}
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />

          {/* Progress/Stats Skeleton */}
          <div className="flex flex-wrap gap-4 mb-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Goals Preview Skeleton */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton component for table row loading state (desktop)
 */
function DevelopmentPlanTableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 animate-pulse">
      {/* Player Info Skeleton */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="min-w-0">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Period Skeleton */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Progress Skeleton */}
      <div className="hidden lg:block flex-shrink-0">
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Arrow Skeleton */}
      <div className="flex-shrink-0">
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton component for page title loading state
 */
function PageTitleSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-5 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

/**
 * Maps an API development plan DTO to the DevelopmentPlan type used by components
 */
function mapApiPlanToDevelopmentPlan(dto: TeamDevelopmentPlanDto): DevelopmentPlan {
  return {
    id: dto.id,
    playerId: dto.playerId,
    title: dto.title,
    description: dto.description || '',
    status: dto.status as DevelopmentPlan['status'],
    createdBy: dto.createdBy || '',
    createdAt: new Date(dto.createdAt),
    period: {
      start: dto.period?.start ? new Date(dto.period.start) : new Date(),
      end: dto.period?.end ? new Date(dto.period.end) : new Date()
    },
    goals: dto.goals.map(g => ({
      id: g.id,
      goal: g.goal,
      actions: g.actions,
      startDate: g.startDate ? new Date(g.startDate) : new Date(),
      targetDate: g.targetDate ? new Date(g.targetDate) : new Date(),
      progress: g.progress,
      completed: g.completed,
      completedDate: g.completedDate ? new Date(g.completedDate) : undefined
    }))
  };
}

/**
 * Maps an API player DTO from a development plan to the Player type used by components
 */
function mapApiPlayerToPlayer(dto: TeamDevelopmentPlanDto['player']): Player {
  return {
    id: dto.id,
    clubId: '', // Not needed for display
    firstName: dto.firstName,
    lastName: dto.lastName,
    nickname: dto.nickname,
    dateOfBirth: new Date(), // Not displayed
    photo: dto.photo,
    preferredPositions: dto.preferredPositions as PlayerPosition[],
    attributes: {} as Player['attributes'], // Not needed for development plan display
    overallRating: 0, // Not needed for development plan display
    evaluations: [],
    ageGroupIds: [],
    teamIds: []
  };
}

export default function TeamDevelopmentPlansPage() {
  const { clubId, ageGroupId, teamId } = useParams<{ clubId: string; ageGroupId: string; teamId: string }>();
  const [sortBy, setSortBy] = useState<'date' | 'progress'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  // Fetch team and development plans from API
  const { data: teamData, isLoading: teamLoading, error: teamError } = useTeamOverview(teamId);
  const { data: plansData, isLoading: plansLoading, error: plansError } = useTeamDevelopmentPlans(teamId);

  const team = teamData?.team;
  const isLoading = teamLoading || plansLoading;
  const hasError = teamError || plansError;

  // Process, filter, and sort plans using useMemo for performance
  const plansWithPlayers = useMemo(() => {
    if (!plansData) return [];

    // Filter plans
    let filteredPlans = [...plansData];
    if (filterStatus !== 'all') {
      filteredPlans = filteredPlans.filter(plan => plan.status === filterStatus);
    }

    // Sort plans
    if (sortBy === 'progress') {
      filteredPlans.sort((a, b) => {
        const aProgress = a.goals.length > 0
          ? a.goals.reduce((sum, g) => sum + g.progress, 0) / a.goals.length
          : 0;
        const bProgress = b.goals.length > 0
          ? b.goals.reduce((sum, g) => sum + g.progress, 0) / b.goals.length
          : 0;
        return bProgress - aProgress;
      });
    }

    // Map to component-compatible types
    return filteredPlans.map(dto => ({
      plan: mapApiPlanToDevelopmentPlan(dto),
      player: mapApiPlayerToPlayer(dto.player)
    }));
  }, [plansData, filterStatus, sortBy]);

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Error loading development plans</h2>
                <p className="text-red-700 dark:text-red-300">
                  {teamError?.message || plansError?.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Team not found after loading
  if (!isLoading && !team) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        {isLoading ? (
          <PageTitleSkeleton />
        ) : (
          <PageTitle 
            title="Development Plans"
            subtitle={`${team?.name || 'Team'} development plans`}
          />
        )}

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
        {isLoading ? (
          <>
            {/* Mobile Card View Skeleton */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {[...Array(3)].map((_, i) => (
                <DevelopmentPlanSkeleton key={i} />
              ))}
            </div>

            {/* Desktop Table View Skeleton */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <DevelopmentPlanTableRowSkeleton key={i} />
              ))}
            </div>
          </>
        ) : plansWithPlayers.length === 0 ? (
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
                const linkTo = Routes.teamPlayerDevelopmentPlan(clubId!, ageGroupId!, teamId!, player.id, plan.id);
                
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
                const linkTo = Routes.teamPlayerDevelopmentPlan(clubId!, ageGroupId!, teamId!, player.id, plan.id);
                
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
