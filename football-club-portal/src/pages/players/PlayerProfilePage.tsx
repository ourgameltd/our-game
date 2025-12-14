import { useParams } from 'react-router-dom';
import { getPlayerById } from '@data/players';
import { getPlayerRecentPerformances, getUpcomingMatchesByTeamIds } from '@data/matches';
import { getTeamById } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import PageNavigation from '@components/navigation/PageNavigation';
import { getPlayerNavigationTabs } from '@utils/navigationHelpers';
import { Routes } from '@utils/routes';
import PlayerDetailsHeader from '@components/player/PlayerDetailsHeader';
import RecentPerformanceCard from '@components/player/RecentPerformanceCard';
import UpcomingMatchesCard from '@components/matches/UpcomingMatchesCard';

export default function PlayerProfilePage() {
  const { clubId, ageGroupId, teamId, playerId } = useParams();
  const player = getPlayerById(playerId!);
  const recentPerformances = getPlayerRecentPerformances(playerId!, 5);
  const upcomingMatches = getUpcomingMatchesByTeamIds(player?.teamIds || [], 3);

  if (!player) {
      return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation Tabs */}
        <PageNavigation tabs={getPlayerNavigationTabs(clubId!, ageGroupId!, teamId!, playerId!)} />

        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Player not found</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getPlayerNavigationTabs(clubId!, ageGroupId!, teamId!, playerId!)} />

      <main className="container mx-auto px-4 py-8">
        {/* Player Header */}
        <div className="card mb-6">
          <PlayerDetailsHeader player={player} />
        </div>

        {/* Player Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Appearances</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">12</div>
            <div className="text-sm text-gray-500 mt-1">This season</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Goals</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">5</div>
            <div className="text-sm text-gray-500 mt-1">This season</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Assists</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">3</div>
            <div className="text-sm text-gray-500 mt-1">This season</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Player Details */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Player Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date of Birth</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {player.dateOfBirth.toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Age</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date().getFullYear() - player.dateOfBirth.getFullYear()} years old
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Preferred Positions</span>
                <div className="flex gap-2">
                  {player.preferredPositions.map(pos => (
                    <span key={pos} className="badge-primary">{pos}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Teams</span>
                <span className="font-medium text-gray-900 dark:text-white">{player.teamIds.length}</span>
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <RecentPerformanceCard 
            performances={recentPerformances}
            clubId={clubId!}
            ageGroupId={ageGroupId!}
            teamId={teamId!}
          />
        </div>

        {/* Upcoming Matches */}
        <div className="mt-6">
          <UpcomingMatchesCard 
            matches={upcomingMatches}
            showTeamInfo={player.teamIds.length > 1}
            getTeamInfo={(match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                const ageGroup = getAgeGroupById(team.ageGroupId);
                return {
                  teamName: team.name,
                  ageGroupName: ageGroup?.name || 'Unknown'
                };
              }
              return null;
            }}
            getMatchLink={(matchId) => {
              const match = upcomingMatches.find(m => m.id === matchId);
              if (match) {
                const team = getTeamById(match.teamId);
                if (team) {
                  return Routes.matchReport(clubId!, team.ageGroupId, match.teamId, matchId);
                }
              }
              return '#';
            }}
          />
        </div>
      </main>
    </div>
  );
}
