import { useParams, Link } from 'react-router-dom';
import { getAgeGroupById } from '@data/ageGroups';
import { getCoachesByAgeGroup } from '@data/coaches';
import { getTeamsByAgeGroupId } from '@data/teams';
import CoachCard from '@components/coach/CoachCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function AgeGroupCoachesPage() {
  const { clubId, ageGroupId } = useParams();
  const ageGroup = getAgeGroupById(ageGroupId!);
  const teams = getTeamsByAgeGroupId(ageGroupId!);
  const ageGroupCoaches = getCoachesByAgeGroup(ageGroupId!, teams);

  if (!ageGroup) {
    return <div>Age Group not found</div>;
  }

  // Group coaches by role
  const headCoaches = ageGroupCoaches.filter(c => c.role === 'head-coach');
  const assistantCoaches = ageGroupCoaches.filter(c => c.role === 'assistant-coach');
  const specialistCoaches = ageGroupCoaches.filter(c => 
    ['goalkeeper-coach', 'fitness-coach', 'technical-coach'].includes(c.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title={`${ageGroup.name} - Coaches`}
          badge={ageGroupCoaches.length}
          subtitle={`Coaches assigned to teams in the ${ageGroup.name} age group`}
        />

        {/* Head Coaches */}
        {headCoaches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>👨‍🏫</span> Head Coaches ({headCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {headCoaches.map((coach) => (
                <div key={coach.id} className="relative">
                  <Link to={Routes.ageGroupCoach(clubId!, ageGroupId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assistant Coaches */}
        {assistantCoaches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🤝</span> Assistant Coaches ({assistantCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assistantCoaches.map((coach) => (
                <div key={coach.id} className="relative">
                  <Link to={Routes.ageGroupCoach(clubId!, ageGroupId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialist Coaches */}
        {specialistCoaches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>⚙️</span> Specialist Coaches ({specialistCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialistCoaches.map((coach) => (
                <div key={coach.id} className="relative">
                  <Link to={Routes.ageGroupCoach(clubId!, ageGroupId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {ageGroupCoaches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches assigned yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Assign coaches to teams in this age group to see them here
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
