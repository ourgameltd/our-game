import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicPost, ClubPostType } from '@/api';

// -- Constants ----------------------------------------------------------------

const POST_TYPE_LABELS: Record<ClubPostType, string> = {
  match_report: 'Match Report',
  player_spotlight: 'Player Spotlight',
  upcoming_fixture: 'Upcoming Fixture',
  result: 'Result',
  clip: 'Clip',
};

const POST_TYPE_COLORS: Record<ClubPostType, string> = {
  match_report: 'bg-blue-100 text-blue-800',
  player_spotlight: 'bg-green-100 text-green-800',
  upcoming_fixture: 'bg-yellow-100 text-yellow-800',
  result: 'bg-purple-100 text-purple-800',
  clip: 'bg-orange-100 text-orange-800',
};

// -- OG Meta Helpers ----------------------------------------------------------

function setMetaTag(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
             ?? document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(property.startsWith('og:') || property.startsWith('article:') ? 'property' : 'name', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMetaTag(property: string) {
  const el = document.querySelector(`meta[property="${property}"]`)
             ?? document.querySelector(`meta[name="${property}"]`);
  if (el) el.remove();
}

// -- Skeletons ----------------------------------------------------------------

function PostSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-gray-200 rounded-full" />
        <div className="h-5 bg-gray-200 rounded w-32" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-5 bg-gray-200 rounded w-24" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="h-10 bg-gray-200 rounded w-32" />
    </div>
  );
}

// -- Main Page ----------------------------------------------------------------

export default function PublicPostPage() {
  const { postId } = useParams();
  const { data: post, isLoading, error } = usePublicPost(postId);

  // Track which meta tags we added so we can clean them up
  const addedTags = useRef<string[]>([]);

  useEffect(() => {
    if (!post) return;

    const tags: [string, string][] = [
      ['og:title', post.title],
      ['og:description', post.description ?? ''],
      ['og:url', window.location.href],
      ['og:type', 'article'],
      ['og:site_name', 'OurGame'],
      ['twitter:title', post.title],
      ['twitter:description', post.description ?? ''],
    ];

    if (post.imageUrl) {
      tags.push(['og:image', post.imageUrl]);
      tags.push(['twitter:image', post.imageUrl]);
      tags.push(['twitter:card', 'summary_large_image']);
    } else {
      tags.push(['twitter:card', 'summary']);
    }

    // Set document title
    document.title = `${post.title} | OurGame`;

    // Set all meta tags
    const tagNames = tags.map(([prop]) => prop);
    addedTags.current = tagNames;
    for (const [prop, content] of tags) {
      setMetaTag(prop, content);
    }

    // Cleanup on unmount
    return () => {
      for (const prop of addedTags.current) {
        removeMetaTag(prop);
      }
      document.title = 'OurGame';
    };
  }, [post]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <PostSkeleton />
        </div>
      </div>
    );
  }

  // Error / not found state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-500">
            {error?.message ?? 'This post may have been removed or is no longer available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-start justify-center pt-12 pb-16 px-4">
      <div className="w-full max-w-2xl">
        {/* Club branding */}
        <div className="flex items-center gap-3 mb-8">
          {post.clubLogo ? (
            <img
              src={post.clubLogo}
              alt={`${post.clubName} logo`}
              className="h-12 w-12 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: post.clubPrimaryColor ?? '#1a472a' }}
            >
              {post.clubName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-lg font-semibold text-gray-700">{post.clubName}</span>
        </div>

        {/* Post title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Type badge + date */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${POST_TYPE_COLORS[post.postType]}`}>
            {POST_TYPE_LABELS[post.postType]}
          </span>
          <span className="text-sm text-gray-400">
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full rounded-xl mb-6 border border-gray-100"
          />
        )}

        {/* Description */}
        {post.description && (
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line mb-8">
            {post.description}
          </p>
        )}

        {/* External link button */}
        {post.externalUrl && (
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Visit Link
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        {/* Footer branding */}
        <div className="mt-16 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            Shared via <span className="font-semibold text-gray-500">OurGame</span>
          </p>
        </div>
      </div>
    </div>
  );
}
