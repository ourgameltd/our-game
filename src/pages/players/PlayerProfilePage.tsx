import { useParams } from 'react-router-dom';
import { getPlayerById } from '@data/players';
import { getPlayerRecentPerformances, getUpcomingMatchesByTeamIds } from '@data/matches';
import { getTeamById } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import RecentPerformanceCard from '@components/player/RecentPerformanceCard';
import MatchesCard from '@components/matches/MatchesCard';

export default function PlayerProfilePage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const player = getPlayerById(playerId!);
  const ageGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;
  const team = teamId ? getTeamById(teamId) : null;
  const recentPerformances = getPlayerRecentPerformances(playerId!, 5);
  const upcomingMatches = getUpcomingMatchesByTeamIds(player?.ageGroupIds || [], 3);

  if (!player) {
      return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-4">
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
  if (teamId && ageGroupId) {
    backLink = Routes.teamSquad(clubId!, ageGroupId, teamId);
    subtitle = `${ageGroup?.name || 'Age Group'} • ${team?.name || 'Team'}`;
  } else if (ageGroupId) {
    backLink = Routes.ageGroupPlayers(clubId!, ageGroupId);
    subtitle = ageGroup?.name || 'Age Group';
  } else {
    backLink = Routes.clubPlayers(clubId!);
    subtitle = 'Club Players';
  }

  // Determine settings link based on context
  let settingsLink: string;
  if (teamId && ageGroupId) {
    settingsLink = Routes.teamPlayerSettings(clubId!, ageGroupId, teamId, playerId!);
  } else if (ageGroupId) {
    settingsLink = Routes.playerSettings(clubId!, ageGroupId, playerId!);
  } else {
    settingsLink = Routes.clubPlayerSettings(clubId!, playerId!);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        {/* Page Title with Back Button */}
        <PageTitle
          title={`${player.firstName} ${player.lastName}`}
          subtitle={subtitle}
          backLink={backLink}
          image={{
            src: player.photo,
            alt: `${player.firstName} ${player.lastName}`,
            initials: `${player.firstName[0]}${player.lastName[0]}`,
            colorClass: 'from-primary-500 to-primary-600'
          }}
          action={{
            label: 'Settings',
            href: settingsLink,
            icon: 'settings',
            title: 'Player Settings'
          }}
        />

        {/* Player Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
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
                <span className="text-gray-600 dark:text-gray-400">Age Groups</span>
                <span className="font-medium text-gray-900 dark:text-white">{player.ageGroupIds.length}</span>
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
          />
        </div>

        {/* Upcoming Matches */}
        {/* Upcoming Matches */}
        <div className="mt-6">
          <MatchesCard 
            type="upcoming"
            matches={upcomingMatches}
            limit={3}
            showTeamInfo={player.ageGroupIds.length > 1}
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
            getMatchLink={(matchId, match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                return Routes.matchReport(clubId!, team.ageGroupId, match.teamId, matchId);
              }
              return '#';
            }}
          />
        </div>
      </main>
    </div>
  );
}
