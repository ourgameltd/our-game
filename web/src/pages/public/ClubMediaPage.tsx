import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useClubPublicMedia } from '@/api';
import { useSocialMetaTags } from '@/hooks/useSocialMetaTags';

function getLinkLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

export default function ClubMediaPage() {
  const { clubId } = useParams();
  const { data, isLoading, error } = useClubPublicMedia(clubId);

  const ogUrl = useMemo(() => {
    if (!clubId) {
      return undefined;
    }

    return `${window.location.origin}/play/${clubId}/media`;
  }, [clubId]);

  useSocialMetaTags({
    title: data?.ogTitle,
    description: data?.ogDescription,
    image: data?.ogImage,
    url: ogUrl,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto max-w-4xl px-4 py-6">
          <div className="animate-pulse rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="h-7 w-56 rounded bg-gray-200 dark:bg-gray-700" />
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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Club media unavailable</h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error?.message ?? 'Unable to load media feed.'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            {data.clubLogo ? (
              <img src={data.clubLogo} alt={`${data.clubName} logo`} className="h-14 w-14 rounded object-contain" />
            ) : (
              <div className="h-14 w-14 rounded bg-gray-200 dark:bg-gray-700" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.clubName}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Media, reports, fixtures and clips</p>
            </div>
          </div>

          {data.clubEthos && (
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{data.clubEthos}</p>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Public media links</h2>
          {data.mediaLinks.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">No public media links have been published yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.mediaLinks.map(link => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded border border-gray-200 px-4 py-3 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{link.title || getLinkLabel(link.url)}</span>
                    <span className="ml-2 text-xs uppercase text-gray-500 dark:text-gray-400">{link.type}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 text-sm">
          <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">Back to OurGame</Link>
        </div>
      </main>
    </div>
  );
}
