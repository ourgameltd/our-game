import { useParams } from 'react-router-dom';
import { getCoachById } from '@data/coaches';
import { getTeamsByIds } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { getClubById } from '@data/clubs';
import CoachDetailsHeader from '@components/coach/CoachDetailsHeader';

export default function CoachProfilePage() {
  const { clubId, coachId } = useParams();
  const coach = getCoachById(coachId!);
  const club = getClubById(clubId!);

  if (!coach || !club) {
    return <div>Coach not found</div>;
  }

  const teams = getTeamsByIds(coach.teamIds);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <CoachDetailsHeader coach={coach} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biography */}
            {coach.biography && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Biography</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {coach.biography}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <a href={`mailto:${coach.email}`} className="text-secondary-600 dark:text-secondary-400 hover:underline">
                    {coach.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <a href={`tel:${coach.phone}`} className="text-secondary-600 dark:text-secondary-400 hover:underline">
                    {coach.phone}
                  </a>
                </div>
                {coach.associationId && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">FA Registration ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{coach.associationId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Teams */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Assigned Teams</h2>
              {teams.length > 0 ? (
                <div className="space-y-2">
                  {teams.map(team => {
                    const ageGroup = getAgeGroupById(team.ageGroupId);
                    return (
                      <div key={team.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ageGroup?.name} - {team.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {team.season}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Not assigned to any teams</p>
              )}
            </div>

            {/* Specializations */}
            {coach.specializations && coach.specializations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {coach.specializations.map((spec, index) => (
                    <span key={index} className="badge-secondary">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
