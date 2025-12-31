import { useParams, useNavigate } from 'react-router-dom';
import { getClubById } from '@data/clubs';
import { getTeamsByAgeGroupId } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { getTeamStatistics } from '@data/statistics';
import TeamListCard from '@components/team/TeamListCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function TeamsListPage() {
  const { clubId, ageGroupId } = useParams();
  const navigate = useNavigate();
  const club = getClubById(clubId!);
  const ageGroup = getAgeGroupById(ageGroupId!);
  const teams = getTeamsByAgeGroupId(ageGroupId!);

  if (!club) {
    return <div>Club not found</div>;
  }

  if (!ageGroup) {
    return <div>Age group not found</div>;
  }

  // Helper function to get team stats
  const getTeamStats = (team: typeof teams[0]) => {
    const stats = getTeamStatistics(team.id);
    return {
      playerCount: team.playerIds.length,
      coachCount: team.coachIds.length,
      matchesPlayed: stats.matchesPlayed,
      wins: stats.wins,
      draws: stats.draws,
      losses: stats.losses,
      winRate: stats.winRate,
      goalDifference: stats.goalDifference
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title={`${ageGroup.name} Teams`}
          subtitle={ageGroup.description}
        />

        {teams.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No teams found for this age group.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {teams.map((team) => (
              <TeamListCard
                key={team.id}
                team={team}
                club={club}
                ageGroup={ageGroup}
                stats={getTeamStats(team)}
                onClick={team.isArchived ? undefined : () => navigate(Routes.team(clubId!, ageGroupId!, team.id))}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
