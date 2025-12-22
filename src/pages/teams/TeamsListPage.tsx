import { Link, useParams } from 'react-router-dom';
import { getClubById } from '@data/clubs';
import { getTeamsByAgeGroupId } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import TeamCard from '@components/team/TeamCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function TeamsListPage() {
  const { clubId, ageGroupId } = useParams();
  const club = getClubById(clubId!);
  const ageGroup = getAgeGroupById(ageGroupId!);
  const teams = getTeamsByAgeGroupId(ageGroupId!);

  if (!club) {
    return <div>Club not found</div>;
  }

  if (!ageGroup) {
    return <div>Age group not found</div>;
  }

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Link
                key={team.id}
                to={Routes.team(clubId!, ageGroupId!, team.id)}
              >
                <TeamCard team={team} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
