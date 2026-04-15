export type LinkProvider = 'youtube' | 'instagram' | 'tiktok' | 'website' | 'other';

function parseUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

export function detectLinkProvider(input: string): LinkProvider | null {
  const parsed = parseUrl(input);
  if (!parsed) {
    return null;
  }

  const host = parsed.hostname.toLowerCase();

  if (host.includes('youtube.com') || host.includes('youtu.be')) {
    return 'youtube';
  }

  if (host.includes('instagram.com')) {
    return 'instagram';
  }

  if (host.includes('tiktok.com')) {
    return 'tiktok';
  }

  if (host) {
    return 'website';
  }

  return 'other';
}

export function isModalProvider(provider: string): boolean {
  return provider === 'youtube';
}

function extractYouTubeVideoId(parsed: URL): string | null {
  const host = parsed.hostname.toLowerCase();
  const pathParts = parsed.pathname.split('/').filter(Boolean);

  if (host.includes('youtu.be') && pathParts.length > 0) {
    return pathParts[0];
  }

  if (host.includes('youtube.com')) {
    const watchId = parsed.searchParams.get('v');
    if (watchId) {
      return watchId;
    }

    if (pathParts[0] === 'embed' && pathParts[1]) {
      return pathParts[1];
    }

    if (pathParts[0] === 'shorts' && pathParts[1]) {
      return pathParts[1];
    }
  }

  return null;
}

export function buildYouTubeEmbedUrl(input: string): string | null {
  const parsed = parseUrl(input);
  if (!parsed) {
    return null;
  }

  const videoId = extractYouTubeVideoId(parsed);
  if (!videoId) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}`;
}
