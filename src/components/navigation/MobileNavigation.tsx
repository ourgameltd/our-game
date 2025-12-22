import { useState, useEffect } from 'react';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { 
  Users, 
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Bell,
  User,
  Moon,
  Sun,
  Shield,
  FileText,
  Shirt,
  UserCircle
} from 'lucide-react';
import { getClubById } from '@data/clubs';
import { getTeamById } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { getPlayerById } from '@data/players';
import { getCoachById } from '@data/coaches';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/contexts/NavigationContext';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDesktopOpen, toggleDesktopNav } = useNavigation();
  const location = useLocation();
  const { theme, setTheme, actualTheme } = useTheme();
  
  // Extract params from current path
  const clubMatch = matchPath('/clubs/:clubId/*', location.pathname);
  const ageGroupMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/*', location.pathname);
  const teamMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/*', location.pathname);
  const playerMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/players/:playerId/*', location.pathname);
  const teamPlayerMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/*', location.pathname);
  const ageGroupCoachMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/coaches/:coachId/*', location.pathname);
  const teamCoachMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/coaches/:coachId/*', location.pathname);

  const clubId = clubMatch?.params.clubId;
  const ageGroupId = ageGroupMatch?.params.ageGroupId || teamMatch?.params.ageGroupId || playerMatch?.params.ageGroupId || teamPlayerMatch?.params.ageGroupId || ageGroupCoachMatch?.params.ageGroupId || teamCoachMatch?.params.ageGroupId;
  const teamId = teamMatch?.params.teamId || teamPlayerMatch?.params.teamId || teamCoachMatch?.params.teamId;
  const playerId = playerMatch?.params.playerId || teamPlayerMatch?.params.playerId;
  const coachId = ageGroupCoachMatch?.params.coachId || teamCoachMatch?.params.coachId;

  const club = clubId ? getClubById(clubId) : null;
  const team = teamId ? getTeamById(teamId) : null;
  const ageGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;
  const player = playerId ? getPlayerById(playerId) : null;
  const coach = coachId ? getCoachById(coachId) : undefined;

  // Determine which level we're currently at
  const currentLevel = playerId ? 'player' : coachId ? 'coach' : teamId ? 'team' : ageGroupId ? 'ageGroup' : clubId ? 'club' : 'clubs';

  // Close menu when route changes (mobile only)
  useEffect(() => {
    setIsOpen(false);
    // Only lock body scroll on mobile
    if (window.innerWidth < 1024) {
      document.body.style.overflow = '';
    }
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Only lock body scroll on mobile
    if (window.innerWidth < 1024) {
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    }
  };

  const handleHamburgerClick = () => {
    if (window.innerWidth >= 1024) {
      // Desktop: toggle the persistent drawer
      toggleDesktopNav();
    } else {
      // Mobile: toggle the overlay drawer
      toggleMenu();
    }
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-nav-header">
        <button 
          className="mobile-nav-hamburger"
          onClick={handleHamburgerClick}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        </button>

        {/* Center Logo Display - Club or Team */}
        <div className="mobile-nav-center-logo">
          {team ? (
            <div className="flex items-center gap-2 max-w-full overflow-hidden">
              {/* Club Logo */}
              <Link to={`/clubs/${clubId}`} className="flex items-center flex-shrink-0">
                {club?.logo ? (
                  <img 
                    src={club.logo} 
                    alt={`${club.name} logo`}
                    className="w-8 h-8 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                  />
                ) : club ? (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: club.colors.primary }}
                  >
                    {club.shortName}
                  </div>
                ) : null}
              </Link>
              
              {/* Separator */}
              <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">&gt;</span>
              
              {/* Age Group Link */}
              {ageGroup && (
                <>
                  <Link 
                    to={`/clubs/${clubId}/age-groups/${ageGroupId}`}
                    className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 truncate"
                  >
                    {ageGroup.name}
                  </Link>
                  
                  {/* Separator */}
                  <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">&gt;</span>
                  
                  {/* Team Badge */}
                  <Link 
                    to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`}
                    className="flex items-center flex-shrink-0"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border border-gray-300 dark:border-gray-600"
                      style={{ 
                        backgroundColor: team.colors?.primary || club?.colors.primary || '#6366F1',
                        color: team.colors?.primary === '#F3F4F6' ? '#1F2937' : '#FFFFFF'
                      }}
                    >
                      {team.shortName || team.name.substring(0, 3).toUpperCase()}
                    </div>
                  </Link>
                </>
              )}
              
            </div>
          ) : ageGroup ? (
            <div className="flex items-center gap-2 max-w-full overflow-hidden">
              {/* Club Logo */}
              <Link to={`/clubs/${clubId}`} className="flex items-center flex-shrink-0">
                {club?.logo ? (
                  <img 
                    src={club.logo} 
                    alt={`${club.name} logo`}
                    className="w-8 h-8 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                  />
                ) : club ? (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: club.colors.primary }}
                  >
                    {club.shortName}
                  </div>
                ) : null}
              </Link>
              
              {/* Separator */}
              <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">&gt;</span>
              
              {/* Age Group Link */}
              <Link 
                to={`/clubs/${clubId}/age-groups/${ageGroupId}`}
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 truncate"
              >
                {ageGroup.name}
              </Link>
            </div>
          ) : club ? (
            <Link to={`/clubs/${clubId}`} className="flex items-center gap-2 max-w-full overflow-hidden">
              {club.logo ? (
                <img 
                  src={club.logo} 
                  alt={`${club.name} logo`}
                  className="w-10 h-10 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                  style={{ backgroundColor: club.colors.primary }}
                >
                  {club.shortName}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {club.shortName}
              </span>
            </Link>
          ) : (
            <Link to="/clubs" className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              My Clubs
            </Link>
          )}
        </div>

        <div className="mobile-nav-actions">
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400"
            aria-label="Toggle theme"
          >
            {actualTheme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <Link to="/notifications" className="mobile-nav-notification-btn" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="mobile-nav-notification-badge">3</span>
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Navigation Drawer */}
      <div className={`mobile-nav-drawer ${isOpen ? 'open' : ''} ${isDesktopOpen ? 'lg:open' : ''}`}>
        <div className="mobile-nav-drawer-header">
          <div className="mobile-nav-user-profile">
            <div className="mobile-nav-user-avatar-wrapper">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mobile-nav-user-info">
              <span className="mobile-nav-user-name">John Doe</span>
              <span className="mobile-nav-user-role">Coach</span>
            </div>
          </div>
          <button 
            className="mobile-nav-close lg:hidden"
            onClick={toggleMenu}
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mobile-nav-drawer-content">
          {/* Hierarchical Navigation */}
          <ul className="mobile-nav-menu">
            {/* Show "My Clubs" only if not in a club, or as a back link */}
            {!clubId && (
              <li className="mobile-nav-item">
                <Link 
                  to="/clubs" 
                  className={`mobile-nav-link ${isActive('/clubs') ? 'active' : ''}`}
                >
                  <Trophy className="mobile-nav-icon" />
                  <span className="mobile-nav-text">My Clubs</span>
                </Link>
              </li>
            )}

            {/* Age Group Level - Show full options only if we're at age group level */}
            {ageGroup && currentLevel === 'ageGroup' && (
              <li className="mobile-nav-item">
                <div>
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {ageGroup.name}
                    </h3>
                  </div>
                  <ul>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Teams</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/players`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/players`) ? 'active' : ''}`}
                      >
                        <UserCircle className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Players</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/coaches`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/coaches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Coaches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/matches`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/matches`) ? 'active' : ''}`}
                      >
                        <Trophy className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Matches</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}

            {/* Club Level - Show full options only if we're at club level or below */}
            {club && currentLevel === 'club' && (
              <li className="mobile-nav-item">
                <div>
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      {club.logo ? (
                        <img 
                          src={club.logo} 
                          alt={`${club.name} logo`}
                          className="w-4 h-4 rounded object-cover"
                        />
                      ) : (
                        <Trophy className="w-4 h-4" />
                      )}
                      {club.shortName}
                    </h3>
                  </div>
                  <ul>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}`) ? 'active' : ''}`}
                      >
                        <Trophy className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Age Groups</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/players`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/players`) ? 'active' : ''}`}
                      >
                        <UserCircle className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Players</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/coaches`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/coaches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Coaches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/matches`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/matches`) ? 'active' : ''}`}
                      >
                        <Trophy className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Matches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/ethos`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/ethos`) ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Ethos</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/kits`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/kits`) ? 'active' : ''}`}
                      >
                        <Shirt className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Kits</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}

            {/* Player Level - Show full options only if we're at player level */}
            {player && currentLevel === 'player' && (
              <li className="mobile-nav-item">
                <div>
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      {player.firstName} {player.lastName}
                    </h3>
                  </div>
                  <ul>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}`
                          : `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}`)
                            : isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}`)
                        } ? 'active' : ''}`}
                      >
                        <UserCircle className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/abilities`
                          : `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/abilities`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/abilities`)
                            : isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/abilities`)
                        } ? 'active' : ''}`}
                      >
                        <Trophy className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Abilities</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/development-plans`
                          : `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/development`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/development-plans`)
                            : isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/development`)
                        } ? 'active' : ''}`}
                      >
                        <Trophy className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Development</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/report-card`
                          : `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/report-card`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/report-card`)
                            : isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/report-card`)
                        } ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Report Card</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/album`
                          : `/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/album`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/album`)
                            : isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/players/${playerId}/album`)
                        } ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Album</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}

            {/* Coach Level - Show full options only if we're at coach level */}
            {coach && currentLevel === 'coach' && (
              <li className="mobile-nav-item">
                <div>
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {coach.firstName} {coach.lastName}
                    </h3>
                  </div>
                  <ul>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches/${coachId}`
                          : `/clubs/${clubId}/age-groups/${ageGroupId}/coaches/${coachId}`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches/${coachId}`)
                            : isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/coaches/${coachId}`)
                        } ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}

            {/* Team Level - Show full options only if we're at team level */}
            {team && currentLevel === 'team' && (
              <li className="mobile-nav-item">
                <div>
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded flex items-center justify-center text-[6px] font-bold"
                        style={{ 
                          backgroundColor: team.colors?.primary || club?.colors.primary || '#6366F1',
                          color: team.colors?.primary === '#F3F4F6' ? '#1F2937' : '#FFFFFF'
                        }}
                      >
                        {team.shortName || team.name.substring(0, 2).toUpperCase()}
                      </div>
                      {team.name}
                    </h3>
                  </div>
                  <ul>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/squad`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/squad`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Players</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Coaches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches`) ? 'active' : ''}`}
                      >
                        <Trophy className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Matches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/kits`}
                        className={`mobile-nav-link ${isActive(`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/kits`) ? 'active' : ''}`}
                      >
                        <Shirt className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Kits</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}
          </ul>

          {/* Breadcrumb navigation to parent levels */}
          {(clubId || ageGroupId || teamId) && (
            <>
              <div className="mobile-nav-divider"></div>
              <div className="px-6 py-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Navigate To
                </h3>
              </div>
              <ul className="mobile-nav-menu">
                <li className="mobile-nav-item">
                  <Link 
                    to="/clubs" 
                    className="mobile-nav-link"
                  >
                    <Trophy className="mobile-nav-icon" />
                    <span className="mobile-nav-text">All Clubs</span>
                  </Link>
                </li>
                {clubId && currentLevel !== 'club' && currentLevel !== 'clubs' && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={`/clubs/${clubId}`}
                      className="mobile-nav-link"
                    >
                      {club?.logo ? (
                        <img 
                          src={club.logo} 
                          alt={`${club.name} logo`}
                          className="w-5 h-5 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                        />
                      ) : (
                        <Trophy className="mobile-nav-icon" />
                      )}
                      <span className="mobile-nav-text">{club?.shortName}</span>
                    </Link>
                  </li>
                )}
                {ageGroupId && currentLevel !== 'ageGroup' && currentLevel !== 'clubs' && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={`/clubs/${clubId}/age-groups/${ageGroupId}`}
                      className="mobile-nav-link"
                    >
                      <Users className="mobile-nav-icon" />
                      <span className="mobile-nav-text">{ageGroup?.name}</span>
                    </Link>
                  </li>
                )}
                {teamId && currentLevel !== 'clubs' && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`}
                      className="mobile-nav-link"
                    >
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                        style={{ 
                          backgroundColor: team?.colors?.primary || club?.colors.primary || '#6366F1',
                          color: team?.colors?.primary === '#F3F4F6' ? '#1F2937' : '#FFFFFF'
                        }}
                      >
                        {team?.shortName || team?.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="mobile-nav-text">{team?.name}</span>
                    </Link>
                  </li>
                )}
              </ul>
            </>
          )}

          <div className="mobile-nav-divider"></div>

          {/* Secondary Navigation */}
          <ul className="mobile-nav-menu mobile-nav-menu-secondary">
            <li className="mobile-nav-item">
              <Link 
                to="/profile" 
                className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <Settings className="mobile-nav-icon" />
                <span className="mobile-nav-text">Profile & Settings</span>
              </Link>
            </li>

            <li className="mobile-nav-item">
              <button
                onClick={toggleTheme}
                className="mobile-nav-link"
              >
                {actualTheme === 'dark' ? (
                  <Moon className="mobile-nav-icon" />
                ) : (
                  <Sun className="mobile-nav-icon" />
                )}
                <span className="mobile-nav-text">
                  Theme: {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </button>
            </li>

            <li className="mobile-nav-item">
              <Link 
                to="/help" 
                className="mobile-nav-link"
              >
                <HelpCircle className="mobile-nav-icon" />
                <span className="mobile-nav-text">Help & Support</span>
              </Link>
            </li>

            <li className="mobile-nav-item">
              <Link 
                to="/login" 
                className="mobile-nav-link text-red-600 dark:text-red-400"
              >
                <LogOut className="mobile-nav-icon" />
                <span className="mobile-nav-text">Logout</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}