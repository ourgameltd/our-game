import { useParams } from 'react-router-dom';
import { useCoach } from '@/api/hooks';
import { Routes } from '@utils/routes';
import { coachRoleDisplay } from '@/constants/coachRoleDisplay';
import PageTitle from '@components/common/PageTitle';

// Skeleton for the page title area
function PageTitleSkeleton() {
  return (
    <div className="flex items-center gap-4 mb-6 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

// Skeleton for the contact information card
function ContactSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-4">
        <div>
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div>
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div>
          <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for the teams card
function TeamsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-4 w-36 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for the specializations card
function SpecializationsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
}

// Skeleton for the biography card
function BiographySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function CoachProfilePage() {
  const { clubId, coachId, ageGroupId, teamId } = useParams();
  const { data: coach, isLoading, error } = useCoach(coachId);

  // Resolve context names from coach's team assignments when available
  const contextAgeGroupName = ageGroupId && coach
    ? coach.teams.find(t => t.ageGroupId === ageGroupId)?.ageGroupName
      ?? coach.ageGroupCoordinatorRoles.find(r => r.ageGroupId === ageGroupId)?.ageGroupName
      ?? 'Age Group'
    : null;

  const contextTeamName = teamId && coach
    ? coach.teams.find(t => t.teamId === teamId)?.teamName ?? 'Team'
    : null;

  // Determine back link based on context (team, age group, or club)
  let backLink: string;
  let subtitle: string;
  if (teamId && ageGroupId) {
    backLink = Routes.teamCoaches(clubId!, ageGroupId, teamId);
    subtitle = `${contextAgeGroupName || 'Age Group'} • ${contextTeamName || 'Team'}`;
  } else if (ageGroupId) {
    backLink = Routes.ageGroupCoaches(clubId!, ageGroupId);
    subtitle = contextAgeGroupName || 'Age Group';
  } else {
    backLink = Routes.clubCoaches(clubId!);
    subtitle = 'Club Coaches';
  }

  // Determine settings link based on context
  let settingsLink: string;
  if (teamId && ageGroupId) {
    settingsLink = Routes.teamCoachSettings(clubId!, ageGroupId, teamId, coachId!);
  } else if (ageGroupId) {
    settingsLink = Routes.ageGroupCoachSettings(clubId!, ageGroupId, coachId!);
  } else {
    settingsLink = Routes.coachSettings(clubId!, coachId!);
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coach not found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error.message || 'The coach you are looking for could not be loaded.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Not found after loading completes
  if (!isLoading && !coach) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coach not found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The coach you are looking for does not exist or you do not have access.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const handleSendInvite = () => {
    if (coach) {
      alert(`Invite sent to ${coach.email}! (Demo - not actually sent)`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title with Back Button */}
        {isLoading || !coach ? (
          <PageTitleSkeleton />
        ) : (
          <PageTitle
            title={`${coach.firstName} ${coach.lastName}`}
            subtitle={`${coachRoleDisplay[coach.role] || coach.roleDisplay} • ${subtitle}`}
            backLink={backLink}
            image={{
              src: coach.photo,
              alt: `${coach.firstName} ${coach.lastName}`,
              initials: `${coach.firstName[0]}${coach.lastName[0]}`,
              colorClass: 'from-secondary-500 to-secondary-600'
            }}
            action={{
              label: 'Settings',
              href: settingsLink,
              icon: 'settings',
              title: 'Coach Settings'
            }}
          />
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Contact Information */}
          {isLoading || !coach ? (
            <ContactSkeleton />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Contact Information</h2>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    {coach.hasAccount ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Account Active
                      </span>
                    ) : (
                      <button
                        onClick={handleSendInvite}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Invite
                      </button>
                    )}
                  </div>
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
          )}

          {/* Teams */}
          {isLoading || !coach ? (
            <TeamsSkeleton />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Assigned Teams</h2>
              {coach.teams.length > 0 ? (
                <div className="space-y-2">
                  {coach.teams.map(team => (
                    <div key={team.teamId} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {team.ageGroupName} - {team.teamName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {coachRoleDisplay[team.role] || team.roleDisplay}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Not assigned to any teams</p>
              )}
            </div>
          )}

          {/* Specializations */}
          {isLoading ? (
            <SpecializationsSkeleton />
          ) : (
            coach && coach.specializations && coach.specializations.length > 0 && (
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
            )
          )}
        </div>
        
        {/* Main Content */}
        <div>
          {/* Biography */}
          {isLoading ? (
            <BiographySkeleton />
          ) : (
            coach && coach.biography && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Biography</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {coach.biography}
                </p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
