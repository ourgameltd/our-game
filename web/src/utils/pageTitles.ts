export const APP_TITLE_SUFFIX = 'Our Game';

function toTitle(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\bAdd Edit\b/g, 'Add/Edit')
    .trim();
}

export function formatTitle(parts: Array<string | null | undefined>): string {
  const normalized = parts
    .map(part => (part ?? '').trim())
    .filter(part => part.length > 0)
    .map(toTitle);

  if (normalized.length === 0) {
    return APP_TITLE_SUFFIX;
  }

  return `${normalized.join(' - ')} | ${APP_TITLE_SUFFIX}`;
}

function getDashboardPageLabel(segments: string[]): string {
  if (segments.length <= 1) {
    return 'Overview';
  }

  const last = segments[segments.length - 1];
  const previous = segments[segments.length - 2];

  if (segments.includes('ethos')) return 'Ethos';
  if (segments.includes('kits')) return 'Kits';

  if (segments.includes('tactics')) {
    if (last === 'new') return 'New Tactic';
    if (last === 'edit') return 'Edit Tactic';
    if (last === 'tactics') return 'Tactics';
    return 'Tactic Detail';
  }

  if (segments.includes('drill-templates')) {
    if (last === 'new') return 'New Session';
    if (last === 'edit') return 'Edit Session';
    if (last === 'drill-templates') return 'Sessions';
    return 'Session';
  }

  if (segments.includes('drills')) {
    if (last === 'new') return 'New Drill';
    if (last === 'edit') return 'Edit Drill';
    if (last === 'drills') return 'Drills';
    return 'Drill';
  }

  if (segments.includes('report-cards')) {
    if (last === 'new') return 'New Report Card';
    if (last === 'edit') return 'Edit Report Card';
    if (last === 'report-cards') return 'Report Cards';
    return 'Report Card';
  }

  if (segments.includes('development-plans')) {
    if (last === 'new') return 'New Development Plan';
    if (last === 'edit') return 'Edit Development Plan';
    if (last === 'development-plans') return 'Development Plans';
    return 'Development Plan';
  }

  if (segments.includes('matches')) {
    if (last === 'new') return 'New Match';
    if (last === 'edit') return 'Edit Match';
    if (last === 'matches') return 'Matches';
    return 'Match Report';
  }

  if (segments.includes('training')) {
    if (last === 'new') return 'New Training Session';
    if (last === 'edit') return 'Edit Training Session';
    return 'Training Sessions';
  }

  if (segments.includes('players')) {
    if (last === 'settings') return 'Player Settings';
    if (last === 'album') return 'Player Album';
    if (last === 'abilities') return 'Player Abilities';
    if (last === 'report-card') return 'Report Card';
    if (last === 'players') return segments.includes('teams') ? 'Squad' : 'Players';
    return 'Player Profile';
  }

  if (segments.includes('coaches')) {
    if (last === 'settings') return 'Coach Settings';
    if (last === 'coaches') return 'Coaches';
    return 'Coach Profile';
  }

  if (segments.includes('teams')) {
    if (last === 'teams') return 'Teams';
    if (last === 'new') return 'New Team';
    if (last === 'edit') return 'Edit Team';
    if (last === 'squad') return 'Squad';
    if (last === 'coaches') return 'Coaches';
    if (last === 'kits') return 'Kits';
    if (last === 'settings') return 'Team Settings';
    return 'Team Overview';
  }

  if (segments.includes('age-groups')) {
    if (last === 'age-groups') return 'Age Groups';
    if (last === 'new') return 'New Age Group';
    if (last === 'edit') return 'Edit Age Group';
    if (last === 'settings') return 'Age Group Settings';
    return 'Age Group Overview';
  }

  if (last === 'settings') return 'Settings';
  if (last === 'players') return 'Players';
  if (last === 'coaches') return 'Coaches';
  if (last === 'matches') return 'Matches';
  if (last === 'training') return 'Training Sessions';
  if (last === 'report-cards') return 'Report Cards';
  if (last === 'development-plans') return 'Development Plans';

  if (previous === 'dashboard') {
    return 'Overview';
  }

  return 'Overview';
}

function getDashboardContextParts(segments: string[]): string[] {
  const contextParts: string[] = [];
  const hasClubContext = segments.length >= 1;
  const ageGroupIndex = segments.indexOf('age-groups');
  const hasAgeGroupContext = ageGroupIndex >= 0 && Boolean(segments[ageGroupIndex + 1]);
  const teamIndex = segments.indexOf('teams');
  const hasTeamContext = teamIndex >= 0 && Boolean(segments[teamIndex + 1]);

  if (hasClubContext) contextParts.push('Club');
  if (hasAgeGroupContext) contextParts.push('Age Group');
  if (hasTeamContext) contextParts.push('Team');

  return contextParts;
}

function getDashboardPathSegments(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  const dashboardIndex = segments.indexOf('dashboard');
  return dashboardIndex >= 0 ? segments.slice(dashboardIndex + 1) : [];
}

export function getRouteContextParts(pathname: string): string[] {
  if (!pathname.startsWith('/dashboard')) {
    return [];
  }

  const dashboardSegments = getDashboardPathSegments(pathname);
  return getDashboardContextParts(dashboardSegments);
}

export function getRoutePageLabel(pathname: string): string {
  if (pathname === '/') return 'Home';
  if (pathname === '/login') return 'Login';
  if (pathname === '/register') return 'Register';
  if (pathname === '/password-reset') return 'Password Reset';
  if (pathname === '/profile') return 'Profile';
  if (pathname === '/notifications') return 'Notifications';
  if (pathname === '/help') return 'Help and Support';

  if (pathname.startsWith('/dashboard')) {
    const dashboardSegments = getDashboardPathSegments(pathname);

    if (dashboardSegments.length === 0) {
      return 'Dashboard';
    }

    return getDashboardPageLabel(dashboardSegments);
  }

  return APP_TITLE_SUFFIX;
}

function getDashboardFallbackTitle(pathname: string): string {
  const afterDashboard = getDashboardPathSegments(pathname);

  if (afterDashboard.length === 0) {
    return formatTitle(['Dashboard']);
  }

  const contextParts = getDashboardContextParts(afterDashboard);

  const pageLabel = getDashboardPageLabel(afterDashboard);

  return formatTitle([...contextParts, pageLabel]);
}

export function getRouteFallbackTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard')) {
    return getDashboardFallbackTitle(pathname);
  }

  const pageLabel = getRoutePageLabel(pathname);
  if (pageLabel === APP_TITLE_SUFFIX) {
    return formatTitle([APP_TITLE_SUFFIX]);
  }

  return formatTitle([pageLabel]);
}
