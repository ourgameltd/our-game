import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Plus } from 'lucide-react';
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

        {/* All Coaches */}
        {teamCoaches.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
              {teamCoaches.map((coach) => (
                <Link key={coach.id} to={Routes.teamCoach(clubId!, ageGroupId!, teamId!, coach.id)}>
                  <CoachCard 
                    coach={coach}
                    badges={
                      coach.teamIds.length > 1 ? (
                        <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          {coach.teamIds.length} teams
                        </span>
                      ) : undefined
                    }
                    actions={
                      !team.isArchived ? (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                          title="Remove from team"
                        >
                          ✕
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
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              title="Assign Coaches"
            >
              <Plus className="w-5 h-5" />
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
                          className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 shadow-lg flex items-center justify-center"
                          title="Assign Coach"
                        >
                          <Plus className="w-5 h-5" />
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
