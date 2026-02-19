import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { usePlayer, usePlayerReports } from '@api/hooks';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import ReportCardListCard from '@components/player/ReportCardListCard';
import ReportCardTableRow from '@components/player/ReportCardTableRow';
import { Filter, FileText, Loader2 } from 'lucide-react';

export default function PlayerReportCardsPage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const [sortBy, setSortBy] = useState<'date'>('date');
  
  const { data: player, isLoading: playerLoading } = usePlayer(playerId);
  const { data: reports, isLoading: reportsLoading } = usePlayerReports(playerId);

  const isLoading = playerLoading || reportsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          </div>
        </main>
      </div>
    );
  }

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

  const reportsList = reports || [];

  // Determine back link based on context (team, age group, or club)
  let backLink: string;
  let subtitle: string;
  let newReportCardLink: string;
  
  if (teamId && ageGroupId) {
    backLink = Routes.teamPlayer(clubId!, ageGroupId, teamId, playerId!);
    const ageGroupName = player.teams?.find(t => t.id === teamId)?.ageGroupName || player.ageGroupName || 'Age Group';
    const teamName = player.teams?.find(t => t.id === teamId)?.name || player.teamName || 'Team';
    subtitle = `${ageGroupName} • ${teamName}`;
    newReportCardLink = Routes.newTeamPlayerReportCard(clubId!, ageGroupId, teamId, playerId!);
  } else if (ageGroupId) {
    backLink = Routes.player(clubId!, ageGroupId, playerId!);
    subtitle = player.ageGroupName || 'Age Group';
    newReportCardLink = Routes.newPlayerReportCard(clubId!, ageGroupId, playerId!);
  } else {
    backLink = Routes.clubPlayers(clubId!);
    subtitle = 'Club Players';
    newReportCardLink = '#';
  }

  // Helper to generate report card link
  const getReportCardLink = (reportId: string) => {
    if (teamId && ageGroupId) {
      return Routes.teamPlayerReportCardDetail(clubId!, ageGroupId, teamId, playerId!, reportId);
    } else if (ageGroupId) {
      return Routes.playerReportCardDetail(clubId!, ageGroupId, playerId!, reportId);
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
        {reportsList.length === 0 ? (
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
              {reportsList.map(report => (
                <ReportCardListCard
                  key={report.id}
                  report={{
                    id: report.id,
                    playerId: report.playerId,
                    player: {
                      id: report.playerId,
                      firstName: report.firstName,
                      lastName: report.lastName,
                      photo: report.photoUrl || undefined,
                      preferredPositions: report.preferredPositions,
                      ageGroupIds: []
                    },
                    period: {
                      start: report.periodStart ? new Date(report.periodStart) : undefined,
                      end: report.periodEnd ? new Date(report.periodEnd) : undefined
                    },
                    overallRating: report.overallRating || 0,
                    strengths: [], // Not needed for summary view
                    areasForImprovement: [], // Not needed for summary view
                    developmentActions: [], // Not needed for summary view
                    coachComments: '', // Not needed for summary view
                    createdAt: new Date(report.createdAt),
                    createdBy: report.coachName || undefined
                  }}
                  player={{
                    id: report.playerId,
                    firstName: report.firstName,
                    lastName: report.lastName,
                    photo: report.photoUrl || undefined,
                    preferredPositions: report.preferredPositions
                  }}
                  linkTo={getReportCardLink(report.id)}
                />
              ))}
            </div>

            {/* Desktop Compact Row View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {reportsList.map(report => (
                <ReportCardTableRow
                  key={report.id}
                  report={{
                    id: report.id,
                    playerId: report.playerId,
                    player: {
                      id: report.playerId,
                      firstName: report.firstName,
                      lastName: report.lastName,
                      photo: report.photoUrl || undefined,
                      preferredPositions: report.preferredPositions,
                      ageGroupIds: []
                    },
                    period: {
                      start: report.periodStart ? new Date(report.periodStart) : undefined,
                      end: report.periodEnd ? new Date(report.periodEnd) : undefined
                    },
                    overallRating: report.overallRating || 0,
                    strengths: [], // Not needed for summary view
                    areasForImprovement: [], // Not needed for summary view
                    developmentActions: [], // Not needed for summary view
                    coachComments: '', // Not needed for summary view
                    createdAt: new Date(report.createdAt),
                    createdBy: report.coachName || undefined
                  }}
                  player={{
                    id: report.playerId,
                    firstName: report.firstName,
                    lastName: report.lastName,
                    photo: report.photoUrl || undefined,
                    preferredPositions: report.preferredPositions
                  }}
                  linkTo={getReportCardLink(report.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
