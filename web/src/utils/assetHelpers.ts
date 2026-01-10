/**
 * Get the full URL for an asset in the public folder
 * This ensures the correct base path is used in production
 */
export function getAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // import.meta.env.BASE_URL already includes trailing slash
  return `${import.meta.env.BASE_URL}${cleanPath}`;
}
