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
import ClubKitsPage from '@pages/clubs/ClubKitsPage';
import AgeGroupsListPage from '@pages/ageGroups/AgeGroupsListPage';
import AgeGroupOverviewPage from '@pages/ageGroups/AgeGroupOverviewPage';
import AgeGroupPlayersPage from '@pages/ageGroups/AgeGroupPlayersPage';
import TeamsListPage from '@pages/teams/TeamsListPage';
import TeamOverviewPage from '@pages/teams/TeamOverviewPage';
import SquadManagementPage from '@pages/teams/SquadManagementPage';
import TeamKitsPage from '@pages/teams/TeamKitsPage';
import PlayerProfilePage from '@pages/players/PlayerProfilePage';
import PlayerAbilitiesPage from '@pages/players/PlayerAbilitiesPage';
import MatchReportPage from '@pages/matches/MatchReportPage';
import MatchesListPage from '@pages/matches/MatchesListPage';
import AddEditMatchPage from '@pages/matches/AddEditMatchPage';
import TrainingSessionPage from '@pages/training/TrainingSessionPage';
import FormationsLibraryPage from '@pages/formations/FormationsLibraryPage';
import TrainingLibraryPage from '@pages/training/TrainingLibraryPage';
import PlayerReportCardPage from '@pages/players/PlayerReportCardPage';
import PlayerTrainingPlanPage from '@pages/players/PlayerTrainingPlanPage';
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
        <Route path="/clubs/:clubId/kits" element={<ClubKitsPage />} />

        {/* Age Groups */}
        <Route path="/clubs/:clubId/age-groups" element={<AgeGroupsListPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId" element={<AgeGroupOverviewPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/players" element={<AgeGroupPlayersPage />} />

        {/* Teams */}
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams" element={<TeamsListPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId" element={<TeamOverviewPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/squad" element={<SquadManagementPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/kits" element={<TeamKitsPage />} />

        {/* Players - Team Level */}
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId" element={<PlayerProfilePage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/abilities" element={<PlayerAbilitiesPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/report-card" element={<PlayerReportCardPage />} />
        <Route path="/clubs/:clubId/age-groups/:ageGroupId/teams/:teamId/players/:playerId/development" element={<PlayerTrainingPlanPage />} />

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
