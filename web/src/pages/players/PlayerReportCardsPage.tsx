import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { getPlayerById } from '@data/players';
import { getReportsByPlayerId } from '@data/reports';
import { getAgeGroupById } from '@data/ageGroups';
import { getTeamById } from '@data/teams';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import ReportCardListCard from '@components/player/ReportCardListCard';
import ReportCardTableRow from '@components/player/ReportCardTableRow';
import { Filter, FileText } from 'lucide-react';

export default function PlayerReportCardsPage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const [sortBy, setSortBy] = useState<'date'>('date');
  
  const player = getPlayerById(playerId!);
  const reports = playerId ? getReportsByPlayerId(playerId) : [];
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
  let newReportCardLink: string;
  if (teamId && ageGroupId) {
    backLink = Routes.teamPlayer(clubId!, ageGroupId, teamId, playerId!);
    subtitle = `${ageGroup?.name || 'Age Group'} • ${team?.name || 'Team'}`;
    newReportCardLink = Routes.newTeamPlayerReportCard(clubId!, ageGroupId, teamId, playerId!);
  } else if (ageGroupId) {
    backLink = Routes.player(clubId!, ageGroupId, playerId!);
    subtitle = ageGroup?.name || 'Age Group';
    newReportCardLink = Routes.newPlayerReportCard(clubId!, ageGroupId, playerId!);
  } else {
    backLink = Routes.clubPlayers(clubId!);
    subtitle = 'Club Players';
    newReportCardLink = '#';
  }

  // Helper to generate report card link
  const getReportCardLink = () => {
    if (teamId && ageGroupId) {
      return Routes.teamPlayerReportCard(clubId!, ageGroupId, teamId, playerId!);
    } else if (ageGroupId) {
      return Routes.playerReportCard(clubId!, ageGroupId, playerId!);
    }
    return '#';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <PageTitle
          title="Report Cards"
          subtitle={`${player.firstName} ${player.lastName} • ${subtitle}`}
          backLink={backLink}
          action={{
            label: 'New Report Card',
            href: newReportCardLink,
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
                onChange={(e) => setSortBy(e.target.value as 'date')}
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
                value="all"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Reports</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Cards List */}
        {reports.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Report Cards Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No report cards have been created yet.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {reports.map(report => (
                <ReportCardListCard
                  key={report.id}
                  report={report}
                  player={player}
                  linkTo={getReportCardLink()}
                />
              ))}
            </div>

            {/* Desktop Compact Row View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {reports.map(report => (
                <ReportCardTableRow
                  key={report.id}
                  report={report}
                  player={player}
                  linkTo={getReportCardLink()}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
