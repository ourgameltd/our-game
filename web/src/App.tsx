import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { AuthProvider } from '@/contexts/AuthContext';
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
import ClubTrainingSessionsPage from '@pages/clubs/ClubTrainingSessionsPage';
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
import PlayerReportCardsPage from '@pages/players/PlayerReportCardsPage';
import AddEditReportCardPage from '@pages/players/AddEditReportCardPage';
import PlayerDevelopmentPlanPage from '@pages/players/PlayerDevelopmentPlanPage';
import PlayerDevelopmentPlansPage from '@pages/players/PlayerDevelopmentPlansPage';
import AddEditDevelopmentPlanPage from '@pages/players/AddEditDevelopmentPlanPage';
import PlayerAlbumPage from '@pages/players/PlayerAlbumPage';
import PlayerSettingsPage from '@pages/players/PlayerSettingsPage';
import ClubReportCardsPage from '@pages/clubs/ClubReportCardsPage';
import AgeGroupReportCardsPage from '@pages/ageGroups/AgeGroupReportCardsPage';
import TeamReportCardsPage from '@pages/teams/TeamReportCardsPage';
import ClubDevelopmentPlansPage from '@pages/clubs/ClubDevelopmentPlansPage';
import AgeGroupDevelopmentPlansPage from '@pages/ageGroups/AgeGroupDevelopmentPlansPage';
import TeamDevelopmentPlansPage from '@pages/teams/TeamDevelopmentPlansPage';
import CoachProfilePage from '@pages/coaches/CoachProfilePage';
import CoachSettingsPage from '@pages/coaches/CoachSettingsPage';
import HelpSupportPage from '@pages/HelpSupportPage';
import NotificationsPage from '@pages/NotificationsPage';
import TacticsListPage from '@pages/tactics/TacticsListPage';
import TacticDetailPage from '@pages/tactics/TacticDetailPage';
import AddEditTacticPage from '@pages/tactics/AddEditTacticPage';
import DrillsListPage from '@pages/drills/DrillsListPage';
import DrillTemplatesListPage from '@pages/drills/DrillTemplatesListPage';
import DrillFormPage from '@pages/drills/DrillFormPage';
import DrillTemplateFormPage from '@pages/drills/DrillTemplateFormPage';
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
        <Route path="/dashboard/:clubId/training" element={<ClubTrainingSessionsPage />} />
        <Route path="/dashboard/:clubId/kits" element={<ClubKitsPage />} />
        <Route path="/dashboard/:clubId/settings" element={<ClubSettingsPage />} />
        <Route path="/dashboard/:clubId/report-cards" element={<ClubReportCardsPage />} />
        <Route path="/dashboard/:clubId/development-plans" element={<ClubDevelopmentPlansPage />} />

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
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/report-cards" element={<AgeGroupReportCardsPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/development-plans" element={<AgeGroupDevelopmentPlansPage />} />

        {/* Coaches - Age Group Context */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/coaches/:coachId" element={<CoachProfilePage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/coaches/:coachId/settings" element={<CoachSettingsPage />} />

        {/* Players - Age Group Level */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId" element={<PlayerProfilePage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/abilities" element={<PlayerAbilitiesPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/report-cards" element={<PlayerReportCardsPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/report-cards/new" element={<AddEditReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/report-cards/:reportId/edit" element={<AddEditReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/report-cards/:reportId" element={<PlayerReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/report-card" element={<PlayerReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/development-plans/:planId" element={<PlayerDevelopmentPlanPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/development-plans" element={<PlayerDevelopmentPlansPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/development-plans/new" element={<AddEditDevelopmentPlanPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/players/:playerId/development-plans/:planId/edit" element={<AddEditDevelopmentPlanPage />} />
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
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/report-cards" element={<TeamReportCardsPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/development-plans" element={<TeamDevelopmentPlansPage />} />

        {/* Coaches - Team Context */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/coaches/:coachId" element={<CoachProfilePage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/coaches/:coachId/settings" element={<CoachSettingsPage />} />

        {/* Players - Team Context */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId" element={<PlayerProfilePage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/abilities" element={<PlayerAbilitiesPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/report-cards" element={<PlayerReportCardsPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/report-cards/new" element={<AddEditReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/report-cards/:reportId/edit" element={<AddEditReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/report-cards/:reportId" element={<PlayerReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/report-card" element={<PlayerReportCardPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/development-plans/:planId" element={<PlayerDevelopmentPlanPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/development-plans" element={<PlayerDevelopmentPlansPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/development-plans/new" element={<AddEditDevelopmentPlanPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/development-plans/:planId/edit" element={<AddEditDevelopmentPlanPage />} />
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
        <Route path="/dashboard/:clubId/tactics" element={<TacticsListPage />} />
        <Route path="/dashboard/:clubId/tactics/new" element={<AddEditTacticPage />} />
        <Route path="/dashboard/:clubId/tactics/:tacticId" element={<TacticDetailPage />} />
        <Route path="/dashboard/:clubId/tactics/:tacticId/edit" element={<AddEditTacticPage />} />

        {/* Tactics - Age Group Level */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/tactics" element={<TacticsListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/tactics/new" element={<AddEditTacticPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/tactics/:tacticId" element={<TacticDetailPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/tactics/:tacticId/edit" element={<AddEditTacticPage />} />

        {/* Tactics - Team Level */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics" element={<TacticsListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics/new" element={<AddEditTacticPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics/:tacticId" element={<TacticDetailPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/tactics/:tacticId/edit" element={<AddEditTacticPage />} />

        {/* Drills & Templates - Club Level */}
        <Route path="/dashboard/:clubId/drills" element={<DrillsListPage />} />
        <Route path="/dashboard/:clubId/drills/new" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/drills/:drillId" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/drills/:drillId/edit" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/drill-templates" element={<DrillTemplatesListPage />} />
        <Route path="/dashboard/:clubId/drill-templates/new" element={<DrillTemplateFormPage />} />
        <Route path="/dashboard/:clubId/drill-templates/:templateId" element={<DrillTemplateFormPage />} />
        <Route path="/dashboard/:clubId/drill-templates/:templateId/edit" element={<DrillTemplateFormPage />} />

        {/* Drills & Templates - Age Group Level */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/drills" element={<DrillsListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/drills/new" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/drills/:drillId" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/drills/:drillId/edit" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/drill-templates" element={<DrillTemplatesListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/drill-templates/new" element={<DrillTemplateFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/drill-templates/:templateId" element={<DrillTemplateFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/drill-templates/:templateId/edit" element={<DrillTemplateFormPage />} />

        {/* Drills & Templates - Team Level */}
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/drills" element={<DrillsListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/drills/new" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/drills/:drillId" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/drills/:drillId/edit" element={<DrillFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/drill-templates" element={<DrillTemplatesListPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/drill-templates/new" element={<DrillTemplateFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/drill-templates/:templateId" element={<DrillTemplateFormPage />} />
        <Route path="/dashboard/:clubId/age-groups/:ageGroupId/teams/:teamId/drill-templates/:templateId/edit" element={<DrillTemplateFormPage />} />

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
          <AuthProvider>
            <Router basename={import.meta.env.BASE_URL}>
              <AppContent />
            </Router>
          </AuthProvider>
        </NavigationProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
}

export default App;
