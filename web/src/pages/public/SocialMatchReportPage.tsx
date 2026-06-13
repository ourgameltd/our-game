import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { usePublishedMatchReport } from '@/api';
import { useSocialMetaTags } from '@/hooks/useSocialMetaTags';
import { getContrastTextColor } from '@utils/colorHelpers';
import type { PublishedGoalDto, PublishedCardDto, PublishedMatchReportDto, PublishedLineupPlayerDto } from '@/api/client';

const DEFAULT_PRIMARY = '#0284c7';   // primary-600
const DEFAULT_SECONDARY = '#075985'; // primary-800

function ScoreDisplay({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  isHome,
  textColor,
}: {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  isHome: boolean;
  textColor: string;
}) {
  const hasScore = homeScore !== undefined && awayScore !== undefined;
  const ourScore = isHome ? homeScore : awayScore;
  const theirScore = isHome ? awayScore : homeScore;
  const weWon = hasScore && ourScore! > theirScore!;
  const weLost = hasScore && ourScore! < theirScore!;

  return (
    <div className="mt-6 flex items-center justify-center gap-4 sm:gap-8">
      <span
        className="max-w-35 text-center text-sm font-semibold leading-tight sm:max-w-none sm:text-base"
        style={{ color: textColor, opacity: !hasScore || weWon || !weLost ? 1 : 0.65 }}
      >
        {homeTeam}
      </span>

      {hasScore ? (
        <div className="flex items-center gap-3">
          <span
            className="text-5xl font-black tabular-nums sm:text-6xl"
            style={{ color: textColor, opacity: isHome && weLost ? 0.55 : 1 }}
          >
            {homeScore}
          </span>
          <span className="text-2xl font-light" style={{ color: textColor, opacity: 0.5 }}>
            –
          </span>
          <span
            className="text-5xl font-black tabular-nums sm:text-6xl"
            style={{ color: textColor, opacity: !isHome && weLost ? 0.55 : 1 }}
          >
            {awayScore}
          </span>
        </div>
      ) : (
        <span className="text-2xl font-light" style={{ color: textColor, opacity: 0.5 }}>
          vs
        </span>
      )}

      <span
        className="max-w-35 text-center text-sm font-semibold leading-tight sm:max-w-none sm:text-base"
        style={{ color: textColor, opacity: !hasScore || !weWon || weLost ? 1 : 0.65 }}
      >
        {awayTeam}
      </span>
    </div>
  );
}

const PERIOD_ORDER = ['first', 'second', 'third', 'etFirst', 'etSecond', 'penalties'];
const PERIOD_LABELS: Record<string, string> = {
  first: 'First Half',
  second: 'Second Half',
  third: 'Third Period',
  etFirst: 'Extra Time — 1st Half',
  etSecond: 'Extra Time — 2nd Half',
  penalties: 'Penalty Shootout',
};

type MatchEvent =
  | { kind: 'goal'; period: string; minute?: number; isOpponent: boolean; data: PublishedGoalDto }
  | { kind: 'card'; period: string; minute?: number; isOpponent: boolean; data: PublishedCardDto };

function buildEvents(data: PublishedMatchReportDto): Map<string, { home: MatchEvent[]; away: MatchEvent[] }> {
  const events: MatchEvent[] = [
    ...(data.goals ?? []).map(g => ({
      kind: 'goal' as const,
      period: g.period ?? 'first',
      minute: g.minute ?? undefined,
      isOpponent: g.isOpponent,
      data: g,
    })),
    ...(data.cards ?? []).map(c => ({
      kind: 'card' as const,
      period: c.period ?? 'first',
      minute: c.minute ?? undefined,
      isOpponent: c.isOpponent,
      data: c,
    })),
  ];

  events.sort((a, b) => {
    const pa = PERIOD_ORDER.indexOf(a.period);
    const pb = PERIOD_ORDER.indexOf(b.period);
    if (pa !== pb) return pa - pb;
    return (a.minute ?? 999) - (b.minute ?? 999);
  });

  const grouped = new Map<string, { home: MatchEvent[]; away: MatchEvent[] }>();
  for (const e of events) {
    if (!grouped.has(e.period)) grouped.set(e.period, { home: [], away: [] });
    // Home column = events by the actual home team.
    // When our team is home: non-opponent events → home; opponent → away.
    // When our team is away: opponent events → home; non-opponent → away.
    const isHomeEvent = data.isHome ? !e.isOpponent : e.isOpponent;
    const bucket = grouped.get(e.period)!;
    (isHomeEvent ? bucket.home : bucket.away).push(e);
  }
  return grouped;
}

function LineupList({ heading, players }: { heading: string; players: PublishedLineupPlayerDto[] }) {
  if (players.length === 0) return null;
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {heading}
      </h2>
      <ol className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
        {players.map((p, i) => (
          <li key={i} className="flex items-center gap-3 py-1.5">
            {p.squadNumber != null && (
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-gray-400 dark:text-gray-500">
                {p.squadNumber}
              </span>
            )}
            <span className="flex-1 text-sm text-gray-900 dark:text-white">
              {p.firstName} {p.lastName}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EventRow({ event, opposition, align }: { event: MatchEvent; opposition: string; align: 'left' | 'right' }) {
  const isRight = align === 'right';

  if (event.kind === 'goal') {
    const goal = event.data;
    const name = goal.isOpponent
      ? (goal.opponentName?.trim() || opposition)
      : goal.scorerName;
    return (
      <div className={`flex items-center gap-2 py-1 ${isRight ? 'flex-row-reverse' : ''}`}>
        <span className="shrink-0 text-sm leading-none">⚽</span>
        <span className={`flex-1 text-sm text-gray-900 dark:text-white ${isRight ? 'text-right' : ''}`}>
          {name}
          {goal.isPenalty && (
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(pen)</span>
          )}
        </span>
        {goal.minute != null && (
          <span className="shrink-0 text-xs tabular-nums text-gray-400 dark:text-gray-500">
            {goal.minute}'
          </span>
        )}
      </div>
    );
  }

  const card = event.data;
  const isRed = card.type === 'red';
  const name = card.isOpponent
    ? (card.opponentName?.trim() || opposition)
    : card.playerName;
  return (
    <div className={`flex items-center gap-2 py-1 ${isRight ? 'flex-row-reverse' : ''}`}>
      <span className={`h-4 w-3 shrink-0 rounded-sm ${isRed ? 'bg-red-500' : 'bg-yellow-400'}`} />
      <span className={`flex-1 text-sm text-gray-900 dark:text-white ${isRight ? 'text-right' : ''}`}>
        {name}
      </span>
      {card.minute != null && (
        <span className="shrink-0 text-xs tabular-nums text-gray-400 dark:text-gray-500">
          {card.minute}'
        </span>
      )}
    </div>
  );
}

export default function SocialMatchReportPage() {
  const { matchId } = useParams();
  const { data, isLoading, error } = usePublishedMatchReport(matchId);

  const ogUrl = useMemo(() => {
    if (!matchId) return undefined;
    return `${window.location.origin}/social/match/${matchId}/report`;
  }, [matchId]);

  useSocialMetaTags({
    title: data?.ogTitle,
    description: data?.ogDescription,
    image: data?.ogImage,
    url: ogUrl,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700" />
        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="space-y-4">
            <div className="h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-lg border border-red-200 bg-white p-6 shadow dark:border-red-800 dark:bg-gray-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Match report unavailable
            </h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error?.message ?? 'Unable to load published report.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const primary = data.clubPrimaryColor ?? DEFAULT_PRIMARY;
  const secondary = data.clubSecondaryColor ?? DEFAULT_SECONDARY;
  const textColor = getContrastTextColor(primary) === 'white' ? '#ffffff' : '#000000';
  const subtleTextColor = getContrastTextColor(primary) === 'white'
    ? 'rgba(255,255,255,0.7)'
    : 'rgba(0,0,0,0.6)';

  const homeTeam = data.isHome ? data.teamName : data.opposition;
  const awayTeam = data.isHome ? data.opposition : data.teamName;

  const matchDateFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(data.matchDate));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Club-branded hero */}
      <header
        className="px-4 pb-8 pt-8"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}
      >
        <div className="mx-auto max-w-3xl">
          {/* Club identity row */}
          <div className="flex items-center gap-3">
            {data.clubLogo ? (
              <img
                src={data.clubLogo}
                alt={`${data.clubName} logo`}
                className="h-12 w-12 shrink-0 rounded object-contain"
              />
            ) : (
              <div
                className="h-12 w-12 shrink-0 rounded"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              />
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: subtleTextColor }}>
                {data.clubName}
              </p>
              <p className="text-sm font-medium" style={{ color: textColor }}>
                {data.teamName}
              </p>
            </div>
          </div>

          {/* Score */}
          <ScoreDisplay
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeScore={data.homeScore}
            awayScore={data.awayScore}
            isHome={data.isHome}
            textColor={textColor}
          />

          {/* Match meta */}
          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs"
            style={{ color: subtleTextColor }}
          >
            <span>{data.competition}</span>
            <span aria-hidden="true">·</span>
            <span>{matchDateFormatted}</span>
            <span aria-hidden="true">·</span>
            <span>{data.location}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        {/* Player of the match */}
        {data.playerOfMatchName && (
          <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            {data.playerOfMatchPhoto ? (
              <img
                src={data.playerOfMatchPhoto}
                alt={data.playerOfMatchName}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <span className="text-2xl">⭐</span>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Player of the match
              </p>
              <p className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">
                {data.playerOfMatchName}
              </p>
            </div>
          </div>
        )}

        {/* Events — two-column home / away layout */}
        {(() => {
          const grouped = buildEvents(data);
          if (grouped.size === 0) return null;
          // When our team is home: home col = us, away col = opposition. Flip when away.
          const homeLabel = data.isHome ? data.teamName : data.opposition;
          const awayLabel = data.isHome ? data.opposition : data.teamName;
          return (
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Events
              </h2>
              {Array.from(grouped.entries()).map(([period, { home, away }]) => {
                const maxRows = Math.max(home.length, away.length);
                if (maxRows === 0) return null;
                return (
                  <div key={period} className="mt-3">
                    <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                      {PERIOD_LABELS[period] ?? period}
                    </p>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {Array.from({ length: maxRows }, (_, i) => (
                        <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 py-0.5">
                          <div>
                            {home[i] && (
                              <EventRow
                                event={home[i]}
                                opposition={data.opposition}
                                align="left"
                              />
                            )}
                          </div>
                          <span className="h-full w-px self-stretch bg-gray-200 dark:bg-gray-600" />
                          <div>
                            {away[i] && (
                              <EventRow
                                event={away[i]}
                                opposition={data.opposition}
                                align="right"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Match summary */}
        {data.summary && (
          <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Match report
            </h2>
            <div className="prose prose-sm dark:prose-invert mt-3 max-w-none text-gray-700 dark:text-gray-300">
              <ReactMarkdown>{data.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Starting XI + Substitutes — side by side */}
        {((data.startingPlayers?.length ?? 0) > 0 || (data.substitutes?.length ?? 0) > 0) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
            <LineupList heading="Starting XI" players={data.startingPlayers ?? []} />
            <LineupList heading="Substitutes" players={data.substitutes ?? []} />
          </div>
        )}

        {/* Footer */}
        <p className="pb-2 text-center text-xs text-gray-400 dark:text-gray-600">
          Shared via{' '}
          <a
            href="/"
            className="underline hover:text-gray-600 dark:hover:text-gray-400"
          >
            OurGame
          </a>
        </p>
      </main>
    </div>
  );
}
