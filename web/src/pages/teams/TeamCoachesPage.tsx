import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useTeamOverview, useTeamCoaches, useClubCoaches, useAssignTeamCoach, useRemoveTeamCoach } from '@/api/hooks';
import CoachCard from '@components/coach/CoachCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { mapUiRoleToApi } from '@/api/mappers';

export default function TeamCoachesPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  
  // Fetch team data
  const { data: teamOverview, isLoading: teamLoading, error: teamError } = useTeamOverview(teamId);
  const team = teamOverview?.team;
  
  // Fetch coaches data
  const { data: teamCoaches = [], isLoading: coachesLoading, error: coachesError } = useTeamCoaches(teamId);
  const { data: clubCoaches = [], isLoading: clubCoachesLoading, error: clubCoachesError } = useClubCoaches(team?.clubId);
  
  // Mutation hooks
  const { assignCoach, isSubmitting: isAssigning, error: assignError } = useAssignTeamCoach(teamId);
  const { removeCoach, isSubmitting: isRemoving, error: removeError } = useRemoveTeamCoach(teamId);
  
  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingCoachId, setRemovingCoachId] = useState<string | null>(null);

  // Loading state
  const isLoading = teamLoading || coachesLoading;

  // Error handling
  if (teamError || coachesError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
                  Error Loading Data
                </h2>
                <p className="text-red-700 dark:text-red-400">
                  {teamError?.message || coachesError?.message || 'Failed to load team or coaches data'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          {/* Page Title Skeleton */}
          <div className="mb-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>
          
          {/* Coaches List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  // Get coaches from club who aren't already assigned to this team
  const availableCoaches = clubCoaches.filter(
    coach => !teamCoaches.some(tc => tc.id === coach.id)
  );

  const handleAssignCoach = async (coachId: string, role: string) => {
    try {
      await assignCoach({
        coachId,
        role: mapUiRoleToApi(role) // Convert UI role (head-coach) to API role (HeadCoach)
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to assign coach:', err);
    }
  };

  const handleRemoveCoach = async (coachId: string) => {
    setRemovingCoachId(coachId);
    try {
      await removeCoach(coachId);
    } catch (err) {
      console.error('Failed to remove coach:', err);
    } finally {
      setRemovingCoachId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-grow">
            <PageTitle
              title="Coaching Staff"
              badge={teamCoaches.length}
              subtitle="Assign coaches from the club to manage this team"
              action={!team.isArchived ? {
                label: 'Assign Coach',
                onClick: () => setShowAddModal(true),
                variant: 'success',
                icon: 'plus'
              } : undefined}
            />
          </div>
          {team.isArchived && (
            <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
              🗄️ Archived
            </span>
          )}
        </div>

        {/* Archived Notice */}
        {team.isArchived && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. Coaches cannot be assigned or removed while the team is archived.
            </p>
          </div>
        )}

        {/* Error Messages */}
        {assignError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">
                Failed to assign coach: {assignError.message}
              </p>
            </div>
          </div>
        )}

        {removeError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">
                Failed to remove coach: {removeError.message}
              </p>
            </div>
          </div>
        )}

        {/* All Coaches */}
        {teamCoaches.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
              {teamCoaches.map((coach) => (
                <Link key={coach.id} to={Routes.teamCoach(clubId!, ageGroupId!, teamId!, coach.id)}>
                  <CoachCard 
                    coach={{
                      id: coach.id || '',
                      clubId: team.clubId,
                      firstName: coach.firstName || '',
                      lastName: coach.lastName || '',
                      dateOfBirth: new Date(),
                      photo: coach.photoUrl,
                      email: '',
                      phone: '',
                      teamIds: [],
                      role: coach.role as any || 'assistant-coach',
                      isArchived: coach.isArchived
                    }}
                    badges={
                      coach.role && (
                        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs px-2 py-1 rounded-full">
                          {coach.role}
                        </span>
                      )
                    }
                    actions={
                      !team.isArchived ? (
                        <button
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            if (coach.id && !isRemoving) {
                              handleRemoveCoach(coach.id);
                            }
                          }}
                          disabled={isRemoving || removingCoachId === coach.id}
                          className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          title="Remove from team"
                        >
                          {removingCoachId === coach.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            '✕'
                          )}
                        </button>
                      ) : undefined
                    }
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {teamCoaches.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches assigned yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Assign coaches from your club to manage this team</p>
            {!team.isArchived && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                title="Assign Coaches"
              >
                <Plus className="w-5 h-5" />
                Assign Coach
              </button>
            )}
          </div>
        )}

        {/* Assign Coach Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Coaches to Team</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {clubCoachesLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading coaches...
                      </span>
                    ) : (
                      `Select coaches from the club (${availableCoaches.length} available)`
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isAssigning}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {clubCoachesError && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">
                      Failed to load club coaches: {clubCoachesError.message}
                    </p>
                  </div>
                )}
                
                {clubCoachesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : availableCoaches.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableCoaches.map((coach) => (
                      <div key={coach.id} className="relative">
                        <CoachCard 
                          coach={{
                            id: coach.id,
                            clubId: coach.clubId,
                            firstName: coach.firstName,
                            lastName: coach.lastName,
                            dateOfBirth: coach.dateOfBirth ? new Date(coach.dateOfBirth) : new Date(),
                            photo: coach.photo,
                            email: coach.email || '',
                            phone: coach.phone || '',
                            teamIds: coach.teams?.map(t => t.id) || [],
                            role: coach.role as any || 'assistant-coach',
                            isArchived: coach.isArchived
                          }}
                          badges={
                            coach.teams && coach.teams.length > 0 ? (
                              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                                {coach.teams.length} team{coach.teams.length !== 1 ? 's' : ''}
                              </span>
                            ) : undefined
                          }
                        />
                        <button
                          onClick={() => handleAssignCoach(coach.id, 'assistant-coach')}
                          disabled={isAssigning}
                          className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Assign Coach"
                        >
                          {isAssigning ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">All club coaches are already assigned to this team</p>
                    <Link
                      to={Routes.clubCoaches(clubId!)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      Add new coaches to the club →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
