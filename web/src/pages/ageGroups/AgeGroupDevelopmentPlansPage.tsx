import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useClubById, useAgeGroupById, useAgeGroupDevelopmentPlans } from '@/api';
import type { AgeGroupDevelopmentPlanSummaryDto, AgeGroupDevelopmentPlanPlayerDto } from '@/api';
import PageTitle from '@components/common/PageTitle';
import DevelopmentPlanListCard from '@components/player/DevelopmentPlanListCard';
import DevelopmentPlanTableRow from '@components/player/DevelopmentPlanTableRow';
import { Routes } from '@utils/routes';
import { Filter, Target, AlertCircle } from 'lucide-react';
import type { DevelopmentPlan, Player, PlayerPosition } from '@/types';

// --- Skeleton components ---

function PageTitleSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-5 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

function DevelopmentPlanCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="flex flex-wrap gap-4 mb-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DevelopmentPlanRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 animate-pulse">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="min-w-0">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="hidden lg:block flex-shrink-0">
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex-shrink-0">
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

// --- Mapping functions ---

function mapApiPlanToDevelopmentPlan(dto: AgeGroupDevelopmentPlanSummaryDto): DevelopmentPlan {
  return {
    id: dto.id,
    playerId: dto.playerId,
    title: dto.title,
    description: '',
    status: dto.status,
    createdBy: '',
    createdAt: new Date(dto.createdAt),
    period: {
      start: dto.period.start ? new Date(dto.period.start) : new Date(),
      end: dto.period.end ? new Date(dto.period.end) : new Date()
    },
    goals: dto.goals.map(g => ({
      id: g.id,
      goal: g.goal,
      actions: [],
      startDate: new Date(),
      targetDate: g.targetDate ? new Date(g.targetDate) : new Date(),
      progress: g.progress,
      completed: g.completed,
      completedDate: g.completedDate ? new Date(g.completedDate) : undefined
    }))
  };
}

function mapApiPlayerToPlayer(dto: AgeGroupDevelopmentPlanPlayerDto): Player {
  return {
    id: dto.id,
    clubId: '',
    firstName: dto.firstName,
    lastName: dto.lastName,
    nickname: dto.nickname,
    dateOfBirth: new Date(),
    photo: dto.photo,
    preferredPositions: dto.preferredPositions as PlayerPosition[],
    attributes: {} as Player['attributes'],
    overallRating: 0,
    evaluations: [],
    ageGroupIds: [],
    teamIds: []
  };
}

// --- Page component ---

export default function AgeGroupDevelopmentPlansPage() {
  const { clubId, ageGroupId } = useParams<{ clubId: string; ageGroupId: string }>();
  const [sortBy, setSortBy] = useState<'date' | 'progress'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  const { data: club, isLoading: clubLoading } = useClubById(clubId);
  const { data: ageGroup, isLoading: ageGroupLoading } = useAgeGroupById(ageGroupId);
  const { data: plans, isLoading: plansLoading, error: plansError } = useAgeGroupDevelopmentPlans(ageGroupId);

  const isHeaderLoading = clubLoading || ageGroupLoading;
  const isLoading = isHeaderLoading || plansLoading;

  // Process, filter, and sort plans
  const plansWithPlayers = useMemo(() => {
    if (!plans) return [];

    let filtered = [...plans];
    if (filterStatus !== 'all') {
      filtered = filtered.filter(plan => plan.status === filterStatus);
    }

    if (sortBy === 'progress') {
      filtered.sort((a, b) => {
        const aProgress = a.goals.length > 0
          ? a.goals.reduce((sum, g) => sum + g.progress, 0) / a.goals.length
          : 0;
        const bProgress = b.goals.length > 0
          ? b.goals.reduce((sum, g) => sum + g.progress, 0) / b.goals.length
          : 0;
        return bProgress - aProgress;
      });
    }

    return filtered.map(dto => ({
      plan: mapApiPlanToDevelopmentPlan(dto),
      player: mapApiPlayerToPlayer(dto.player)
    }));
  }, [plans, filterStatus, sortBy]);

  // Error state
  if (plansError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Error loading development plans</h2>
                <p className="text-red-700 dark:text-red-300">
                  {plansError.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not-found states after loading completes
  if (!clubLoading && !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Club not found</h2>
          </div>
        </main>
      </div>
    );
  }

  if (!ageGroupLoading && !ageGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Age Group not found</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        {isHeaderLoading ? (
          <PageTitleSkeleton />
        ) : (
          <PageTitle 
            title="Development Plans"
            subtitle={`${ageGroup?.name} development plans`}
          />
        )}

        {/* Filters */}
        <div className="card mb-4">
          {isLoading ? (
            <FiltersSkeleton />
          ) : (
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
          )}
        </div>

        {/* Development Plans List */}
        {isLoading ? (
          <>
            {/* Mobile Card View Skeleton */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {[1, 2, 3].map((i) => (
                <DevelopmentPlanCardSkeleton key={i} />
              ))}
            </div>

            {/* Desktop Table View Skeleton */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <DevelopmentPlanRowSkeleton key={i} />
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
                : 'No development plans have been created for this age group yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {plansWithPlayers.map(({ plan, player }) => {
                const linkTo = Routes.playerDevelopmentPlan(clubId!, ageGroupId!, player.id);
                
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
                const linkTo = Routes.playerDevelopmentPlan(clubId!, ageGroupId!, player.id);
                
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
