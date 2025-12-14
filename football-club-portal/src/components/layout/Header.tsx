import { Link, useLocation, matchPath } from 'react-router-dom';
import { getClubById } from '@data/clubs';
import { getTeamById } from '@data/teams';
import { getPlayerById } from '@data/players';
import { getAgeGroupById } from '@data/ageGroups';
import { getCoachById } from '@data/coaches';
import { ChevronRight, Home, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const location = useLocation();
  const { theme, setTheme, actualTheme } = useTheme();
  
  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };
  
  // Extract params from the current path using matchPath
  const clubMatch = matchPath('/clubs/:clubId/*', location.pathname);
  const ageGroupMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/*', location.pathname);
  const ageGroupTeamMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/*', location.pathname);
  const teamMatch = matchPath('/clubs/:clubId/teams/:teamId/*', location.pathname);
  const playerMatchAgeGroup = matchPath('/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/*', location.pathname);
  const playerMatchLegacy = matchPath('/clubs/:clubId/teams/:teamId/players/:playerId/*', location.pathname);
  const playerMatchDirect = matchPath('/clubs/:clubId/players/:playerId/*', location.pathname);
  const coachMatch = matchPath('/clubs/:clubId/coaches/:coachId/*', location.pathname);
  
  const clubId = clubMatch?.params.clubId;
  const ageGroupId = ageGroupMatch?.params.ageGroupId || ageGroupTeamMatch?.params.ageGroupId || playerMatchAgeGroup?.params.ageGroupId;
  const teamId = ageGroupTeamMatch?.params.teamId || teamMatch?.params.teamId || playerMatchAgeGroup?.params.teamId || playerMatchLegacy?.params.teamId;
  const playerId = playerMatchAgeGroup?.params.playerId || playerMatchLegacy?.params.playerId || playerMatchDirect?.params.playerId;
  const coachId = coachMatch?.params.coachId;

  const club = clubId ? getClubById(clubId) : null;
  const team = teamId ? getTeamById(teamId) : null;
  // Get age group either from URL or from team's ageGroupId
  const resolvedAgeGroupId = ageGroupId || team?.ageGroupId;
  const ageGroup = resolvedAgeGroupId ? getAgeGroupById(resolvedAgeGroupId) : null;
  const player = playerId ? getPlayerById(playerId) : null;
  const coach = coachId ? getCoachById(coachId) : null;

  // Build breadcrumbs based on current route
  const breadcrumbs: Array<{ label: string; path: string; icon?: any }> = [];

  // Start with Clubs list
  if (location.pathname === '/clubs') {
    breadcrumbs.push({
      label: 'My Clubs',
      path: '/clubs',
      icon: Home
    });
  } else if (location.pathname.includes('/formations')) {
    breadcrumbs.push({
      label: 'Formations Library',
      path: '/formations',
      icon: Home
    });
  } else if (location.pathname.includes('/training-sessions')) {
    breadcrumbs.push({
      label: 'Training Library',
      path: '/training-sessions',
      icon: Home
    });
  } else if (clubId && club) {
    // Club context - start with Clubs
    breadcrumbs.push({
      label: 'Clubs',
      path: '/clubs',
      icon: Home
    });

    breadcrumbs.push({
      label: club.name,
      path: `/clubs/${clubId}`
    });

    if (resolvedAgeGroupId) {
      if (ageGroup) {
        breadcrumbs.push({
          label: ageGroup.name,
          path: `/clubs/${clubId}/age-groups/${resolvedAgeGroupId}`
        });
      }

      if (teamId && team) {
        breadcrumbs.push({
          label: team.name,
          path: `/clubs/${clubId}/age-groups/${resolvedAgeGroupId}/teams/${teamId}`
        });
      }
    } else if (location.pathname.includes('/teams')) {
      // Legacy team hierarchy (for backwards compatibility)
      if (!teamId) {
        breadcrumbs.push({
          label: 'Teams',
          path: `/clubs/${clubId}/teams`
        });
      }

      if (teamId && team && ageGroup) {
        breadcrumbs.push({
          label: 'Teams',
          path: `/clubs/${clubId}/teams`
        });
        
        breadcrumbs.push({
          label: `${ageGroup.name} ${team.name}`,
          path: `/clubs/${clubId}/teams/${teamId}`
        });
      }
    }

    if (playerId && player) {
      if (!teamId) {
        breadcrumbs.push({
          label: 'Players',
          path: `/clubs/${clubId}/players`
        });
      }
      
      let playerBasePath = '';
      if (resolvedAgeGroupId && teamId) {
        playerBasePath = `/clubs/${clubId}/age-groups/${resolvedAgeGroupId}/teams/${teamId}/players/${playerId}`;
      } else if (teamId) {
        playerBasePath = `/clubs/${clubId}/teams/${teamId}/players/${playerId}`;
      } else {
        playerBasePath = `/clubs/${clubId}/players/${playerId}`;
      }
      
      breadcrumbs.push({
        label: `${player.firstName} ${player.lastName}`,
        path: playerBasePath
      });
    }

    if (coachId && coach) {
      breadcrumbs.push({
        label: 'Coaches',
        path: `/clubs/${clubId}/coaches`
      });
      
      breadcrumbs.push({
        label: `${coach.firstName} ${coach.lastName}`,
        path: `/clubs/${clubId}/coaches/${coachId}`
      });
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-primary-200 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 min-h-[60px]">
          {/* Logo Display - Shows Club or Team logo on the left */}
          {club && (
            <div className="flex-shrink-0">
              {team ? (
                <Link 
                  to={resolvedAgeGroupId 
                    ? `/clubs/${clubId}/age-groups/${resolvedAgeGroupId}/teams/${teamId}`
                    : `/clubs/${clubId}/teams/${teamId}`
                  }
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title={ageGroup ? `${ageGroup.name} - ${team.name}` : team.name}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ 
                      backgroundColor: team.colors?.primary || club?.colors.primary || '#6366F1',
                      color: team.colors?.primary === '#F3F4F6' ? '#1F2937' : '#FFFFFF'
                    }}
                  >
                    {team.shortName || team.name.substring(0, 3).toUpperCase()}
                  </div>
                </Link>
              ) : club.logo ? (
                <Link 
                  to={`/clubs/${clubId}`}
                  className="block hover:opacity-80 transition-opacity"
                  title={club.name}
                >
                  <img 
                    src={club.logo} 
                    alt={`${club.name} logo`}
                    className="w-12 h-12 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  />
                </Link>
              ) : (
                <Link 
                  to={`/clubs/${clubId}`}
                  className="block hover:opacity-80 transition-opacity"
                  title={club.name}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold text-white border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ backgroundColor: club.colors.primary }}
                  >
                    {club.shortName}
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 py-1">
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, index) => (
                <div key={`${crumb.path}-${index}`} className="flex items-center gap-2 flex-shrink-0">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  )}
                  <Link
                    to={crumb.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-all ${
                      index === breadcrumbs.length - 1
                        ? 'text-gray-900 dark:text-white font-semibold bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    title={crumb.label}
                  >
                    {crumb.icon && <crumb.icon className="w-4 h-4 flex-shrink-0" />}
                    <span className="whitespace-nowrap">
                      {crumb.label}
                    </span>
                  </Link>
                </div>
              ))
            ) : (
              <Link
                to="/clubs"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-all text-gray-900 dark:text-white font-semibold"
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">My Clubs</span>
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title={`Current theme: ${theme}${theme === 'system' ? ` (${actualTheme})` : ''}`}
            >
              {actualTheme === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Profile link */}
            <Link
              to="/profile"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="My Profile"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
