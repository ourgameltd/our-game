import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { getTeamById } from '@data/teams';
import { getCoachesByTeamId, getCoachesByClubId } from '@data/coaches';
import CoachCard from '@components/coach/CoachCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function TeamCoachesPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const team = getTeamById(teamId!);
  const teamCoaches = getCoachesByTeamId(teamId!);
  const clubCoaches = team ? getCoachesByClubId(team.clubId) : [];
  const [showAddModal, setShowAddModal] = useState(false);

  if (!team) {
    return <div>Team not found</div>;
  }

  // Get coaches from club who aren't already assigned to this team
  const availableCoaches = clubCoaches.filter(
    coach => !coach.teamIds.includes(teamId!)
  );

  // Group coaches by role
  const headCoaches = teamCoaches.filter(c => c.role === 'head-coach');
  const assistantCoaches = teamCoaches.filter(c => c.role === 'assistant-coach');
  const goalkeepingCoaches = teamCoaches.filter(c => c.role === 'goalkeeper-coach');
  const fitnessCoaches = teamCoaches.filter(c => c.role === 'fitness-coach');
  const otherCoaches = teamCoaches.filter(c => !['head-coach', 'assistant-coach', 'goalkeeper-coach', 'fitness-coach'].includes(c.role));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-grow">
            <PageTitle
              title="Coaching Staff"
              badge={teamCoaches.length}
              subtitle="Assign coaches from the club to manage this team"
              action={!team.isArchived ? {
                label: '+ Assign Coach',
                onClick: () => setShowAddModal(true),
                variant: 'success'
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
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. Coaches cannot be assigned or removed while the team is archived.
            </p>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Club-Level Coach Management</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Coaches are registered at the club level and can be assigned to multiple teams. 
                Assign coaches from the club below, or{' '}
                <Link to={Routes.clubCoaches(clubId!)} className="font-medium underline text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  view all club coaches
                </Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Head Coaches */}
        {headCoaches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>👨‍🏫</span> Head Coach{headCoaches.length > 1 ? 'es' : ''} ({headCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {headCoaches.map((coach) => (
                <div key={coach.id} className="relative group">
                  <Link to={Routes.teamCoach(clubId!, ageGroupId!, teamId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
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
              <span>🤝</span> Assistant Coach{assistantCoaches.length > 1 ? 'es' : ''} ({assistantCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {assistantCoaches.map((coach) => (
                <div key={coach.id} className="relative group">
                  <Link to={Routes.teamCoach(clubId!, ageGroupId!, teamId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {coach.teamIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goalkeeper Coaches */}
        {goalkeepingCoaches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🧤</span> Goalkeeper Coach{goalkeepingCoaches.length > 1 ? 'es' : ''} ({goalkeepingCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {goalkeepingCoaches.map((coach) => (
                <div key={coach.id} className="relative group">
                  <Link to={Routes.teamCoach(clubId!, ageGroupId!, teamId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {coach.teamIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fitness Coaches */}
        {fitnessCoaches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>💪</span> Fitness Coach{fitnessCoaches.length > 1 ? 'es' : ''} ({fitnessCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {fitnessCoaches.map((coach) => (
                <div key={coach.id} className="relative group">
                  <Link to={Routes.teamCoach(clubId!, ageGroupId!, teamId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {coach.teamIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Coaches */}
        {otherCoaches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>👔</span> Other Staff ({otherCoaches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherCoaches.map((coach) => (
                <div key={coach.id} className="relative group">
                  <Link to={Routes.teamCoach(clubId!, ageGroupId!, teamId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {coach.teamIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {teamCoaches.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches assigned yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Assign coaches from your club to manage this team</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-success btn-md"
            >
              + Assign Coaches
            </button>
          </div>
        )}

        {/* Assign Coach Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Coaches to Team</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Select coaches from the club ({availableCoaches.length} available)</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {availableCoaches.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableCoaches.map((coach) => (
                      <div key={coach.id} className="relative">
                        <CoachCard coach={coach} />
                        <button
                          className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 shadow-lg"
                        >
                          + Assign
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
