import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer, usePlayerRecentPerformances, usePlayerSeasonStatistics } from '@/api/hooks';
import type { PlayerRecentPerformanceDto, PlayerSeasonStatisticsDto } from '@/api/client';
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

function AttendanceBar({ present, total, label }: { present: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const color = pct >= 80 ? 'bg-green-500 dark:bg-green-400' : pct >= 60 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{present}/{total} ({pct}%)</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SeasonSummary({ season }: { season: PlayerSeasonStatisticsDto }) {
  const contributions = season.goals + season.assists;
  const goalsPerGame = season.appearances > 0 ? (season.goals / season.appearances).toFixed(2) : '0.00';
  const ratingColor = season.avgRating
    ? (season.avgRating >= 7 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400')
    : undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Appearances" value={season.appearances} />
        <StatCard label="Goals" value={season.goals} color="text-green-600 dark:text-green-400" />
        <StatCard label="Assists" value={season.assists} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Contributions" value={contributions} sub="goals + assists" />
        <StatCard
          label="Avg Rating"
          value={season.avgRating != null ? season.avgRating.toFixed(1) : '—'}
          color={ratingColor}
        />
        <StatCard label="Goals / Game" value={goalsPerGame} />
      </div>

      {(season.matchesRsvpd > 0 || season.trainingTotal > 0) && (
        <div className="card">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Attendance
          </h3>
          <div className="space-y-3">
            {season.matchesRsvpd > 0 && (
              <AttendanceBar
                present={season.matchesConfirmed}
                total={season.matchesRsvpd}
                label="Match RSVPs confirmed"
              />
            )}
            {season.trainingTotal > 0 && (
              <AttendanceBar
                present={season.trainingPresent}
                total={season.trainingTotal}
                label="Training sessions attended"
              />
            )}
          </div>
          {season.matchesRsvpd > 0 && (
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>
                <span className="text-green-600 dark:text-green-400 font-medium">{season.matchesConfirmed}</span> confirmed
              </span>
              {season.matchesDeclined > 0 && (
                <span>
                  <span className="text-red-600 dark:text-red-400 font-medium">{season.matchesDeclined}</span> declined
                </span>
              )}
              {season.matchesPending > 0 && (
                <span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{season.matchesPending}</span> pending
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchHistoryTable({ performances }: { performances: PlayerRecentPerformanceDto[] }) {
  if (performances.length === 0) {
    return (
      <div className="card text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
        No appearances in this season.
      </div>
    );
  }

  return (
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
            {performances.map(p => (
              <tr key={`${p.matchId}-${p.teamId}`} className="text-gray-900 dark:text-white">
                <td className="py-2 pr-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {new Date(p.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </td>
                <td className="py-2 pr-3 font-medium text-sm truncate max-w-[100px]">{p.opponent}</td>
                <td className="py-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  {p.homeAway === 'Home' ? 'H' : 'A'}
                </td>
                <td className="py-2 text-center">
                  {p.result && p.result !== 'N/A' ? (
                    <span className={resultBadge(p.result)}>{p.result.charAt(0)}</span>
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
  );
}

export default function PlayerStatisticsPage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const { setEntityName } = useNavigation();

  const { data: player, isLoading: playerLoading } = usePlayer(playerId);
  const { data: performances, isLoading: perfLoading } = usePlayerRecentPerformances(playerId, 500);
  const { data: seasonStats, isLoading: seasonLoading } = usePlayerSeasonStatistics(playerId);

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

  const isLoading = playerLoading || perfLoading || seasonLoading;

  // Season selector — default to most recent season with data
  const seasons = seasonStats ?? [];
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  useEffect(() => {
    if (seasons.length > 0 && !selectedSeason) {
      setSelectedSeason(seasons[0].season);
    }
  }, [seasons, selectedSeason]);

  const activeSeason = seasons.find(s => s.season === selectedSeason) ?? seasons[0];

  const filteredPerformances = performances
    ? [...performances]
        .filter(p => !activeSeason || p.season === activeSeason?.season)
        .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    : [];

  const hasAnyData = seasons.length > 0 || (performances && performances.length > 0);

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
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ) : !hasAnyData ? (
          <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
            No match appearances recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Season selector */}
            {seasons.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Season</span>
                <div className="flex flex-wrap gap-2">
                  {seasons.map(s => (
                    <button
                      key={s.season}
                      onClick={() => setSelectedSeason(s.season)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        s.season === (activeSeason?.season)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {s.season}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Season stats + attendance */}
            {activeSeason && <SeasonSummary season={activeSeason} />}

            {/* Match history for selected season */}
            <MatchHistoryTable performances={filteredPerformances} />
          </div>
        )}
      </main>
    </div>
  );
}
