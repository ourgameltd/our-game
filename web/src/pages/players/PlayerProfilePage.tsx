import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { usePlayer, usePlayerRecentPerformances, usePlayerUpcomingMatches } from '@api/hooks';
import { Routes } from '@utils/routes';
import { useNavigation } from '@/contexts/NavigationContext';
import PageTitle from '@components/common/PageTitle';
import RecentPerformanceCard from '@components/player/RecentPerformanceCard';
import MatchesCard from '@components/matches/MatchesCard';

export default function PlayerProfilePage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const { setEntityName } = useNavigation();
  
  const { data: player, isLoading: playerLoading, error: playerError } = usePlayer(playerId);
  const { data: recentPerformances, isLoading: performancesLoading } = usePlayerRecentPerformances(playerId, 5);
  const { data: upcomingMatches, isLoading: matchesLoading } = usePlayerUpcomingMatches(playerId, 3);

  // Update navigation context with entity names
  useEffect(() => {
    if (player) {
      setEntityName('player', player.id, `${player.firstName} ${player.lastName}`);
      if (player.clubId && player.clubName) {
        setEntityName('club', player.clubId, player.clubName);
      }
      // Set team and age group from first team (backward-compatible fields)
      if (player.teamId && player.teamName) {
        setEntityName('team', player.teamId, player.teamName);
      }
      if (player.ageGroupId && player.ageGroupName) {
        setEntityName('ageGroup', player.ageGroupId, player.ageGroupName);
      }
    }
  }, [player, setEntityName]);

  // Error handling - 404 or player not found
  if (playerError || (!playerLoading && !player)) {
    const is404 = (playerError as any)?.statusCode === 404;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              {is404 ? 'Player not found' : 'Error loading player'}
            </h2>
            {playerError && !is404 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {playerError.message}
              </p>
            )}
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
    subtitle = player ? `${player.ageGroupName || 'Age Group'} • ${player.teamName || 'Team'}` : 'Loading...';
  } else if (ageGroupId) {
    backLink = Routes.ageGroupPlayers(clubId!, ageGroupId);
    subtitle = player?.ageGroupName || 'Age Group';
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

  // Convert dateOfBirth to Date object
  const dateOfBirth = player?.dateOfBirth ? new Date(player.dateOfBirth) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title with Back Button */}
        {playerLoading ? (
          <div className="mb-4 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : player ? (
          <PageTitle
            title={`${player.firstName} ${player.lastName}`}
            subtitle={subtitle}
            backLink={backLink}
            image={{
              src: player.photoUrl,
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
        ) : null}

        {/* Player Stats */}
        {playerLoading ? (
          <div className="grid grid-cols-3 gap-3 mb-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-4">
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
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Player Details */}
          {playerLoading ? (
            <div className="card animate-pulse">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : player ? (
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Player Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date of Birth</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dateOfBirth ? dateOfBirth.toLocaleDateString('en-GB') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Age</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dateOfBirth ? new Date().getFullYear() - dateOfBirth.getFullYear() : 'N/A'} years old
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
          ) : null}

          {/* Recent Performance */}
          {performancesLoading ? (
            <div className="card animate-pulse">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <RecentPerformanceCard 
              performances={recentPerformances || []}
              clubId={clubId!}
            />
          )}
        </div>

        {/* Upcoming Matches */}
        <div className="mt-4">
          {matchesLoading ? (
            <div className="card animate-pulse">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
          ) : upcomingMatches && upcomingMatches.length > 0 ? (
            <MatchesCard 
              type="upcoming"
              matches={upcomingMatches.map(match => ({
                id: match.matchId,
                teamId: match.teamId,
                opposition: match.opponent,
                date: new Date(match.matchDate),
                kickOffTime: match.kickoffTime ? new Date(match.kickoffTime) : new Date(match.matchDate),
                location: match.venue || '',
                isHome: match.homeAway.toLowerCase() === 'home',
                competition: match.competition || '',
                status: 'scheduled' as const
              }))}
              limit={3}
              showTeamInfo={player ? player.ageGroupIds.length > 1 : false}
              getTeamInfo={(match) => {
                const matchData = upcomingMatches.find(m => m.matchId === match.id);
                if (matchData) {
                  return {
                    teamName: matchData.teamName,
                    ageGroupName: matchData.ageGroupName
                  };
                }
                return null;
              }}
              getMatchLink={(matchId) => {
                const match = upcomingMatches.find(m => m.matchId === matchId);
                if (match) {
                  return Routes.matchReport(clubId!, match.ageGroupId, match.teamId, matchId);
                }
                return '#';
              }}
            />
          ) : (
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Upcoming Matches</h3>
              <p className="text-gray-600 dark:text-gray-400">No upcoming matches scheduled</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
