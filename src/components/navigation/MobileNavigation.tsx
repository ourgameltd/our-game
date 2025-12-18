import { useState, useEffect } from 'react';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { 
  Home, 
  Users, 
  ClipboardList, 
  Dumbbell, 
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
import { useTheme } from '@/contexts/ThemeContext';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme, actualTheme } = useTheme();

  // Extract params from current path
  const clubMatch = matchPath('/clubs/:clubId/*', location.pathname);
  const ageGroupMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/*', location.pathname);
  const teamMatch = matchPath('/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/*', location.pathname);

  const clubId = clubMatch?.params.clubId;
  const ageGroupId = ageGroupMatch?.params.ageGroupId || teamMatch?.params.ageGroupId;
  const teamId = teamMatch?.params.teamId;

  const club = clubId ? getClubById(clubId) : null;
  const team = teamId ? getTeamById(teamId) : null;
  const ageGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
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

  // Build context-aware navigation items
  const getContextNavItems = () => {
    if (!club) return [];

    const items = [];

    if (teamId && team && ageGroup) {
      // Team-level navigation
      items.push(
        { label: 'Overview', path: `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`, icon: Home },
        { label: 'Squad', path: `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/squad`, icon: Users },
        { label: 'Matches', path: `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/matches`, icon: Trophy },
        { label: 'Coaches', path: `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/coaches`, icon: Shield },
        { label: 'Kits', path: `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/kits`, icon: Shirt },
        { label: 'Settings', path: `/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}/settings`, icon: Settings }
      );
    } else if (ageGroupId && ageGroup) {
      // Age group-level navigation
      items.push(
        { label: 'Overview', path: `/clubs/${clubId}/age-groups/${ageGroupId}`, icon: Home },
        { label: 'Teams', path: `/clubs/${clubId}/age-groups/${ageGroupId}/teams`, icon: Users },
        { label: 'Players', path: `/clubs/${clubId}/age-groups/${ageGroupId}/players`, icon: UserCircle },
        { label: 'Coaches', path: `/clubs/${clubId}/age-groups/${ageGroupId}/coaches`, icon: Shield },
        { label: 'Matches', path: `/clubs/${clubId}/age-groups/${ageGroupId}/matches`, icon: Trophy },
        { label: 'Settings', path: `/clubs/${clubId}/age-groups/${ageGroupId}/settings`, icon: Settings }
      );
    } else if (clubId) {
      // Club-level navigation
      items.push(
        { label: 'Overview', path: `/clubs/${clubId}`, icon: Home },
        { label: 'Age Groups', path: `/clubs/${clubId}/age-groups`, icon: Users },
        { label: 'Players', path: `/clubs/${clubId}/players`, icon: UserCircle },
        { label: 'Coaches', path: `/clubs/${clubId}/coaches`, icon: Shield },
        { label: 'Matches', path: `/clubs/${clubId}/matches`, icon: Trophy },
        { label: 'Ethos', path: `/clubs/${clubId}/ethos`, icon: FileText },
        { label: 'Kits', path: `/clubs/${clubId}/kits`, icon: Shirt },
        { label: 'Settings', path: `/clubs/${clubId}/settings`, icon: Settings }
      );
    }

    return items;
  };

  const contextNavItems = getContextNavItems();

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-nav-header lg:hidden">
        <button 
          className="mobile-nav-hamburger"
          onClick={toggleMenu}
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
            <Link 
              to={`/clubs/${clubId}/age-groups/${ageGroupId}/teams/${teamId}`}
              className="flex items-center gap-2"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border-2 border-gray-300 dark:border-gray-600"
                style={{ 
                  backgroundColor: team.colors?.primary || club?.colors.primary || '#6366F1',
                  color: team.colors?.primary === '#F3F4F6' ? '#1F2937' : '#FFFFFF'
                }}
              >
                {team.shortName || team.name.substring(0, 3).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                  {team.name}
                </span>
                {ageGroup && (
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
                    {ageGroup.name}
                  </span>
                )}
              </div>
            </Link>
          ) : club ? (
            <Link to={`/clubs/${clubId}`} className="flex items-center gap-2">
              {club.logo ? (
                <img 
                  src={club.logo} 
                  alt={`${club.name} logo`}
                  className="w-10 h-10 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: club.colors.primary }}
                >
                  {club.shortName}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {club.shortName}
              </span>
            </Link>
          ) : (
            <Link to="/clubs" className="text-sm font-semibold text-gray-900 dark:text-white">
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
          <button className="mobile-nav-notification-btn" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="mobile-nav-notification-badge">3</span>
          </button>
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
      <div className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-drawer-header">
          <Link to="/profile" className="mobile-nav-user-profile">
            <div className="mobile-nav-user-avatar-wrapper">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mobile-nav-user-info">
              <span className="mobile-nav-user-name">John Doe</span>
              <span className="mobile-nav-user-role">Coach</span>
            </div>
          </Link>
          <button 
            className="mobile-nav-close"
            onClick={toggleMenu}
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mobile-nav-drawer-content">
          {/* Context-Aware Navigation (if in club/team context) */}
          {contextNavItems.length > 0 && (
            <>
              <div className="px-6 py-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {team ? `${ageGroup?.name} ${team.name}` : ageGroup ? ageGroup.name : club?.name}
                </h3>
              </div>
              <ul className="mobile-nav-menu">
                {contextNavItems.map((item) => (
                  <li key={item.path} className="mobile-nav-item">
                    <Link 
                      to={item.path}
                      className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <item.icon className="mobile-nav-icon" />
                      <span className="mobile-nav-text">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mobile-nav-divider"></div>
            </>
          )}

          {/* Global Navigation */}
          <div className="px-6 py-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Main Menu
            </h3>
          </div>
          <ul className="mobile-nav-menu">
            <li className="mobile-nav-item">
              <Link 
                to="/clubs" 
                className={`mobile-nav-link ${isActive('/clubs') ? 'active' : ''}`}
              >
                <Trophy className="mobile-nav-icon" />
                <span className="mobile-nav-text">My Clubs</span>
              </Link>
            </li>

            <li className="mobile-nav-item">
              <Link 
                to="/formations" 
                className={`mobile-nav-link ${isActive('/formations') ? 'active' : ''}`}
              >
                <ClipboardList className="mobile-nav-icon" />
                <span className="mobile-nav-text">Formations & Tactics</span>
              </Link>
            </li>

            <li className="mobile-nav-item">
              <Link 
                to="/training-sessions" 
                className={`mobile-nav-link ${isActive('/training-sessions') ? 'active' : ''}`}
              >
                <Dumbbell className="mobile-nav-icon" />
                <span className="mobile-nav-text">Training Library</span>
              </Link>
            </li>
          </ul>

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
                to="/logout" 
                className="mobile-nav-link text-red-600 dark:text-red-400"
              >
                <LogOut className="mobile-nav-icon" />
                <span className="mobile-nav-text">Logout</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Desktop Navigation - Horizontal Layout */}
      <div className="mobile-nav-desktop hidden lg:flex">
        <Link to="/clubs" className="mobile-nav-desktop-logo">
          {club && club.logo ? (
            <>
              <img src={club.logo} alt={club.name} />
              <span className="mobile-nav-desktop-logo-text">{club.name}</span>
            </>
          ) : club ? (
            <>
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: club.colors.primary }}
              >
                {club.shortName}
              </div>
              <span className="mobile-nav-desktop-logo-text">{club.name}</span>
            </>
          ) : (
            <>
              <Trophy className="w-6 h-6" />
              <span className="mobile-nav-desktop-logo-text">My Clubs</span>
            </>
          )}
        </Link>

        {/* Context Navigation Items */}
        {contextNavItems.length > 0 && (
          <ul className="mobile-nav-desktop-menu">
            {contextNavItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={isActive(item.path) ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mobile-nav-desktop-actions">
          <Link 
            to="/formations" 
            className="mobile-nav-desktop-quick-link"
            title="Formations Library"
          >
            <ClipboardList className="w-5 h-5" />
          </Link>
          <Link 
            to="/training-sessions" 
            className="mobile-nav-desktop-quick-link"
            title="Training Library"
          >
            <Dumbbell className="w-5 h-5" />
          </Link>
          <button 
            onClick={toggleTheme}
            className="mobile-nav-desktop-quick-link"
            aria-label="Toggle theme"
          >
            {actualTheme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <button className="mobile-nav-notification-btn" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="mobile-nav-notification-badge">3</span>
          </button>
          <Link to="/profile" className="mobile-nav-desktop-user" title="Profile">
            <div className="mobile-nav-user-avatar-wrapper">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
