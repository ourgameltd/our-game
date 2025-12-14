import { useParams } from 'react-router-dom';
import { getCoachById } from '@data/coaches';
import { getTeamsByIds } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { getClubById } from '@data/clubs';
import CoachDetailsHeader from '@components/coach/CoachDetailsHeader';
import PageNavigation from '@components/navigation/PageNavigation';
import { getCoachNavigationTabs } from '@utils/navigationHelpers';

export default function CoachProfilePage() {
  const { clubId, coachId } = useParams();
  const coach = getCoachById(coachId!);
  const club = getClubById(clubId!);

  if (!coach || !club) {
    return <div>Coach not found</div>;
  }

  const teams = getTeamsByIds(coach.teamIds);

  const handleSendInvite = () => {
    // In a real app, this would send an invite email via the backend
    alert(`Invite sent to ${coach.email}! (Demo - not actually sent)`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageNavigation tabs={getCoachNavigationTabs(clubId!, coachId!)} />
      
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
