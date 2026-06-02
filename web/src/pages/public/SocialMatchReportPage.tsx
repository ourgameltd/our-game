import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { usePublishedMatchReport } from '@/api';
import { useSocialMetaTags } from '@/hooks/useSocialMetaTags';
import { getContrastTextColor } from '@utils/colorHelpers';
import type { PublishedGoalDto, PublishedCardDto, PublishedMatchReportDto } from '@/api/client';

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
  | { kind: 'goal'; period: string; minute?: number; data: PublishedGoalDto }
  | { kind: 'card'; period: string; minute?: number; data: PublishedCardDto };

function buildEvents(data: PublishedMatchReportDto): Map<string, MatchEvent[]> {
  const events: MatchEvent[] = [
    ...(data.goals ?? []).map(g => ({
      kind: 'goal' as const,
      period: g.period ?? 'first',
      minute: g.minute ?? undefined,
      data: g,
    })),
    ...(data.cards ?? []).map(c => ({
      kind: 'card' as const,
      period: c.period ?? 'first',
      minute: c.minute ?? undefined,
      data: c,
    })),
  ];

  events.sort((a, b) => {
    const pa = PERIOD_ORDER.indexOf(a.period);
    const pb = PERIOD_ORDER.indexOf(b.period);
    if (pa !== pb) return pa - pb;
    return (a.minute ?? 999) - (b.minute ?? 999);
  });

  const grouped = new Map<string, MatchEvent[]>();
  for (const e of events) {
    if (!grouped.has(e.period)) grouped.set(e.period, []);
    grouped.get(e.period)!.push(e);
  }
  return grouped;
}

function EventRow({ event }: { event: MatchEvent }) {
  if (event.kind === 'goal') {
    const goal = event.data;
    return (
      <div className="flex items-center gap-3 py-1.5">
        <span className="text-base leading-none">⚽</span>
        <span className="text-sm text-gray-900 dark:text-white">
          {goal.scorerName}
          {goal.isPenalty && (
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(pen)</span>
          )}
        </span>
        {goal.minute != null && (
          <span className="ml-auto text-xs tabular-nums text-gray-400 dark:text-gray-500">
            {goal.minute}'
          </span>
        )}
      </div>
    );
  }

  const card = event.data;
  const isRed = card.type === 'red';
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className={`h-4 w-3 shrink-0 rounded-sm ${isRed ? 'bg-red-500' : 'bg-yellow-400'}`} />
      <span className="text-sm text-gray-900 dark:text-white">{card.playerName}</span>
      {card.minute != null && (
        <span className="ml-auto text-xs tabular-nums text-gray-400 dark:text-gray-500">
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

        {/* Events */}
        {(() => {
          const grouped = buildEvents(data);
          if (grouped.size === 0) return null;
          return (
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Events
              </h2>
              {Array.from(grouped.entries()).map(([period, events]) => (
                <div key={period} className="mt-3">
                  <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {PERIOD_LABELS[period] ?? period}
                  </p>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {events.map((e, i) => <EventRow key={i} event={e} />)}
                  </div>
                </div>
              ))}
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
