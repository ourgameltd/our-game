import { useParams, useNavigate } from 'react-router-dom';
import { getClubById } from '@data/clubs';
import { getAgeGroupsByClubId, getAgeGroupById } from '@data/ageGroups';
import { getClubStatistics } from '@data/statistics';
import { getTeamById } from '@data/teams';
import StatsGrid from '@components/stats/StatsGrid';
import UpcomingMatchesCard from '@components/matches/UpcomingMatchesCard';
import PreviousResultsCard from '@components/matches/PreviousResultsCard';
import PageNavigation from '@components/navigation/PageNavigation';
import { getClubNavigationTabs } from '@utils/navigationHelpers';
import { Routes } from '@utils/routes';

export default function ClubOverviewPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const club = getClubById(clubId!);
  const ageGroups = getAgeGroupsByClubId(clubId!);
  const stats = getClubStatistics(clubId!);

  if (!club) {
    return <div>Club not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getClubNavigationTabs(clubId!)} />

      <main className="container mx-auto px-4 py-8">
        {/* Header with Settings Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{club.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Club Overview</p>
          </div>
          <button
            onClick={() => navigate(Routes.clubSettings(clubId!))}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <span>⚙️</span>
            Settings
          </button>
        </div>

        {/* Stats Overview */}
        <StatsGrid 
          stats={stats} 
          onPlayerCountClick={() => navigate(Routes.clubPlayers(clubId!))}
          additionalInfo={`${ageGroups.length} age groups`}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <UpcomingMatchesCard 
            matches={stats.upcomingMatches.slice(0, 3)}
            viewAllLink={Routes.club(clubId!)}
            showTeamInfo={true}
            getTeamInfo={(match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                const ageGroup = getAgeGroupById(team.ageGroupId);
                return {
                  teamName: team.name,
                  ageGroupName: ageGroup?.name || 'Unknown'
                };
              }
              return null;
            }}
            getMatchLink={(matchId) => {
              const match = stats.upcomingMatches.find(m => m.id === matchId);
              if (match) {
                const team = getTeamById(match.teamId);
                if (team) {
                  return Routes.matchReport(clubId!, team.ageGroupId, match.teamId, matchId);
                }
              }
              return '#';
            }}
          />
          <PreviousResultsCard 
            matches={stats.previousResults.slice(0, 3)}
            viewAllLink={Routes.club(clubId!)}
            showTeamInfo={true}
            getTeamInfo={(match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                const ageGroup = getAgeGroupById(team.ageGroupId);
                return {
                  teamName: team.name,
                  ageGroupName: ageGroup?.name || 'Unknown'
                };
              }
              return null;
            }}
            getMatchLink={(matchId, match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                return Routes.matchReport(clubId!, team.ageGroupId, match.teamId, matchId);
              }
              return '#';
            }}
          />
        </div>
      </main>
    </div>
  );
}
