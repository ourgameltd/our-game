import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import HomePage from '@pages/HomePage';
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import PasswordResetPage from '@pages/auth/PasswordResetPage';
import ProfilePage from '@pages/profile/ProfilePage';
import ClubsListPage from '@pages/clubs/ClubsListPage';
import ClubOverviewPage from '@pages/clubs/ClubOverviewPage';
import ClubEthosPage from '@pages/clubs/ClubEthosPage';
import ClubPlayersPage from '@pages/clubs/ClubPlayersPage';
import ClubPlayerSettingsPage from '@pages/clubs/ClubPlayerSettingsPage';
import ClubCoachesPage from '@pages/clubs/ClubCoachesPage';
import ClubKitsPage from '@pages/clubs/ClubKitsPage';
import ClubSettingsPage from '@pages/clubs/ClubSettingsPage';
import ClubMatchesPage from '@pages/clubs/ClubMatchesPage';
import AgeGroupsListPage from '@pages/ageGroups/AgeGroupsListPage';
import AgeGroupOverviewPage from '@pages/ageGroups/AgeGroupOverviewPage';
import AgeGroupPlayersPage from '@pages/ageGroups/AgeGroupPlayersPage';
import AgeGroupCoachesPage from '@pages/ageGroups/AgeGroupCoachesPage';
import AgeGroupSettingsPage from '@pages/ageGroups/AgeGroupSettingsPage';
import AgeGroupMatchesPage from '@pages/ageGroups/AgeGroupMatchesPage';
import AgeGroupTrainingSessionsPage from '@pages/ageGroups/AgeGroupTrainingSessionsPage';
import AddEditAgeGroupPage from '@pages/ageGroups/AddEditAgeGroupPage';
import TeamsListPage from '@pages/teams/TeamsListPage';
import TeamOverviewPage from '@pages/teams/TeamOverviewPage';
import TeamPlayersPage from '@/pages/teams/TeamPlayersPage';
import TeamCoachesPage from '@pages/teams/TeamCoachesPage';
import TeamKitsPage from '@pages/teams/TeamKitsPage';
import TeamSettingsPage from '@pages/teams/TeamSettingsPage';
import AddEditTeamPage from '@pages/teams/AddEditTeamPage';
import PlayerProfilePage from '@pages/players/PlayerProfilePage';
import PlayerAbilitiesPage from '@pages/players/PlayerAbilitiesPage';
import MatchReportPage from '@pages/matches/MatchReportPage';
import MatchesListPage from '@pages/matches/MatchesListPage';
import AddEditMatchPage from '@pages/matches/AddEditMatchPage';
import AddEditTrainingSessionPage from '@pages/teams/AddEditTrainingSessionPage';
import TrainingSessionsListPage from '@pages/teams/TrainingSessionsListPage';
import PlayerReportCardPage from '@pages/players/PlayerReportCardPage';
import PlayerDevelopmentPlansPage from '@pages/players/PlayerDevelopmentPlansPage';
import PlayerAlbumPage from '@pages/players/PlayerAlbumPage';
import PlayerSettingsPage from '@pages/players/PlayerSettingsPage';
import CoachProfilePage from '@pages/coaches/CoachProfilePage';
import CoachSettingsPage from '@pages/coaches/CoachSettingsPage';
import HelpSupportPage from '@pages/HelpSupportPage';
import NotificationsPage from '@pages/NotificationsPage';
import Header from '@components/layout/Header';
import ScrollToTop from '@components/common/ScrollToTop';

function AppContent() {
  const location = useLocation();
  const { isDesktopOpen } = useNavigation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Don't show header on auth pages or home page
  const hideHeader = location.pathname === '/' || 
                     location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/password-reset';

  const getMarginLeft = () => {
    if (hideHeader || !isDesktop) return '0';
    return isDesktopOpen ? '280px' : '4px';
  };

  return (
    <>
      <ScrollToTop />
      {!hideHeader && <Header />}
      <div className={`${hideHeader ? '' : 'pt-16 lg:pt-0'}`}>
        <div 
          className="transition-all duration-300"
          style={{ 
            marginLeft: getMarginLeft()
          }}
        >
          <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />

        {/* Profile */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Help & Support */}
        <Route path="/help" element={<HelpSupportPage />} />
        
        {/* Dashboard (Clubs) */}
        <Route path="/dashboard" element={<ClubsListPage />} />
        <Route path="/dashboard/:clubId" element={<ClubOverviewPage />} />
        <Route path="/dashboard/:clubId/ethos" element={<ClubEthosPage />} />
        <Route path="/dashboard/:clubId/players" element={<ClubPlayersPage />} />
        <Route path="/dashboard/:clubId/players/:playerId/settings" element={<ClubPlayerSettingsPage />} />
        <Route path="/dashboard/:clubId/players/:playerId/album" element={<PlayerAlbumPage />} />
        <Route path="/dashboard/:clubId/coaches" element={<ClubCoachesPage />} />
        <Route path="/dashboard/:clubId/coaches/:coachId" element={<CoachProfilePage />} />
        <Route path="/dashboard/:clubId/coaches/:coachId/settings" element={<CoachSettingsPage />} />
        <Route path="/dashboard/:clubId/matches" element={<ClubMatchesPage />} />
        <Route path="/dashboard/:clubId/kits" element={<ClubKitsPage />} />
        <Route path="/dashboard/:clubId/settings" element={<ClubSettingsPage />} />

        {/* Age Groups */}
        <Route path="/dashboard/:clubId/age-groups" element={<AgeGroupsListPage />} />
        <Route path="/dashboard/:clubId/age-groups/new" element={<AddEditAgeGroupPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId" element={<AgeGroupOverviewPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/edit" element={<AddEditAgeGroupPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players" element={<AgeGroupPlayersPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/coaches" element={<AgeGroupCoachesPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/matches" element={<AgeGroupMatchesPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/training" element={<AgeGroupTrainingSessionsPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/settings" element={<AgeGroupSettingsPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/settings" element={<AgeGroupSettingsPage />} />

        {/* Coaches - Age Group Context */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/coaches/:coachId" element={<CoachProfilePage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/coaches/:coachId/settings" element={<CoachSettingsPage />} />

        {/* Players - Age Group Level */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId" element={<PlayerProfilePage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/abilities" element={<PlayerAbilitiesPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/report-card" element={<PlayerReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/development-plans" element={<PlayerDevelopmentPlansPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/album" element={<PlayerAlbumPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/settings" element={<PlayerSettingsPage />} />

        {/* Teams */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams" element={<TeamsListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/new" element={<AddEditTeamPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId" element={<TeamOverviewPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/edit" element={<AddEditTeamPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/squad" element={<TeamPlayersPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/coaches" element={<TeamCoachesPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/kits" element={<TeamKitsPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/settings" element={<TeamSettingsPage />} />

        {/* Coaches - Team Context */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/coaches/:coachId" element={<CoachProfilePage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/coaches/:coachId/settings" element={<CoachSettingsPage />} />

        {/* Players - Team Context */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId" element={<PlayerProfilePage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/abilities" element={<PlayerAbilitiesPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/report-card" element={<PlayerReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/development-plans" element={<PlayerDevelopmentPlansPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/album" element={<PlayerAlbumPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/settings" element={<PlayerSettingsPage />} />

        {/* Matches */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches" element={<MatchesListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/new" element={<AddEditMatchPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/:matchId" element={<MatchReportPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/:matchId/edit" element={<AddEditMatchPage />} />

        {/* Training Sessions */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/training" element={<TrainingSessionsListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/training/new" element={<AddEditTrainingSessionPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/training/:sessionId/edit" element={<AddEditTrainingSessionPage />} />

        {/* Tactics - Club Level */}
        <Route path="/dashboard/:clubId/tactics" element={<div>Club Tactics List</div>} />
        <Route path="/dashboard/:clubId/tactics/new" element={<div>New Club Tactic</div>} />
        <Route path="/dashboard/:clubId/tactics/:tacticId" element={<div>Club Tactic Detail</div>} />
        <Route path="/dashboard/:clubId/tactics/:tacticId/edit" element={<div>Edit Club Tactic</div>} />

        {/* Tactics - Age Group Level */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/tactics" element={<div>Age Group Tactics List</div>} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/tactics/new" element={<div>New Age Group Tactic</div>} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/tactics/:tacticId" element={<div>Age Group Tactic Detail</div>} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/tactics/:tacticId/edit" element={<div>Edit Age Group Tactic</div>} />

        {/* Tactics - Team Level */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics" element={<div>Team Tactics List</div>} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics/new" element={<div>New Team Tactic</div>} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics/:tacticId" element={<div>Team Tactic Detail</div>} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics/:tacticId/edit" element={<div>Edit Team Tactic</div>} />

        </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserPreferencesProvider>
        <NavigationProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <AppContent />
          </Router>
        </NavigationProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
}

export default App;
