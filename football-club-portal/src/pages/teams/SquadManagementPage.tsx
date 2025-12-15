import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { getTeamById } from '@data/teams';
import { getPlayersByTeamId, getPlayersByAgeGroupId } from '@data/players';
import PlayerCard from '@components/player/PlayerCard';
import PageNavigation from '@components/navigation/PageNavigation';
import PageTitle from '@components/common/PageTitle';
import { getTeamNavigationTabs } from '@utils/navigationHelpers';
import { Routes } from '@utils/routes';

export default function SquadManagementPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const team = getTeamById(teamId!);
  const teamPlayers = getPlayersByTeamId(teamId!);
  const ageGroupPlayers = team ? getPlayersByAgeGroupId(team.ageGroupId) : [];
  const [showAddModal, setShowAddModal] = useState(false);

  if (!team) {
    return <div>Team not found</div>;
  }

  // Get players from age group who aren't already in this team
  const availablePlayers = ageGroupPlayers.filter(
    player => !player.teamIds.includes(teamId!)
  );

  // Group team players by position
  const goalkeepers = teamPlayers.filter(p => p.preferredPositions.includes('GK'));
  const defenders = teamPlayers.filter(p => 
    p.preferredPositions.some(pos => ['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(pos))
  );
  const midfielders = teamPlayers.filter(p => 
    p.preferredPositions.some(pos => ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos))
  );
  const forwards = teamPlayers.filter(p => 
    p.preferredPositions.some(pos => ['LW', 'RW', 'CF', 'ST'].includes(pos))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getTeamNavigationTabs(clubId!, ageGroupId!, teamId!)} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-grow">
            <PageTitle
              title="Squad List"
              badge={teamPlayers.length}
              subtitle="Select players from the club roster to add to this team"
              action={!team.isArchived ? {
                label: '+ Add Player from Club',
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
              ⚠️ This team is archived. Players cannot be added or removed while the team is archived.
            </p>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Club-Level Player Management</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Players are registered at the club level and can be assigned to multiple teams. 
                Add players from the club roster below, or{' '}
                <Link to={Routes.clubPlayers(clubId!)} className="font-medium underline text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  view all club players
                </Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Goalkeepers */}
        {goalkeepers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🥅</span> Goalkeepers ({goalkeepers.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goalkeepers.map((player) => (
                <div key={player.id} className="relative group">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {player.teamIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {player.teamIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Defenders */}
        {defenders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🛡️</span> Defenders ({defenders.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {defenders.map((player) => (
                <div key={player.id} className="relative group">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {player.ageGroupIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {player.ageGroupIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Midfielders */}
        {midfielders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>⚙️</span> Midfielders ({midfielders.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {midfielders.map((player) => (
                <div key={player.id} className="relative group">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {player.ageGroupIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {player.ageGroupIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forwards */}
        {forwards.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚡</span> Forwards ({forwards.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forwards.map((player) => (
                <div key={player.id} className="relative group">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                  {!team.isArchived && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove from team"
                    >
                      ✕
                    </button>
                  )}
                  {player.ageGroupIds.length > 1 && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {player.ageGroupIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {teamPlayers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No players in this team yet</h3>
            <p className="text-gray-600 mb-4">Add players from your club roster to build your squad</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-success btn-md"
            >
              + Add Players from Club
            </button>
          </div>
        )}

        {/* Add Player Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Players to Team</h2>
                  <p className="text-gray-600 mt-1">Select players from the club roster ({availablePlayers.length} available)</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {availablePlayers.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {availablePlayers.map((player) => (
                      <div key={player.id} className="relative">
                        <PlayerCard player={player} />
                        <button
                          className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 shadow-lg"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">All club players are already assigned to this team</p>
                    <Link
                      to={Routes.clubPlayers(clubId!)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Add new players to the club →
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

