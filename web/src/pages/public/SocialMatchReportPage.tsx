import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePublishedMatchReport } from '@/api';
import { useSocialMetaTags } from '@/hooks/useSocialMetaTags';

export default function SocialMatchReportPage() {
  const { matchId } = useParams();
  const { data, isLoading, error } = usePublishedMatchReport(matchId);

  const ogUrl = useMemo(() => {
    if (!matchId) {
      return undefined;
    }
    return `${window.location.origin}/social/match/${matchId}/report`;
  }, [matchId]);

  useSocialMetaTags({
    title: data?.ogTitle,
    description: data?.ogDescription,
    url: ogUrl,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto max-w-4xl px-4 py-6">
          <div className="animate-pulse rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="h-7 w-60 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-3 h-4 w-80 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto max-w-4xl px-4 py-6">
          <div className="rounded-lg border border-red-200 bg-white p-6 shadow dark:border-red-800 dark:bg-gray-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Match report unavailable</h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error?.message ?? 'Unable to load published report.'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.teamName} vs {data.opposition}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{data.clubName}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>📍 {data.location}</span>
            <span>•</span>
            <span>📅 {new Date(data.matchDate).toLocaleDateString()}</span>
            <span>•</span>
            <span>🏆 {data.competition}</span>
          </div>
          {data.homeScore !== undefined && data.awayScore !== undefined && (
            <div className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {data.homeScore} - {data.awayScore}
            </div>
          )}
          <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-700/30 dark:text-gray-300">
            {data.summary || 'No summary published for this match report yet.'}
          </div>
        </div>
      </main>
    </div>
  );
}
