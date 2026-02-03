import { useParams } from 'react-router-dom';
import { useState } from 'react';
import PageTitle from '@components/common/PageTitle';
import ReportCardListCard from '@components/player/ReportCardListCard';
import ReportCardTableRow from '@components/player/ReportCardTableRow';
import { Routes } from '@utils/routes';
import { Filter, FileText } from 'lucide-react';
import { useAgeGroupReportCards, useAgeGroup } from '@/api/hooks';

export default function AgeGroupReportCardsPage() {
  const { clubId, ageGroupId } = useParams<{ clubId: string; ageGroupId: string }>();
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [filterRating, setFilterRating] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const { data: ageGroup, isLoading: ageGroupLoading } = useAgeGroup(ageGroupId);
  const { data: reports, isLoading: reportsLoading, error } = useAgeGroupReportCards(ageGroupId);

  const isLoading = ageGroupLoading || reportsLoading;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
              Error Loading Report Cards
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!ageGroup && !isLoading) {
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

  // Filter reports
  let filteredReports = reports ? [...reports] : [];
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        {isLoading ? (
          <div className="mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
        ) : (
          <PageTitle 
            title="Report Cards"
            subtitle={`${ageGroup?.name} report cards`}
          />
        )}

        {/* Filters */}
        <div className="card mb-4">
          {isLoading ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
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
                  <option value="rating">Highest Rating</option>
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
                  <option value="high">High Performance (8.0+)</option>
                  <option value="medium">Medium Performance (6.5-8.0)</option>
                  <option value="low">Needs Improvement (&lt;6.5)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Report Cards List */}
        {isLoading ? (
          <>
            {/* Mobile skeleton */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop skeleton */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Report Cards Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filterRating !== 'all' 
                ? 'No report cards match the selected filter.'
                : 'No report cards have been created for this age group yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredReports.map((report) => {
                const linkTo = Routes.playerReportCard(clubId!, ageGroupId!, report.player.id);
                
                return (
                  <ReportCardListCard
                    key={report.id}
                    report={report}
                    player={report.player}
                    linkTo={linkTo}
                  />
                );
              })}
            </div>

            {/* Desktop Compact Row View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {filteredReports.map((report) => {
                const linkTo = Routes.playerReportCard(clubId!, ageGroupId!, report.player.id);
                
                return (
                  <ReportCardTableRow
                    key={report.id}
                    report={report}
                    player={report.player}
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
