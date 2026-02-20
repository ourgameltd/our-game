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
  ChevronsLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  Calendar,
  Dumbbell
} from 'lucide-react';
import { getClubById } from '@data/clubs';
import { getTeamById } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { getPlayerById } from '@data/players';
import { getCoachById } from '@data/coaches';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Routes, areAllParamsValid, isValidParam } from '@/utils/routes';
import type { UserProfile } from '@/api/users';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [isStaffExpanded, setIsStaffExpanded] = useState(false);
  const [isSchedulingExpanded, setIsSchedulingExpanded] = useState(false);
  const [isManagementExpanded, setIsManagementExpanded] = useState(false);
  const [isTacticsExpanded, setIsTacticsExpanded] = useState(false);
  const [userProfile] = useState<UserProfile | null>(null);
  const { isDesktopOpen, toggleDesktopNav } = useNavigation();
  const { displayName } = useAuth();
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

  // Check if we're viewing a staff-related page (players or coaches)
  const isStaffPage = location.pathname.includes('/players') || location.pathname.includes('/coaches');

  // Check if we're viewing a scheduling-related page (matches or training)
  const isSchedulingPage = location.pathname.includes('/matches') || location.pathname.includes('/training');

  // Check if we're viewing a management-related page (ethos, kits, report-cards)
  const isManagementPage = location.pathname.includes('/ethos') || location.pathname.includes('/kits') || location.pathname.includes('/report-cards');

  // Check if we're viewing a tactics-related page (formations, drills, templates)
  const isTacticsPage = location.pathname.includes('/tactics') || location.pathname.includes('/drills') || location.pathname.includes('/drill-templates');

  // Auto-expand staff section when viewing staff pages
  useEffect(() => {
    if (isStaffPage) {
      setIsStaffExpanded(true);
    }
  }, [isStaffPage]);

  // Auto-expand scheduling section when viewing scheduling pages
  useEffect(() => {
    if (isSchedulingPage) {
      setIsSchedulingExpanded(true);
    }
  }, [isSchedulingPage]);

  // Auto-expand management section when viewing management pages
  useEffect(() => {
    if (isManagementPage) {
      setIsManagementExpanded(true);
    }
  }, [isManagementPage]);

  // Auto-expand tactics section when viewing tactics pages
  useEffect(() => {
    if (isTacticsPage) {
      setIsTacticsExpanded(true);
    }
  }, [isTacticsPage]);


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
      if (path.includes('/drill-templates')) return { title: 'Sessions', image: null };
      if (path.includes('/drills')) return { title: 'Drills', image: null };
      if (path.includes('/tactics')) return { title: 'Formations', image: null };
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
      if (path.includes('/drill-templates')) return { title: 'Sessions', image: null };
      if (path.includes('/drills')) return { title: 'Drills', image: null };
      if (path.includes('/tactics')) return { title: 'Formations', image: null };
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
      if (path.includes('/drill-templates')) return { title: 'Sessions', image: club.logo };
      if (path.includes('/drills')) return { title: 'Drills', image: club.logo };
      if (path.includes('/tactics')) return { title: 'Formations', image: club.logo };
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
          <Link 
            to="/dashboard" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Go to Dashboard"
          >
            <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <Link to="/profile" className="mobile-nav-user-profile hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ml-auto">
            <div className="mobile-nav-user-avatar-wrapper">
              {userProfile?.photo ? (
                <img 
                  src={userProfile.photo} 
                  alt={`${userProfile.firstName} ${userProfile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div className="mobile-nav-user-info">
              <span className="mobile-nav-user-name">
                {displayName || 'Loading...'}
              </span>
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
            {/* Age Group Level - Show full options only if we're at age group level */}
            {ageGroup && currentLevel === 'ageGroup' && areAllParamsValid(clubId, ageGroupId) && (
              <li className="mobile-nav-item">
                <div>
                  <div className="flex items-center">
                    <Link 
                      to={Routes.ageGroup(clubId as string, ageGroupId as string)}
                      className="flex-1 block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        {ageGroup.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => setIsNavExpanded(!isNavExpanded)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                      aria-label={isNavExpanded ? "Collapse menu" : "Expand menu"}
                    >
                      {isNavExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                  {isNavExpanded && (
                    <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {/* Staff Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsStaffExpanded(!isStaffExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isStaffPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Users className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Staff</span>
                          </span>
                          {isStaffExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isStaffExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroupPlayers(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.ageGroupPlayers(clubId as string, ageGroupId as string)) ? 'active' : ''}`}
                              >
                                <UserCircle className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Players</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroupCoaches(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.ageGroupCoaches(clubId as string, ageGroupId as string)) ? 'active' : ''}`}
                              >
                                <Shield className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Coaches</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Scheduling Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsSchedulingExpanded(!isSchedulingExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isSchedulingPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Calendar className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Scheduling</span>
                          </span>
                          {isSchedulingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isSchedulingExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroupMatches(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.ageGroupMatches(clubId as string, ageGroupId as string)) ? 'active' : ''}`}
                              >
                                <Shield className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Matches</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroupTrainingSessions(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.ageGroupTrainingSessions(clubId as string, ageGroupId as string)) ? 'active' : ''}`}
                              >
                                <Dumbbell className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Training</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Tactics Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsTacticsExpanded(!isTacticsExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isTacticsPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <FileText className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Tactics</span>
                          </span>
                          {isTacticsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isTacticsExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroupTactics(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.ageGroupTactics(clubId as string, ageGroupId as string)) && !location.pathname.includes('/drill') ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Formations</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroupDrills(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.ageGroupDrills(clubId as string, ageGroupId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Drills</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroupDrillTemplates(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.ageGroupDrillTemplates(clubId as string, ageGroupId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Sessions</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Management Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsManagementExpanded(!isManagementExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isManagementPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Settings className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Management</span>
                          </span>
                          {isManagementExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isManagementExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teams(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.teams(clubId as string, ageGroupId as string)) ? 'active' : ''}`}
                              >
                                <Users className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Teams</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroupReportCards(clubId as string, ageGroupId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.ageGroupReportCards(clubId as string, ageGroupId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Report Cards</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            )}

            {/* Club Level - Show full options only if we're at club level or below */}
            {club && currentLevel === 'club' && isValidParam(clubId) && (
              <li className="mobile-nav-item">
                <div>
                  <div className="flex items-center">
                    <Link 
                      to={Routes.club(clubId as string)}
                      className="flex-1 block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {club.logo ? (
                          <img 
                            src={club.logo} 
                            alt={`${club.name} logo`}
                            className="w-5 h-5 rounded object-cover"
                          />
                        ) : (
                          <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        )}
                        {club.shortName}
                      </h3>
                    </Link>
                    <button
                      onClick={() => setIsNavExpanded(!isNavExpanded)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                      aria-label={isNavExpanded ? "Collapse menu" : "Expand menu"}
                    >
                      {isNavExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                  {isNavExpanded && (
                    <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {/* Staff Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsStaffExpanded(!isStaffExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isStaffPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Users className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Staff</span>
                          </span>
                          {isStaffExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isStaffExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.clubPlayers(clubId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.clubPlayers(clubId as string)) ? 'active' : ''}`}
                              >
                                <UserCircle className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Players</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.clubCoaches(clubId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.clubCoaches(clubId as string)) ? 'active' : ''}`}
                              >
                                <Shield className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Coaches</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Scheduling Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsSchedulingExpanded(!isSchedulingExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isSchedulingPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Calendar className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Scheduling</span>
                          </span>
                          {isSchedulingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isSchedulingExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.clubMatches(clubId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.clubMatches(clubId as string)) ? 'active' : ''}`}
                              >
                                <Shield className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Matches</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.clubTraining(clubId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.clubTraining(clubId as string)) ? 'active' : ''}`}
                              >
                                <Dumbbell className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Training</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Tactics Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsTacticsExpanded(!isTacticsExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isTacticsPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <FileText className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Tactics</span>
                          </span>
                          {isTacticsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isTacticsExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.clubTactics(clubId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.clubTactics(clubId as string)) && !location.pathname.includes('/drill') ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Formations</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.drills(clubId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.drills(clubId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Drills</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.drillTemplates(clubId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.drillTemplates(clubId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Sessions</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Management Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsManagementExpanded(!isManagementExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isManagementPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Settings className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Management</span>
                          </span>
                          {isManagementExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isManagementExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.ageGroups(clubId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.ageGroups(clubId as string)) ? 'active' : ''}`}
                              >
                                <Users className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Age Groups</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.clubEthos(clubId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.clubEthos(clubId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Ethos</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.clubKits(clubId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.clubKits(clubId as string)) ? 'active' : ''}`}
                              >
                                <Shirt className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Kits</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.clubReportCards(clubId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.clubReportCards(clubId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Report Cards</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            )}

            {/* Player Level - Show full options only if we're at player level */}
            {player && currentLevel === 'player' && areAllParamsValid(clubId, ageGroupId, playerId) && (
              <li className="mobile-nav-item">
                <div>
                  <div className="flex items-center">
                    <Link 
                      to={isValidParam(teamId) 
                        ? Routes.teamPlayer(clubId as string, ageGroupId as string, teamId as string, playerId as string)
                        : Routes.player(clubId as string, ageGroupId as string, playerId as string)
                      }
                      className="flex-1 block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        {player.firstName} {player.lastName}
                      </h3>
                    </Link>
                    <button
                      onClick={() => setIsNavExpanded(!isNavExpanded)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                      aria-label={isNavExpanded ? "Collapse menu" : "Expand menu"}
                    >
                      {isNavExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                  {isNavExpanded && (
                    <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <li className="mobile-nav-item">
                        <Link 
                          to={isValidParam(teamId) 
                            ? Routes.teamPlayerAbilities(clubId as string, ageGroupId as string, teamId as string, playerId as string)
                            : Routes.playerAbilities(clubId as string, ageGroupId as string, playerId as string)
                          }
                          className={`mobile-nav-link pl-8 ${
                            isValidParam(teamId)
                              ? isActive(Routes.teamPlayerAbilities(clubId as string, ageGroupId as string, teamId as string, playerId as string))
                              : isActive(Routes.playerAbilities(clubId as string, ageGroupId as string, playerId as string))
                          } ? 'active' : ''}`}
                        >
                          <Shield className="mobile-nav-icon" />
                          <span className="mobile-nav-text">Abilities</span>
                        </Link>
                      </li>
                      <li className="mobile-nav-item">
                        <Link 
                          to={isValidParam(teamId) 
                            ? Routes.teamPlayerDevelopmentPlans(clubId as string, ageGroupId as string, teamId as string, playerId as string)
                            : Routes.playerDevelopmentPlans(clubId as string, ageGroupId as string, playerId as string)
                          }
                          className={`mobile-nav-link pl-8 ${
                            isValidParam(teamId)
                              ? isActive(Routes.teamPlayerDevelopmentPlans(clubId as string, ageGroupId as string, teamId as string, playerId as string))
                              : isActive(Routes.playerDevelopmentPlans(clubId as string, ageGroupId as string, playerId as string))
                          } ? 'active' : ''}`}
                        >
                          <Shield className="mobile-nav-icon" />
                          <span className="mobile-nav-text">Development</span>
                        </Link>
                      </li>
                      <li className="mobile-nav-item">
                        <Link 
                          to={isValidParam(teamId) 
                            ? Routes.teamPlayerReportCards(clubId as string, ageGroupId as string, teamId as string, playerId as string)
                            : Routes.playerReportCards(clubId as string, ageGroupId as string, playerId as string)
                          }
                          className={`mobile-nav-link pl-8 ${
                            isValidParam(teamId)
                              ? isActive(Routes.teamPlayerReportCards(clubId as string, ageGroupId as string, teamId as string, playerId as string))
                              : isActive(Routes.playerReportCards(clubId as string, ageGroupId as string, playerId as string))
                          } ? 'active' : ''}`}
                        >
                          <FileText className="mobile-nav-icon" />
                          <span className="mobile-nav-text">Report Cards</span>
                        </Link>
                      </li>
                      <li className="mobile-nav-item">
                        <Link 
                          to={isValidParam(teamId) 
                            ? Routes.teamPlayerAlbum(clubId as string, ageGroupId as string, teamId as string, playerId as string)
                            : Routes.playerAlbum(clubId as string, ageGroupId as string, playerId as string)
                          }
                          className={`mobile-nav-link pl-8 ${
                            isValidParam(teamId)
                              ? isActive(Routes.teamPlayerAlbum(clubId as string, ageGroupId as string, teamId as string, playerId as string))
                              : isActive(Routes.playerAlbum(clubId as string, ageGroupId as string, playerId as string))
                          } ? 'active' : ''}`}
                        >
                          <FileText className="mobile-nav-icon" />
                          <span className="mobile-nav-text">Album</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            )}

            {/* Coach Level - Show full options only if we're at coach level */}
            {coach && currentLevel === 'coach' && areAllParamsValid(clubId, ageGroupId, coachId) && (
              <li className="mobile-nav-item">
                <div>
                  <Link 
                    to={isValidParam(teamId) 
                      ? Routes.teamCoach(clubId as string, ageGroupId as string, teamId as string, coachId as string)
                      : Routes.ageGroupCoach(clubId as string, ageGroupId as string, coachId as string)
                    }
                    className="block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      {coach.firstName} {coach.lastName}
                    </h3>
                  </Link>
                </div>
              </li>
            )}

            {/* Team Level - Show full options only if we're at team level */}
            {team && currentLevel === 'team' && areAllParamsValid(clubId, ageGroupId, teamId) && (
              <li className="mobile-nav-item">
                <div>
                  <div className="flex items-center">
                    <Link 
                      to={Routes.team(clubId as string, ageGroupId as string, teamId as string)}
                      className="flex-1 block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
                          style={{ 
                            backgroundColor: team.colors?.primary || club?.colors.primary || '#6366F1',
                            color: team.colors?.primary === '#F3F4F6' ? '#1F2937' : '#FFFFFF'
                          }}
                        >
                          {team.shortName || team.name.substring(0, 2).toUpperCase()}
                        </div>
                        {team.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => setIsNavExpanded(!isNavExpanded)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                      aria-label={isNavExpanded ? "Collapse menu" : "Expand menu"}
                    >
                      {isNavExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                  {isNavExpanded && (
                    <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {/* Staff Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsStaffExpanded(!isStaffExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isStaffPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Users className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Staff</span>
                          </span>
                          {isStaffExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isStaffExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teamSquad(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.teamSquad(clubId as string, ageGroupId as string, teamId as string)) ? 'active' : ''}`}
                              >
                                <UserCircle className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Players</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teamCoaches(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.teamCoaches(clubId as string, ageGroupId as string, teamId as string)) ? 'active' : ''}`}
                              >
                                <Shield className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Coaches</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Scheduling Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsSchedulingExpanded(!isSchedulingExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isSchedulingPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Calendar className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Scheduling</span>
                          </span>
                          {isSchedulingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isSchedulingExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.matches(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.matches(clubId as string, ageGroupId as string, teamId as string)) ? 'active' : ''}`}
                              >
                                <Shield className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Matches</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teamTrainingSessions(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.teamTrainingSessions(clubId as string, ageGroupId as string, teamId as string)) ? 'active' : ''}`}
                              >
                                <Dumbbell className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Training</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Tactics Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsTacticsExpanded(!isTacticsExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isTacticsPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <FileText className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Tactics</span>
                          </span>
                          {isTacticsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isTacticsExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teamTactics(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.teamTactics(clubId as string, ageGroupId as string, teamId as string)) && !location.pathname.includes('/drill') ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Formations</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teamDrills(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.teamDrills(clubId as string, ageGroupId as string, teamId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Drills</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teamDrillTemplates(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${location.pathname.includes(Routes.teamDrillTemplates(clubId as string, ageGroupId as string, teamId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Sessions</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                      {/* Management Section */}
                      <li className="mobile-nav-item">
                        <button
                          onClick={() => setIsManagementExpanded(!isManagementExpanded)}
                          className={`mobile-nav-link pl-8 w-full justify-between ${isManagementPage ? 'text-primary-600 dark:text-primary-400' : ''}`}
                        >
                          <span className="flex items-center gap-4">
                            <Settings className="mobile-nav-icon" />
                            <span className="mobile-nav-text">Management</span>
                          </span>
                          {isManagementExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isManagementExpanded && (
                          <ul className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teamKits(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.teamKits(clubId as string, ageGroupId as string, teamId as string)) ? 'active' : ''}`}
                              >
                                <Shirt className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Kits</span>
                              </Link>
                            </li>
                            <li className="mobile-nav-item">
                              <Link 
                                to={Routes.teamReportCards(clubId as string, ageGroupId as string, teamId as string)}
                                className={`mobile-nav-link pl-8 ${isActive(Routes.teamReportCards(clubId as string, ageGroupId as string, teamId as string)) ? 'active' : ''}`}
                              >
                                <FileText className="mobile-nav-icon" />
                                <span className="mobile-nav-text">Report Cards</span>
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            )}
          </ul>

          {/* Breadcrumb navigation to parent levels - only show if there are parent links */}
          {(currentLevel === 'player' || currentLevel === 'coach' || currentLevel === 'team' || currentLevel === 'ageGroup') && (
            <>
              <div className="mobile-nav-divider"></div>
              <div className="px-6 py-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Navigate To
                </h3>
              </div>
              <ul className="mobile-nav-menu">
                {club && isValidParam(clubId) && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={Routes.club(clubId as string)}
                      className="mobile-nav-link"
                    >
                      {club.logo ? (
                        <img 
                          src={club.logo} 
                          alt={`${club.name} logo`}
                          className="w-5 h-5 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                        />
                      ) : (
                        <Home className="mobile-nav-icon" />
                      )}
                      <span className="mobile-nav-text">{club.shortName}</span>
                    </Link>
                  </li>
                )}
                {ageGroup && areAllParamsValid(clubId, ageGroupId) && currentLevel !== 'ageGroup' && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={Routes.ageGroup(clubId as string, ageGroupId as string)}
                      className="mobile-nav-link"
                    >
                      <Users className="mobile-nav-icon" />
                      <span className="mobile-nav-text">{ageGroup.name}</span>
                    </Link>
                  </li>
                )}
                {team && areAllParamsValid(clubId, ageGroupId, teamId) && currentLevel !== 'team' && (
                  <li className="mobile-nav-item">
                    <Link 
                      to={Routes.team(clubId as string, ageGroupId as string, teamId as string)}
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

          {/* Only show divider if not on dashboard */}
          {(location.pathname !== '/dashboard' && location.pathname !== '/profile') && (
            <div className="mobile-nav-divider"></div>
          )}

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
              <a 
                href="/.auth/logout?post_logout_redirect_uri=/" 
                className="mobile-nav-link text-red-600 dark:text-red-400"
              >
                <LogOut className="mobile-nav-icon" />
                <span className="mobile-nav-text">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

