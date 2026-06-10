import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Dumbbell } from 'lucide-react';
import { useTeamMatches, useTeamTrainingSessions } from '@/api/hooks';
import type { TeamMatchDto, TeamTrainingSessionDto } from '@/api/client';
import PageTitle from '@components/common/PageTitle';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Routes } from '@utils/routes';

type Tab = 'matches' | 'training';

function getMatchResult(m: TeamMatchDto): 'W' | 'D' | 'L' | null {
  if (m.homeScore == null || m.awayScore == null) return null;
  const ours = m.isHome ? m.homeScore : m.awayScore;
  const theirs = m.isHome ? m.awayScore : m.homeScore;
  if (ours > theirs) return 'W';
  if (ours < theirs) return 'L';
  return 'D';
}

function resultBadge(result: 'W' | 'D' | 'L' | null) {
  const base = 'inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold';
  if (result === 'W') return `${base} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
  if (result === 'D') return `${base} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`;
  if (result === 'L') return `${base} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
  return `${base} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400`;
}

interface SplitStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

function computeSplit(matches: TeamMatchDto[]): SplitStats {
  const scored = matches.filter(m => m.homeScore != null && m.awayScore != null);
  return {
    played: scored.length,
    wins: scored.filter(m => getMatchResult(m) === 'W').length,
    draws: scored.filter(m => getMatchResult(m) === 'D').length,
    losses: scored.filter(m => getMatchResult(m) === 'L').length,
    goalsFor: scored.reduce((s, m) => s + (m.isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0)), 0),
    goalsAgainst: scored.reduce((s, m) => s + (m.isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0)), 0),
  };
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

function MatchTab({ matches }: { matches: TeamMatchDto[] }) {
  const scored = matches.filter(m => m.homeScore != null && m.awayScore != null);
  const overall = computeSplit(scored);
  const winRate = overall.played > 0 ? Math.round((overall.wins / overall.played) * 100) : 0;
  const gd = overall.goalsFor - overall.goalsAgainst;
  const avgScored = overall.played > 0 ? (overall.goalsFor / overall.played).toFixed(1) : '0.0';
  const avgConceded = overall.played > 0 ? (overall.goalsAgainst / overall.played).toFixed(1) : '0.0';
  const cleanSheets = scored.filter(m => (m.isHome ? (m.awayScore ?? 1) : (m.homeScore ?? 1)) === 0).length;

  const home = computeSplit(scored.filter(m => m.isHome));
  const away = computeSplit(scored.filter(m => !m.isHome));

  // Per-competition breakdown (only if >1 competition)
  const compMap = new Map<string, TeamMatchDto[]>();
  for (const m of scored) {
    const c = m.competition || 'Other';
    compMap.set(c, [...(compMap.get(c) ?? []), m]);
  }
  const competitions = [...compMap.entries()];

  // All results sorted newest first
  const allResults = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (overall.played === 0 && matches.length === 0) {
    return (
      <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
        No matches recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Season overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Played" value={overall.played} />
        <StatCard label="Won" value={overall.wins} color="text-green-600 dark:text-green-400" />
        <StatCard label="Drawn" value={overall.draws} color="text-yellow-600 dark:text-yellow-400" />
        <StatCard label="Lost" value={overall.losses} color="text-red-600 dark:text-red-400" />
        <StatCard label="Win Rate" value={`${winRate}%`} color={winRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'} />
        <StatCard label="Goal Diff" value={gd >= 0 ? `+${gd}` : `${gd}`} color={gd > 0 ? 'text-green-600 dark:text-green-400' : gd < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'} />
      </div>

      {/* Goals detail */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Goals Scored" value={overall.goalsFor} color="text-green-600 dark:text-green-400" />
        <StatCard label="Goals Conceded" value={overall.goalsAgainst} color="text-red-600 dark:text-red-400" />
        <StatCard label="Avg Scored / Game" value={avgScored} />
        <StatCard label="Avg Conceded / Game" value={avgConceded} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Clean Sheets" value={cleanSheets} color="text-primary-600 dark:text-primary-400" />
      </div>

      {/* Home vs Away */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Home vs Away</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium"></th>
                <th className="pb-2 font-medium text-center">P</th>
                <th className="pb-2 font-medium text-center">W</th>
                <th className="pb-2 font-medium text-center">D</th>
                <th className="pb-2 font-medium text-center">L</th>
                <th className="pb-2 font-medium text-center">GF</th>
                <th className="pb-2 font-medium text-center">GA</th>
                <th className="pb-2 font-medium text-center">GD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {[
                { label: 'Home', s: home },
                { label: 'Away', s: away },
              ].map(({ label, s }) => (
                <tr key={label} className="text-gray-900 dark:text-white">
                  <td className="py-2 pr-4 font-medium">{label}</td>
                  <td className="py-2 text-center">{s.played}</td>
                  <td className="py-2 text-center text-green-600 dark:text-green-400">{s.wins}</td>
                  <td className="py-2 text-center text-yellow-600 dark:text-yellow-400">{s.draws}</td>
                  <td className="py-2 text-center text-red-600 dark:text-red-400">{s.losses}</td>
                  <td className="py-2 text-center">{s.goalsFor}</td>
                  <td className="py-2 text-center">{s.goalsAgainst}</td>
                  <td className={`py-2 text-center ${s.goalsFor - s.goalsAgainst > 0 ? 'text-green-600 dark:text-green-400' : s.goalsFor - s.goalsAgainst < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {s.goalsFor - s.goalsAgainst > 0 ? `+${s.goalsFor - s.goalsAgainst}` : s.goalsFor - s.goalsAgainst}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By Competition (only if multiple) */}
      {competitions.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">By Competition</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 font-medium">Competition</th>
                  <th className="pb-2 font-medium text-center">P</th>
                  <th className="pb-2 font-medium text-center">W</th>
                  <th className="pb-2 font-medium text-center">D</th>
                  <th className="pb-2 font-medium text-center">L</th>
                  <th className="pb-2 font-medium text-center">GF</th>
                  <th className="pb-2 font-medium text-center">GA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {competitions.map(([comp, ms]) => {
                  const s = computeSplit(ms);
                  return (
                    <tr key={comp} className="text-gray-900 dark:text-white">
                      <td className="py-2 pr-4 font-medium truncate max-w-[160px]">{comp}</td>
                      <td className="py-2 text-center">{s.played}</td>
                      <td className="py-2 text-center text-green-600 dark:text-green-400">{s.wins}</td>
                      <td className="py-2 text-center text-yellow-600 dark:text-yellow-400">{s.draws}</td>
                      <td className="py-2 text-center text-red-600 dark:text-red-400">{s.losses}</td>
                      <td className="py-2 text-center">{s.goalsFor}</td>
                      <td className="py-2 text-center">{s.goalsAgainst}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All results */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">All Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Opponent</th>
                <th className="pb-2 font-medium text-center">H/A</th>
                <th className="pb-2 font-medium text-center">Score</th>
                <th className="pb-2 font-medium hidden sm:table-cell">Competition</th>
                <th className="pb-2 font-medium hidden md:table-cell">Surface</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {allResults.map(m => {
                const result = getMatchResult(m);
                const ours = m.isHome ? m.homeScore : m.awayScore;
                const theirs = m.isHome ? m.awayScore : m.homeScore;
                return (
                  <tr key={m.id} className="text-gray-900 dark:text-white">
                    <td className="py-2 pr-4 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-2 pr-4 font-medium truncate max-w-[120px]">{m.opponentName}</td>
                    <td className="py-2 text-center text-xs text-gray-500 dark:text-gray-400">{m.isHome ? 'H' : 'A'}</td>
                    <td className="py-2 text-center">
                      {result != null && ours != null && theirs != null ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="font-semibold">{ours}–{theirs}</span>
                          <span className={resultBadge(result)}>{result}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">TBD</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-gray-500 dark:text-gray-500 hidden sm:table-cell truncate max-w-[120px]">
                      {m.competition || '—'}
                    </td>
                    <td className="py-2 text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {m.pitchType || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TrainingTab({ sessions, squadCount }: { sessions: TeamTrainingSessionDto[]; squadCount: number }) {
  const now = new Date();
  const completed = sessions.filter(s => new Date(s.date) < now);
  const upcoming = sessions.filter(s => new Date(s.date) >= now);
  const completionRate = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const sessionsWithAttendance = completed.filter(s => s.attendance.length > 0);
  const avgAttendance =
    sessionsWithAttendance.length > 0 && squadCount > 0
      ? Math.round(
          (sessionsWithAttendance.reduce((sum, s) => {
            const confirmed = s.attendance.filter(a => a.status === 'confirmed').length;
            return sum + confirmed / squadCount;
          }, 0) /
            sessionsWithAttendance.length) *
            100
        )
      : 0;

  const focusAreaCount = new Map<string, number>();
  for (const s of sessions) {
    for (const area of s.focusAreas) {
      focusAreaCount.set(area, (focusAreaCount.get(area) ?? 0) + 1);
    }
  }
  const topFocusAreas = [...focusAreaCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const allSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sessions.length === 0) {
    return (
      <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
        No training sessions recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Sessions" value={sessions.length} />
        <StatCard label="Completed" value={completed.length} color="text-green-600 dark:text-green-400" />
        <StatCard label="Upcoming" value={upcoming.length} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} color={completionRate >= 80 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Training Hours" value={totalHours} sub="total planned" />
        <StatCard label="Avg Attendance" value={`${avgAttendance}%`} color={avgAttendance >= 70 ? 'text-green-600 dark:text-green-400' : avgAttendance > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'} sub="completed sessions" />
      </div>

      {/* Focus Areas */}
      {topFocusAreas.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Most Practised Focus Areas</h3>
          <div className="space-y-2">
            {topFocusAreas.map(([area, count]) => (
              <div key={area} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white">{area}</span>
                <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full font-medium">
                  {count} session{count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Sessions */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">All Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium hidden sm:table-cell">Focus Areas</th>
                <th className="pb-2 font-medium text-center">Duration</th>
                <th className="pb-2 font-medium text-center">Attendance</th>
                <th className="pb-2 font-medium hidden md:table-cell">Surface</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {allSessions.map(s => {
                const isPast = new Date(s.date) < now;
                const confirmed = s.attendance.filter(a => a.status === 'confirmed').length;
                const attendancePct = isPast && squadCount > 0
                  ? Math.round((confirmed / squadCount) * 100)
                  : null;
                return (
                  <tr key={s.id} className="text-gray-900 dark:text-white">
                    <td className="py-2 pr-4 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-2 pr-4 text-xs truncate max-w-[100px]">{s.location}</td>
                    <td className="py-2 pr-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {s.focusAreas.slice(0, 3).map((area, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                            {area}
                          </span>
                        ))}
                        {s.focusAreas.length > 3 && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">+{s.focusAreas.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 text-center text-xs text-gray-600 dark:text-gray-400">
                      {s.durationMinutes != null ? `${s.durationMinutes}m` : '—'}
                    </td>
                    <td className="py-2 text-center text-xs">
                      {attendancePct != null ? (
                        <span className={attendancePct >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                          {attendancePct}%
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {s.pitchType || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function TeamStatisticsPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('matches');

  const { data: matchesData, isLoading: matchesLoading } = useTeamMatches(teamId);
  const { data: trainingData, isLoading: trainingLoading } = useTeamTrainingSessions(teamId);

  const teamName = matchesData?.team.name ?? trainingData?.team.name ?? 'Team';
  const clubName = matchesData?.club.name ?? trainingData?.club.name ?? 'Club';
  usePageTitle([clubName, teamName, 'Statistics'], !!(matchesData || trainingData));

  const isLoading = matchesLoading || trainingLoading;
  const dataLoaded = !!(matchesData || trainingData);

  const tabs: { id: Tab; label: string; Icon: typeof BarChart3 }[] = [
    { id: 'matches', label: 'Match Statistics', Icon: BarChart3 },
    { id: 'training', label: 'Training Statistics', Icon: Dumbbell },
  ];

  const backLink = clubId && ageGroupId && teamId
    ? Routes.team(clubId, ageGroupId, teamId)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {isLoading && !dataLoaded ? (
          <div className="mb-4 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : (
          <PageTitle title="Statistics" subtitle={teamName} backLink={backLink} />
        )}

        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{id === 'matches' ? 'Matches' : 'Training'}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ) : activeTab === 'matches' ? (
          <MatchTab matches={matchesData?.matches ?? []} />
        ) : (
          <TrainingTab
            sessions={trainingData?.sessions ?? []}
            squadCount={trainingData?.team.squadCount ?? 0}
          />
        )}
      </main>
    </div>
  );
}
