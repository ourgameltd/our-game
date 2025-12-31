import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getClubById } from '@data/clubs';
import { getAgeGroupsByClubId, getAgeGroupById } from '@data/ageGroups';
import { getClubStatistics, getAgeGroupStatistics } from '@data/statistics';
import { getTeamById, getTeamsByAgeGroupId } from '@data/teams';
import StatsGrid from '@components/stats/StatsGrid';
import MatchesCard from '@components/matches/MatchesCard';
import AgeGroupListCard from '@components/ageGroup/AgeGroupListCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function ClubOverviewPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const club = getClubById(clubId!);
  const ageGroups = getAgeGroupsByClubId(clubId!)
    .filter(ag => !ag.isArchived)
    .sort((a, b) => a.name.localeCompare(b.name));
  const stats = getClubStatistics(clubId!);

  if (!club) {
    return <div>Club not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title={club.name}
          subtitle="Club Overview"
          action={{
            label: 'Settings',
            icon: 'settings',
            title: 'Settings',
            onClick: () => navigate(Routes.clubSettings(clubId!)),
            variant: 'primary'
          }}
        />

        {/* Stats Overview */}
        <StatsGrid 
          stats={stats} 
          onPlayerCountClick={() => navigate(Routes.clubPlayers(clubId!))}
          additionalInfo={`${ageGroups.length} age groups`}
        />

        {/* Age Groups Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Age Groups</h3>
            <Link
              to={Routes.ageGroupNew(clubId!)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
          
          {ageGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
              {ageGroups.map(ageGroup => {
                const ageGroupStats = getAgeGroupStatistics(ageGroup.id);
                const ageGroupTeams = getTeamsByAgeGroupId(ageGroup.id);
                
                return (
                  <Link
                    key={ageGroup.id}
                    to={Routes.ageGroup(clubId!, ageGroup.id)}
                    className="block"
                  >
                    <AgeGroupListCard
                      ageGroup={ageGroup}
                      club={club}
                      stats={{
                        teamCount: ageGroupTeams.length,
                        playerCount: ageGroupStats.playerCount,
                        matchesPlayed: ageGroupStats.matchesPlayed,
                        wins: ageGroupStats.wins,
                        draws: ageGroupStats.draws,
                        losses: ageGroupStats.losses,
                        winRate: ageGroupStats.winRate,
                        goalDifference: ageGroupStats.goalDifference
                      }}
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No age groups yet in this club</p>
              <Link
                to={Routes.ageGroupNew(clubId!)}
                className="inline-flex px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create First Age Group
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <MatchesCard 
            type="upcoming"
            matches={stats.upcomingMatches}
            limit={3}
            viewAllLink={Routes.clubMatches(clubId!)}
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
          <MatchesCard 
            type="results"
            matches={stats.previousResults}
            limit={3}
            viewAllLink={Routes.clubMatches(clubId!)}
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
