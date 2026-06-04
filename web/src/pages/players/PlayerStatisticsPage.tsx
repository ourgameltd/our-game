import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer, usePlayerRecentPerformances } from '@/api/hooks';
import type { PlayerRecentPerformanceDto } from '@/api/client';
import PageTitle from '@components/common/PageTitle';
import PlayerSubNav from '@components/player/PlayerSubNav';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNavigation } from '@/contexts/NavigationContext';
import { Routes } from '@utils/routes';

function ratingBadge(rating: number | null | undefined): string {
  const base = 'inline-block px-2 py-0.5 rounded text-xs font-semibold';
  if (!rating || rating === 0) return `${base} bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400`;
  if (rating >= 8) return `${base} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
  if (rating >= 6) return `${base} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`;
  return `${base} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
}

function resultBadge(result: string): string {
  const base = 'inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold';
  const firstChar = result.charAt(0).toUpperCase();
  if (firstChar === 'W') return `${base} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
  if (firstChar === 'D') return `${base} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`;
  if (firstChar === 'L') return `${base} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
  return `${base} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400`;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="card text-center">
      <div className={`text-2xl font-bold ${color ?? 'text-gray-900 dark:text-white'}`}>{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function computeStats(performances: PlayerRecentPerformanceDto[]) {
  const appearances = performances.length;
  const goals = performances.reduce((s, p) => s + (p.goals ?? 0), 0);
  const assists = performances.reduce((s, p) => s + (p.assists ?? 0), 0);
  const contributions = goals + assists;

  const rated = performances.filter(p => p.rating != null && p.rating > 0);
  const avgRating = rated.length > 0
    ? (rated.reduce((s, p) => s + p.rating, 0) / rated.length).toFixed(1)
    : null;
  const highestRating = rated.length > 0
    ? Math.max(...rated.map(p => p.rating)).toFixed(1)
    : null;

  const goalsPerGame = appearances > 0 ? (goals / appearances).toFixed(2) : '0.00';
  const assistsPerGame = appearances > 0 ? (assists / appearances).toFixed(2) : '0.00';

  return { appearances, goals, assists, contributions, avgRating, highestRating, goalsPerGame, assistsPerGame };
}

export default function PlayerStatisticsPage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const { setEntityName } = useNavigation();

  const { data: player, isLoading: playerLoading } = usePlayer(playerId);
  const { data: performances, isLoading: perfLoading } = usePlayerRecentPerformances(playerId, 50);

  usePageTitle(
    [
      player?.clubName ?? 'Club',
      ageGroupId ? (player?.ageGroupName ?? 'Age Group') : undefined,
      teamId ? (player?.teamName ?? 'Team') : undefined,
      player ? `${player.firstName} ${player.lastName}` : 'Player',
      'Statistics',
    ],
    !!player,
  );

  useEffect(() => {
    if (player) {
      setEntityName('player', player.id, `${player.firstName} ${player.lastName}`);
      if (player.clubId && player.clubName) setEntityName('club', player.clubId, player.clubName);
      if (player.teamId && player.teamName) setEntityName('team', player.teamId, player.teamName);
      if (player.ageGroupId && player.ageGroupName) setEntityName('ageGroup', player.ageGroupId, player.ageGroupName);
    }
  }, [player?.id, player?.firstName, player?.lastName, player?.clubId, player?.clubName, player?.teamId, player?.teamName, player?.ageGroupId, player?.ageGroupName, setEntityName]);

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

  let settingsLink: string;
  if (teamId && ageGroupId) {
    settingsLink = Routes.teamPlayerSettings(clubId!, ageGroupId, teamId, playerId!);
  } else if (ageGroupId) {
    settingsLink = Routes.playerSettings(clubId!, ageGroupId, playerId!);
  } else {
    settingsLink = Routes.clubPlayerSettings(clubId!, playerId!);
  }

  const isLoading = playerLoading || perfLoading;

  const sorted = performances
    ? [...performances].sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    : [];

  const stats = computeStats(sorted);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
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
              colorClass: 'from-primary-500 to-primary-600',
            }}
            action={{
              label: 'Settings',
              href: settingsLink,
              icon: 'settings',
              title: 'Player Settings',
            }}
          />
        ) : null}

        {!playerLoading && player && <PlayerSubNav />}

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
            No match appearances recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Appearances" value={stats.appearances} />
              <StatCard label="Goals" value={stats.goals} color="text-green-600 dark:text-green-400" />
              <StatCard label="Assists" value={stats.assists} color="text-blue-600 dark:text-blue-400" />
              <StatCard label="Contributions" value={stats.contributions} sub="goals + assists" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Avg Rating"
                value={stats.avgRating ?? '—'}
                color={stats.avgRating
                  ? (parseFloat(stats.avgRating) >= 7 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400')
                  : undefined}
              />
              <StatCard label="Best Rating" value={stats.highestRating ?? '—'} color="text-primary-600 dark:text-primary-400" />
              <StatCard label="Goals / Game" value={stats.goalsPerGame} />
              <StatCard label="Assists / Game" value={stats.assistsPerGame} />
            </div>

            {/* Match history */}
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Match History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Opponent</th>
                      <th className="pb-2 font-medium text-center">H/A</th>
                      <th className="pb-2 font-medium text-center">Result</th>
                      <th className="pb-2 font-medium text-center">G</th>
                      <th className="pb-2 font-medium text-center">A</th>
                      <th className="pb-2 font-medium text-center">Rating</th>
                      <th className="pb-2 font-medium hidden sm:table-cell">Competition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {sorted.map(p => (
                      <tr key={`${p.matchId}-${p.teamId}`} className="text-gray-900 dark:text-white">
                        <td className="py-2 pr-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {new Date(p.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-2 pr-3 font-medium text-sm truncate max-w-[100px]">{p.opponent}</td>
                        <td className="py-2 text-center text-xs text-gray-500 dark:text-gray-400">
                          {p.homeAway === 'Home' ? 'H' : 'A'}
                        </td>
                        <td className="py-2 text-center">
                          {p.result ? (
                            <span className={resultBadge(p.result)}>{p.result}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-2 text-center font-semibold">
                          {p.goals > 0 ? (
                            <span className="text-green-600 dark:text-green-400">{p.goals}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">0</span>
                          )}
                        </td>
                        <td className="py-2 text-center font-semibold">
                          {p.assists > 0 ? (
                            <span className="text-blue-600 dark:text-blue-400">{p.assists}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">0</span>
                          )}
                        </td>
                        <td className="py-2 text-center">
                          {p.rating && p.rating > 0 ? (
                            <span className={ratingBadge(p.rating)}>{p.rating.toFixed(1)}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-2 text-xs text-gray-500 dark:text-gray-500 hidden sm:table-cell truncate max-w-[100px]">
                          {p.competition || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
