/**
 * Open an external URL in a new browser context.
 *
 * Uses a programmatic anchor click rather than `window.open`. In an installed
 * (standalone) PWA, `window.open` is prone to spawning a lingering blank in-app
 * window that stays behind after the OS hands off to a native app (e.g. YouTube).
 * A real anchor click is the recommended pattern and lets modern iOS (16.4+)
 * hand off to the default browser cleanly.
 */
export function openExternalLink(url: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
}
