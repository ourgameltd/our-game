import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { usePlayer } from '@api/hooks';
import { usePlayerCompetencies, type CompetencyBand, GAME_FORMAT_LABELS } from '@api/competencies';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessProfile } from '@/hooks/useAccessProfile';
import { canViewPlayerAbilities } from '@/utils/accessControl';
import { Routes } from '@utils/routes';
import PlayerSubNav from '@components/player/PlayerSubNav';
import PageTitle from '@components/common/PageTitle';
import AccessDeniedPage from '@components/common/AccessDeniedPage';
import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadarChart, Radar,
  Tooltip, ResponsiveContainer
} from 'recharts';

const BAND_VALUE: Record<CompetencyBand, number> = {
  Development: 1,
  Intermediate: 2,
  Advanced: 3,
  Elite: 4,
};


const BAND_COLOURS: Record<CompetencyBand, { bg: string; text: string; dark: string }> = {
  Development: { bg: 'bg-gray-100', text: 'text-gray-700', dark: 'dark:bg-gray-700 dark:text-gray-300' },
  Intermediate: { bg: 'bg-blue-100', text: 'text-blue-700', dark: 'dark:bg-blue-900 dark:text-blue-300' },
  Advanced: { bg: 'bg-emerald-100', text: 'text-emerald-700', dark: 'dark:bg-emerald-900 dark:text-emerald-300' },
  Elite: { bg: 'bg-amber-100', text: 'text-amber-700', dark: 'dark:bg-amber-900 dark:text-amber-300' },
};

const BAND_DESCRIPTIONS: Record<CompetencyBand, string> = {
  Development: 'Building foundational skills — early stage of the competency journey.',
  Intermediate: 'Consistent application in familiar situations, growing confidence.',
  Advanced: 'Reliable performance under pressure; a genuine strength area.',
  Elite: 'Exceptional mastery — performs at the highest level consistently.',
};

function BandBadge({ band }: { band: CompetencyBand }) {
  const c = BAND_COLOURS[band];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text} ${c.dark}`}>
      {band}
    </span>
  );
}

const CATEGORY_COLOURS: Record<string, string> = {
  Skills: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Physical: 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Mental: 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const RADAR_TICK_LABELS: Record<number, string> = { 0: '', 1: 'Dev', 2: 'Int', 3: 'Adv', 4: 'Elite' };

const BAND_ORDER: CompetencyBand[] = ['Development', 'Intermediate', 'Advanced', 'Elite'];
function nextBand(band: CompetencyBand): CompetencyBand | null {
  const idx = BAND_ORDER.indexOf(band);
  return idx < BAND_ORDER.length - 1 ? BAND_ORDER[idx + 1] : null;
}

export default function PlayerAbilitiesPage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const { data: player, isLoading: playerLoading } = usePlayer(playerId);

  usePageTitle(
    [
      player?.clubName ?? 'Club',
      ageGroupId ? (player?.ageGroupName ?? 'Age Group') : undefined,
      teamId ? (player?.teamName ?? 'Team') : undefined,
      player ? `${player.firstName} ${player.lastName}` : 'Player',
      'Abilities',
    ],
    !!player,
  );

  const { isAdmin } = useAuth();
  const { profile } = useAccessProfile(isAdmin);
  const { data: competencies, isLoading: loading, error, refetch } = usePlayerCompetencies(playerId);
  const { actualTheme } = useTheme();
  const { setEntityName } = useNavigation();
  const isDark = actualTheme === 'dark';

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

  const chartColors = {
    grid: isDark ? '#4B5563' : '#D1D5DB',
    axis: isDark ? '#9CA3AF' : '#4B5563',
    tooltipBg: isDark ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDark ? '#374151' : '#E5E7EB',
    tooltipText: isDark ? '#FFFFFF' : '#1F2937',
    primary: { stroke: '#2563EB', fill: '#2563EB' },
  };

  if (!playerId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Player ID is required</h2>
          </div>
        </main>
      </div>
    );
  }

  if (!canViewPlayerAbilities(profile)) {
    return (
      <AccessDeniedPage description="Player abilities are not visible for linked parent accounts." />
    );
  }

  // Derive sorted competency lists
  const sortedCompetencies = competencies
    ? [...competencies.competencies].sort((a, b) => {
        const aVal = a.band ? BAND_VALUE[a.band] : 0;
        const bVal = b.band ? BAND_VALUE[b.band] : 0;
        return bVal - aVal;
      })
    : [];

  const top3 = sortedCompetencies.slice(0, 3);
  const bottom3 = [...sortedCompetencies].reverse().slice(0, 3);

  // Framework completion percentage
  const totalPossible = (competencies?.competencies.length ?? 0) * 4;
  const totalActual = competencies?.competencies.reduce((sum, c) => sum + (c.band ? BAND_VALUE[c.band] : 0), 0) ?? 0;
  const frameworkPct = totalPossible > 0 ? Math.round((totalActual / totalPossible) * 100) : 0;

  const categoryBands = (['Skills', 'Physical', 'Mental'] as const).map(cat => {
    const items = competencies?.competencies.filter(c => c.categoryName === cat) ?? [];
    const assessed = items.filter(c => c.band);
    const avg = assessed.length > 0
      ? Math.round(assessed.reduce((s, c) => s + BAND_VALUE[c.band!], 0) / assessed.length)
      : null;
    const band = avg !== null ? (BAND_ORDER[avg - 1] ?? null) : null;
    return { cat, band };
  });

  // Radar chart data — one point per competency
  const radarData = competencies?.competencies
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(c => ({
      competency: c.competencyName.split(' ')[0], // short label for spoke
      fullLabel: c.competencyName,
      bandValue: c.band ? BAND_VALUE[c.band] : 0,
      fullMark: 4,
    })) ?? [];

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

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error.message || 'Failed to load player competencies'}
            </p>
            <button onClick={refetch} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Top Row: Framework Completion + Current Band + Competency Profile + By Category */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          {loading ? (
            <>
              <div className="card">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-32 mb-2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-20 mb-3" />
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-24 mb-2" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-28 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-full" />
              </div>
              <div className="card md:col-span-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-36 mb-3" />
                <div className="h-80 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              </div>
              <div className="card">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-28 mb-3" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2" />
                ))}
              </div>
            </>
          ) : competencies ? (
            <>
              {/* Framework Completion + Current Band (combined) */}
              <div className="card">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Framework Completion</p>
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {frameworkPct}%
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 dark:bg-primary-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${frameworkPct}%` }}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Current Band</p>
                  {competencies.overallBand ? (
                    <>
                      <div className="mb-1">
                        <BandBadge band={competencies.overallBand} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {BAND_DESCRIPTIONS[competencies.overallBand]}
                      </p>
                      {nextBand(competencies.overallBand) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Next Band</p>
                          <div className="mb-1">
                            <BandBadge band={nextBand(competencies.overallBand)!} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {BAND_DESCRIPTIONS[nextBand(competencies.overallBand)!]}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No band assigned yet</p>
                  )}
                </div>
              </div>

              {/* Competency Profile Radar — spans 2 columns */}
              {radarData.length > 0 ? (
                <div className="card md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Competency Profile</p>
                  <div className="h-80 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid stroke={chartColors.grid} />
                        <PolarAngleAxis
                          dataKey="competency"
                          tick={{ fill: chartColors.axis, fontSize: 10, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 4]}
                          tickCount={5}
                          tick={({ x, y, payload }: { x: number; y: number; payload: { value: number } }) => (
                            <text
                              x={x}
                              y={y}
                              fill={chartColors.axis}
                              fontSize={8}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {RADAR_TICK_LABELS[payload.value] ?? ''}
                            </text>
                          )}
                        />
                        <Radar
                          name="Band"
                          dataKey="bandValue"
                          stroke={chartColors.primary.stroke}
                          fill={chartColors.primary.fill}
                          fillOpacity={0.35}
                          dot={{ fill: chartColors.primary.fill, r: 3 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: '8px',
                            color: chartColors.tooltipText,
                          }}
                          formatter={(value: number, _name: string, entry: { payload?: { fullLabel?: string } }) => {
                            const bandName = Object.entries(BAND_VALUE).find(([, v]) => v === value)?.[0] as CompetencyBand | undefined;
                            return [
                              bandName ?? 'Unassigned',
                              entry?.payload?.fullLabel ?? 'Competency',
                            ];
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="card md:col-span-2 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                  No competencies assessed yet
                </div>
              )}

              {/* By Category */}
              <div className="card">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">By Category</p>
                <div className="space-y-3">
                  {categoryBands.map(({ cat, band }) => (
                    <div key={cat} className="flex items-center justify-between gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLOURS[cat] ?? ''}`}>
                        {cat}
                      </span>
                      {band ? <BandBadge band={band} /> : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Strengths + Improvement Panels */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[1, 2].map(i => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-48 mb-4" />
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-14 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2" />
                ))}
              </div>
            ))}
          </div>
        ) : competencies ? (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Top 3 Strengths */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Top 3 Strengths
              </h3>
              {top3.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No competencies assessed yet.</p>
              ) : (
                <div className="space-y-3">
                  {top3.map(c => {
                    const nb = c.band ? nextBand(c.band) : null;
                    return (
                      <div
                        key={c.competencyId}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {c.competencyName}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLOURS[c.categoryName] ?? 'bg-gray-100 text-gray-700'}`}>
                            {c.categoryName}
                          </span>
                        </div>
                        {c.band ? (
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Now</span>
                                <BandBadge band={c.band} />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                                {c.descriptions[c.band]}
                              </p>
                            </div>
                            {nb && (
                              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next</span>
                                  <BandBadge band={nb} />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                                  {c.descriptions[nb]}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top 3 Improvement Areas */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Areas to Focus
              </h3>
              {bottom3.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No competencies assessed yet.</p>
              ) : (
                <div className="space-y-3">
                  {bottom3.map(c => {
                    const nb = c.band ? nextBand(c.band) : null;
                    return (
                      <div
                        key={c.competencyId}
                        className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30"
                      >
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {c.competencyName}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLOURS[c.categoryName] ?? 'bg-gray-100 text-gray-700'}`}>
                            {c.categoryName}
                          </span>
                        </div>
                        {c.band ? (
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Now</span>
                                <BandBadge band={c.band} />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                                {c.descriptions[c.band]}
                              </p>
                            </div>
                            {nb && (
                              <div className="pt-2 border-t border-amber-100 dark:border-amber-800/30">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</span>
                                  <BandBadge band={nb} />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                                  {c.descriptions[nb]}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 dark:text-amber-400 leading-snug">
                            Not yet assessed — coach review needed
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Multi-team bands (if more than one team) */}
        {!loading && competencies && competencies.teamScores.length > 1 && (
          <div className="card mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Band by Team
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {competencies.teamScores.map(ts => (
                <div
                  key={ts.teamId}
                  className="flex flex-col gap-1.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate mr-2">
                      {ts.teamName}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded shrink-0">
                      {GAME_FORMAT_LABELS[ts.format]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <BandBadge band={ts.band} />
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate ml-2">
                      {ts.frameworkName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
