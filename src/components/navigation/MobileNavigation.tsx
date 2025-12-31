import { useState, useEffect } from 'react';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { 
  Users, 
  Home,
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
  UserCircle,
  ChevronsRight,
  ChevronsLeft
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
  const clubMatch = matchPath('/dashboard/:clubId/*', location.pathname);
  const ageGroupMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/*', location.pathname);
  const teamMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/*', location.pathname);
  const playerMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/*', location.pathname);
  const teamPlayerMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/*', location.pathname);
  const ageGroupCoachMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/coaches/:coachId/*', location.pathname);
  const teamCoachMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/coaches/:coachId/*', location.pathname);
  const teamMatchesMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/*', location.pathname);
  const teamTrainingMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/training/*', location.pathname);
  const ageGroupMatchesMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/matches/*', location.pathname);
  const ageGroupTrainingMatch = matchPath('/dashboard/:clubId/age-groups/:ageGroupId/training/*', location.pathname);

  const clubId = clubMatch?.params.clubId;
  const ageGroupId = ageGroupMatch?.params.ageGroupId || teamMatch?.params.ageGroupId || playerMatch?.params.ageGroupId || teamPlayerMatch?.params.ageGroupId || ageGroupCoachMatch?.params.ageGroupId || teamCoachMatch?.params.ageGroupId || teamMatchesMatch?.params.ageGroupId || teamTrainingMatch?.params.ageGroupId || ageGroupMatchesMatch?.params.ageGroupId || ageGroupTrainingMatch?.params.ageGroupId;
  const teamId = teamMatch?.params.teamId || teamPlayerMatch?.params.teamId || teamCoachMatch?.params.teamId || teamMatchesMatch?.params.teamId || teamTrainingMatch?.params.teamId;
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

  // Get current page title and associated image
  const getPageInfo = () => {
    const path = location.pathname;
    
    // Player pages
    if (player) {
      if (path.includes('/development')) return { title: 'Player Development', image: player.photo };
      if (path.includes('/album')) return { title: 'Photo Album', image: player.photo };
      if (path.includes('/settings')) return { title: 'Player Settings', image: player.photo };
      return { title: `${player.firstName} ${player.lastName}`, image: player.photo };
    }
    
    // Coach pages
    if (coach) {
      if (path.includes('/settings')) return { title: 'Coach Settings', image: coach.photo };
      return { title: `${coach.firstName} ${coach.lastName}`, image: coach.photo };
    }
    
    // Team pages
    if (team) {
      if (path.includes('/squad')) return { title: 'Squad Management', image: null };
      if (path.includes('/matches')) return { title: 'Matches', image: null };
      if (path.includes('/training')) return { title: 'Training', image: null };
      if (path.includes('/kit')) return { title: 'Kit Orders', image: null };
      if (path.includes('/tactics')) return { title: 'Tactics', image: null };
      if (path.includes('/formations')) return { title: 'Formations', image: null };
      if (path.includes('/settings')) return { title: 'Team Settings', image: null };
      if (path.includes('/coaches')) return { title: 'Coaches', image: null };
      return { title: team.name, image: null };
    }
    
    // Age Group pages
    if (ageGroup) {
      if (path.includes('/teams')) return { title: 'Teams', image: null };
      if (path.includes('/players')) return { title: 'Players', image: null };
      if (path.includes('/coaches')) return { title: 'Coaches', image: null };
      if (path.includes('/matches')) return { title: 'Matches', image: null };
      if (path.includes('/training')) return { title: 'Training', image: null };
      if (path.includes('/tactics')) return { title: 'Tactics', image: null };
      if (path.includes('/settings')) return { title: 'Age Group Settings', image: null };
      return { title: ageGroup.name, image: null };
    }
    
    // Club pages
    if (club) {
      if (path.includes('/age-groups')) return { title: 'Age Groups', image: club.logo };
      if (path.includes('/players')) return { title: 'Players', image: club.logo };
      if (path.includes('/coaches')) return { title: 'Coaches', image: club.logo };
      if (path.includes('/ethos')) return { title: 'Club Ethos', image: club.logo };
      if (path.includes('/kit')) return { title: 'Kit Management', image: club.logo };
      if (path.includes('/tactics')) return { title: 'Tactics', image: club.logo };
      if (path.includes('/settings')) return { title: 'Club Settings', image: club.logo };
      return { title: club.name, image: club.logo };
    }
    
    // Top-level pages
    if (path.includes('/profile')) return { title: 'My Profile', image: null };
    if (path.includes('/notifications')) return { title: 'Notifications', image: null };
    if (path.includes('/help')) return { title: 'Help & Support', image: null };
    if (path === '/clubs') return { title: 'My Clubs', image: null };
    
    return { title: 'Dashboard', image: null };
  };

  const pageInfo = getPageInfo();

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-nav-header lg:pl-[280px]">
        {/* Mobile hamburger for overlay menu */}
        <button 
          className="mobile-nav-hamburger lg:hidden"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        </button>

        {/* Center Page Title Display */}
        <div className="mobile-nav-center-logo">
          <div className="flex items-center gap-3 max-w-full overflow-hidden">
            {pageInfo.image && (
              <img 
                src={pageInfo.image} 
                alt={pageInfo.title}
                className="w-10 h-10 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
              />
            )}
            <span className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {pageInfo.title}
            </span>
          </div>
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
        {/* Collapse Bar for Desktop */}
        <button
          className="nav-collapse-bar hidden lg:flex"
          onClick={toggleDesktopNav}
          aria-label={isDesktopOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isDesktopOpen ? (
            <ChevronsLeft className="w-5 h-5" />
          ) : (
            <ChevronsRight className="w-5 h-5" />
          )}
        </button>

        <div className="mobile-nav-drawer-header">
          <Link to="/profile" className="mobile-nav-user-profile hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <div className="mobile-nav-user-avatar-wrapper">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mobile-nav-user-info">
              <span className="mobile-nav-user-name">John Doe</span>
              <span className="mobile-nav-user-role">Coach</span>
            </div>
          </Link>
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
            {/* Show "Dashboard" only if not in a club, or as a back link */}
            {!clubId && (
              <li className="mobile-nav-item">
                <Link 
                  to="/dashboard" 
                  className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  <Home className="mobile-nav-icon" />
                  <span className="mobile-nav-text">Dashboard</span>
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
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Teams</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/players`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/players`) ? 'active' : ''}`}
                      >
                        <UserCircle className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Players</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/coaches`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/coaches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Coaches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/matches`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/matches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Matches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/training`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/training`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Training</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/tactics`}
                        className={`mobile-nav-link ${location.pathname.includes(`/dashboard/${clubId}/age-groups/${ageGroupId}/tactics`) ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Tactics</span>
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
                        <Shield className="w-4 h-4" />
                      )}
                      {club.shortName}
                    </h3>
                  </div>
                  <ul>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Age Groups</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/players`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/players`) ? 'active' : ''}`}
                      >
                        <UserCircle className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Players</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/coaches`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/coaches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Coaches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/matches`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/matches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Matches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/ethos`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/ethos`) ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Ethos</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/kits`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/kits`) ? 'active' : ''}`}
                      >
                        <Shirt className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Kits</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/tactics`}
                        className={`mobile-nav-link ${location.pathname.includes(`/dashboard/${clubId}/tactics`) ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Tactics</span>
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
                          ? `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}`
                          : `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}`)
                            : isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}`)
                        } ? 'active' : ''}`}
                      >
                        <UserCircle className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/abilities`
                          : `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/abilities`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/abilities`)
                            : isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/abilities`)
                        } ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Abilities</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/development-plans`
                          : `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/development`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/development-plans`)
                            : isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/development`)
                        } ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Development</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/report-card`
                          : `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/report-card`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/report-card`)
                            : isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/report-card`)
                        } ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Report Card</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={teamId 
                          ? `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/album`
                          : `/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/album`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/players/${playerId}/album`)
                            : isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/players/${playerId}/album`)
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
                          ? `/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches/${coachId}`
                          : `/dashboard/${clubId}/age-groups/${ageGroupId}/coaches/${coachId}`
                        }
                        className={`mobile-nav-link ${
                          teamId 
                            ? isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches/${coachId}`)
                            : isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/coaches/${coachId}`)
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
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Overview</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/squad`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/squad`) ? 'active' : ''}`}
                      >
                        <Users className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Players</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Coaches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches`) ? 'active' : ''}`}
                      >
                        <Shield className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Matches</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/training`}
                        className={`mobile-nav-link ${location.pathname.includes(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/training`) ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Training</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/kits`}
                        className={`mobile-nav-link ${isActive(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/kits`) ? 'active' : ''}`}
                      >
                        <Shirt className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Kits</span>
                      </Link>
                    </li>
                    <li className="mobile-nav-item">
                      <Link 
                        to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics`}
                        className={`mobile-nav-link ${location.pathname.includes(`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/tactics`) ? 'active' : ''}`}
                      >
                        <FileText className="mobile-nav-icon" />
                        <span className="mobile-nav-text">Tactics</span>
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
                    to="/dashboard" 
                    className="mobile-nav-link"
                  >
                    <Home className="mobile-nav-icon" />
                    <span className="mobile-nav-text">Dashboard</span>
                  </Link>
                </li>
                {clubId && currentLevel !== 'club' && currentLevel !== 'clubs' && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={`/dashboard/${clubId}`}
                      className="mobile-nav-link"
                    >
                      {club?.logo ? (
                        <img 
                          src={club.logo} 
                          alt={`${club.name} logo`}
                          className="w-5 h-5 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                        />
                      ) : (
                        <Home className="mobile-nav-icon" />
                      )}
                      <span className="mobile-nav-text">{club?.shortName}</span>
                    </Link>
                  </li>
                )}
                {ageGroup && ageGroupId && currentLevel !== 'ageGroup' && currentLevel !== 'clubs' && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={`/dashboard/${clubId}/age-groups/${ageGroupId}`}
                      className="mobile-nav-link"
                    >
                      <Users className="mobile-nav-icon" />
                      <span className="mobile-nav-text">{ageGroup.name}</span>
                    </Link>
                  </li>
                )}
                {team && teamId && currentLevel !== 'clubs' && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={`/dashboard/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`}
                      className="mobile-nav-link"
                    >
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                        style={{ 
                          backgroundColor: team.colors?.primary || club?.colors.primary || '#6366F1',
                          color: team.colors?.primary === '#F3F4F6' ? '#1F2937' : '#FFFFFF'
                        }}
                      >
                        {team.shortName || team.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="mobile-nav-text">{team.name}</span>
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

