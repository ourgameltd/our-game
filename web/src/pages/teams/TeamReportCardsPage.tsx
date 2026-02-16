import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { sampleClubs } from '@/data/clubs';
import { sampleAgeGroups } from '@/data/ageGroups';
import { sampleTeams } from '@/data/teams';
import { samplePlayers } from '@/data/players';
import { getReportsByTeamId } from '@/data/reports';
import PageTitle from '@components/common/PageTitle';
import ReportCardListCard from '@components/player/ReportCardListCard';
import ReportCardTableRow from '@components/player/ReportCardTableRow';
import { Routes } from '@utils/routes';
import { Filter, FileText } from 'lucide-react';

export default function TeamReportCardsPage() {
  const { clubId, ageGroupId, teamId } = useParams<{ clubId: string; ageGroupId: string; teamId: string }>();
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [filterRating, setFilterRating] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroup = sampleAgeGroups.find(ag => ag.id === ageGroupId);
  const team = sampleTeams.find(t => t.id === teamId);
  const reports = clubId && ageGroupId && teamId ? getReportsByTeamId(clubId, ageGroupId, teamId) : [];

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

  // Filter reports
  let filteredReports = [...reports];
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

  // Get player for each report
  const reportsWithPlayers = filteredReports.map(report => ({
    report,
    player: samplePlayers.find(p => p.id === report.playerId)!
  })).filter(item => item.player);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle 
          title="Report Cards"
          subtitle={`${team.name} report cards`}
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
                onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="date">Most Recent</option>
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
              </select>
            </div>
          </div>
        </div>

        {/* Report Cards List */}
        {reportsWithPlayers.length === 0 ? (
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
