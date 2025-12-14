import { useParams, Link } from 'react-router-dom';
import { getAgeGroupById } from '@data/ageGroups';
import { getCoachesByAgeGroup } from '@data/coaches';
import { getTeamsByAgeGroupId } from '@data/teams';
import CoachCard from '@components/coach/CoachCard';
import PageNavigation from '@components/navigation/PageNavigation';
import PageTitle from '@components/common/PageTitle';
import { getAgeGroupNavigationTabs } from '@utils/navigationHelpers';
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
      {/* Navigation Tabs */}
      <PageNavigation tabs={getAgeGroupNavigationTabs(clubId!, ageGroupId!)} />

      <main className="container mx-auto px-4 py-8">
        <PageTitle
          title={`${ageGroup.name} - Coaches`}
          badge={ageGroupCoaches.length}
          subtitle={`Coaches assigned to teams in the ${ageGroup.name} age group`}
        />

        {/* Info Banner */}
        <div className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Age Group Coach Overview</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This page shows coaches working across all teams in the {ageGroup.name} age group. 
                Coaches may work with multiple teams within this age group.{' '}
                <Link to={Routes.teams(clubId!, ageGroupId!)} className="font-medium underline text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300">
                  View teams
                </Link> to see which coaches are assigned to each team.
              </p>
            </div>
          </div>
        </div>

        {/* Head Coaches */}
        {headCoaches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>👨‍🏫</span> Head Coaches ({headCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {headCoaches.map((coach) => (
                <div key={coach.id} className="relative">
                  <Link to={Routes.coach(clubId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 right-2 bg-secondary-600 text-white text-xs px-2 py-1 rounded-full">
                      {coach.teamIds.length} teams
                    </div>
                  )}
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
                  <Link to={Routes.coach(clubId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 right-2 bg-secondary-600 text-white text-xs px-2 py-1 rounded-full">
                      {coach.teamIds.length} teams
                    </div>
                  )}
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
                  <Link to={Routes.coach(clubId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 right-2 bg-secondary-600 text-white text-xs px-2 py-1 rounded-full">
                      {coach.teamIds.length} teams
                    </div>
                  )}
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
