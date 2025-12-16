import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
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
import TrainingSessionPage from '@pages/training/TrainingSessionPage';
import FormationsLibraryPage from '@pages/formations/FormationsLibraryPage';
import TrainingLibraryPage from '@pages/training/TrainingLibraryPage';
import PlayerReportCardPage from '@pages/players/PlayerReportCardPage';
import PlayerDevelopmentPlansPage from '@pages/players/PlayerDevelopmentPlansPage';
import PlayerSettingsPage from '@pages/players/PlayerSettingsPage';
import CoachProfilePage from '@pages/coaches/CoachProfilePage';
import CoachSettingsPage from '@pages/coaches/CoachSettingsPage';
import Header from '@components/layout/Header';
import ScrollToTop from '@components/common/ScrollToTop';

function AppContent() {
  const location = useLocation();
  
  // Don't show header on auth pages or home page
  const hideHeader = location.pathname === '/' || 
                     location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/password-reset';

  return (
    <>
      <ScrollToTop />
      {!hideHeader && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />

        {/* Profile */}
        <Route path="/profile" element={<ProfilePage />} />
        {/* Clubs */}
        <Route path="/clubs" element={<ClubsListPage />} />
        <Route path="/clubs/:clubId" element={<ClubOverviewPage />} />
        <Route path="/clubs/:clubId/ethos" element={<ClubEthosPage />} />
        <Route path="/clubs/:clubId/players" element={<ClubPlayersPage />} />
        <Route path="/clubs/:clubId/players/:playerId/settings" element={<ClubPlayerSettingsPage />} />
        <Route path="/clubs/:clubId/coaches" element={<ClubCoachesPage />} />
        <Route path="/clubs/:clubId/coaches/:coachId" element={<CoachProfilePage />} />
        <Route path="/clubs/:clubId/coaches/:coachId/settings" element={<CoachSettingsPage />} />
        <Route path="/clubs/:clubId/matches" element={<ClubMatchesPage />} />
        <Route path="/clubs/:clubId/kits" element={<ClubKitsPage />} />
        <Route path="/clubs/:clubId/settings" element={<ClubSettingsPage />} />

        {/* Age Groups */}
        <Route path="/clubs/:clubId/age-groups" element={<AgeGroupsListPage />} />
        <Route path="/clubs/:clubId/age-groups/new" element={<AddEditAgeGroupPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId" element={<AgeGroupOverviewPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/edit" element={<AddEditAgeGroupPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/players" element={<AgeGroupPlayersPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/coaches" element={<AgeGroupCoachesPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/matches" element={<AgeGroupMatchesPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/settings" element={<AgeGroupSettingsPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/settings" element={<AgeGroupSettingsPage />} />

        {/* Players - Age Group Level */}
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/players/:playerId" element={<PlayerProfilePage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/players/:playerId/abilities" element={<PlayerAbilitiesPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/players/:playerId/report-card" element={<PlayerReportCardPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/players/:playerId/development-plans" element={<PlayerDevelopmentPlansPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/players/:playerId/settings" element={<PlayerSettingsPage />} />

        {/* Teams */}
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams" element={<TeamsListPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/new" element={<AddEditTeamPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId" element={<TeamOverviewPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/edit" element={<AddEditTeamPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/squad" element={<TeamPlayersPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/coaches" element={<TeamCoachesPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/kits" element={<TeamKitsPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/settings" element={<TeamSettingsPage />} />

        {/* Matches */}
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/matches" element={<MatchesListPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/new" element={<AddEditMatchPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/matches/:matchId" element={<MatchReportPage />} />

        {/* Training */}
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/training/:sessionId" element={<TrainingSessionPage />} />

        {/* Global Resources */}
        <Route path="/formations" element={<FormationsLibraryPage />} />
        <Route path="/training-sessions" element={<TrainingLibraryPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
