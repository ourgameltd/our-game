import { useParams, useNavigate } from 'react-router-dom';
import { getClubById } from '@data/clubs';
import { getAgeGroupsByClubId } from '@data/ageGroups';
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
          />
          <PreviousResultsCard 
            matches={stats.previousResults.slice(0, 3)}
            viewAllLink={Routes.club(clubId!)}
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
