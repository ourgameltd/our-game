import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useTeamOverview, useTeamReportCards } from '@/api';
import type { ClubReportCardDto } from '@/api';
import PageTitle from '@components/common/PageTitle';
import ReportCardListCard from '@components/player/ReportCardListCard';
import ReportCardTableRow from '@components/player/ReportCardTableRow';
import { Routes } from '@utils/routes';
import { Filter, FileText, AlertCircle } from 'lucide-react';
import type { PlayerReport, Player, PlayerPosition } from '@/types';

/**
 * Skeleton component for report card list item loading state
 */
function ReportCardSkeleton() {
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

/**
 * Skeleton component for table row loading state
 */
function ReportCardTableRowSkeleton() {
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
 * Helper to map API report card DTO to PlayerReport type for component compatibility
 */
function mapApiReportToPlayerReport(apiReport: ClubReportCardDto): PlayerReport {
  return {
    id: apiReport.id,
    playerId: apiReport.playerId,
    period: {
      start: apiReport.period.start ? new Date(apiReport.period.start) : new Date(),
      end: apiReport.period.end ? new Date(apiReport.period.end) : new Date()
    },
    overallRating: apiReport.overallRating,
    strengths: apiReport.strengths,
    areasForImprovement: apiReport.areasForImprovement,
    developmentActions: apiReport.developmentActions.map(action => ({
      id: action.id,
      goal: action.goal,
      actions: action.actions,
      startDate: action.startDate ? new Date(action.startDate) : new Date(),
      targetDate: action.targetDate ? new Date(action.targetDate) : new Date(),
      completed: action.completed,
      completedDate: action.completedDate ? new Date(action.completedDate) : undefined
    })),
    coachComments: apiReport.coachComments,
    createdBy: apiReport.createdBy || '',
    createdAt: new Date(apiReport.createdAt),
    similarProfessionalPlayers: apiReport.similarProfessionalPlayers.map(pro => ({
      name: pro.name,
      team: pro.team,
      position: pro.position,
      reason: pro.reason
    }))
  };
}

/**
 * Helper to map API report card player DTO to Player type for component compatibility
 */
function mapApiPlayerToPlayer(apiReport: ClubReportCardDto): Player {
  return {
    id: apiReport.player.id,
    clubId: '',
    firstName: apiReport.player.firstName,
    lastName: apiReport.player.lastName,
    nickname: apiReport.player.nickname,
    dateOfBirth: new Date(),
    photo: apiReport.player.photo,
    preferredPositions: apiReport.player.preferredPositions as PlayerPosition[],
    attributes: {} as Player['attributes'],
    overallRating: 0,
    evaluations: [],
    ageGroupIds: apiReport.player.ageGroupIds,
    teamIds: []
  };
}

export default function TeamReportCardsPage() {
  const { clubId, ageGroupId, teamId } = useParams<{ clubId: string; ageGroupId: string; teamId: string }>();
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [filterRating, setFilterRating] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Fetch team overview and report cards from API
  const { data: teamOverview, isLoading: teamLoading, error: teamError } = useTeamOverview(teamId);
  const { data: reportCards, isLoading: reportCardsLoading, error: reportCardsError } = useTeamReportCards(teamId);

  const isLoading = teamLoading || reportCardsLoading;
  const hasError = teamError || reportCardsError;

  // Process and filter reports using useMemo for performance
  const reportsWithPlayers = useMemo(() => {
    if (!reportCards) return [];

    // Filter reports
    let filteredReports = [...reportCards];
    if (filterRating !== 'all') {
      filteredReports = filteredReports.filter(report => {
        if (filterRating === 'high') return report.overallRating >= 8.0;
        if (filterRating === 'medium') return report.overallRating >= 6.5 && report.overallRating < 8.0;
        if (filterRating === 'low') return report.overallRating < 6.5;
        return true;
      });
    }

    // Sort reports
    if (sortBy === 'rating') {
      filteredReports.sort((a, b) => b.overallRating - a.overallRating);
    }

    // Map to component-compatible types
    return filteredReports.map(apiReport => ({
      report: mapApiReportToPlayerReport(apiReport),
      player: mapApiPlayerToPlayer(apiReport)
    }));
  }, [reportCards, filterRating, sortBy]);

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Error loading report cards</h2>
                <p className="text-red-700 dark:text-red-300">
                  {teamError?.message || reportCardsError?.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Team not found after loading
  if (!isLoading && !teamOverview) {
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
            title="Report Cards"
            subtitle={`${teamOverview?.team?.name || 'Team'} report cards`}
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
                onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="date">Most Recent</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter Reports
              </label>
              <select
                id="filter"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Reports</option>
                <option value="high">High Performers (8.0+)</option>
                <option value="medium">Medium Performers (6.5-8.0)</option>
                <option value="low">Needs Improvement (&lt;6.5)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Cards List */}
        {isLoading ? (
          <>
            {/* Mobile Card View Skeleton */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {[...Array(3)].map((_, i) => (
                <ReportCardSkeleton key={i} />
              ))}
            </div>

            {/* Desktop Table View Skeleton */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <ReportCardTableRowSkeleton key={i} />
              ))}
            </div>
          </>
        ) : reportsWithPlayers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Report Cards Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filterRating !== 'all' 
                ? 'No report cards match the selected filter.'
                : 'No report cards have been created for this team yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {reportsWithPlayers.map(({ report, player }) => {
                const linkTo = Routes.teamPlayerReportCardDetail(clubId!, ageGroupId!, teamId!, player.id, report.id);
                
                return (
                  <ReportCardListCard
                    key={report.id}
                    report={report}
                    player={player}
                    linkTo={linkTo}
                  />
                );
              })}
            </div>

            {/* Desktop Compact Row View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {reportsWithPlayers.map(({ report, player }) => {
                const linkTo = Routes.teamPlayerReportCardDetail(clubId!, ageGroupId!, teamId!, player.id, report.id);
                
                return (
                  <ReportCardTableRow
                    key={report.id}
                    report={report}
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
