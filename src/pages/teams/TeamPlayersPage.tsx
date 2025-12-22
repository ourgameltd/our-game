import { useParams, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { getTeamById } from '@data/teams';
import { getPlayersByTeamId, getPlayersByAgeGroupId } from '@data/players';
import PlayerCard from '@components/player/PlayerCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function TeamPlayersPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const [showArchived, setShowArchived] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const team = getTeamById(teamId!);
  const teamPlayers = getPlayersByTeamId(teamId!, showArchived);
  const ageGroupPlayers = team ? getPlayersByAgeGroupId(team.ageGroupId) : [];

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
      <main className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-grow">
            <PageTitle
              title="Squad List"
              badge={teamPlayers.length}
              subtitle="Select players from the club to add to this team"
              action={!team.isArchived ? {
                label: 'Add Player from Club',
                icon: 'plus',
                title: 'Add Player from Club',
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

        {/* Archived Toggle */}
        <div className="mb-6 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show archived players
            </span>
          </label>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
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
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players in this team yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add players from your club to build your squad</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-success btn-md flex items-center gap-2"
              title="Add Players from Club"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Add Player Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Players to Team</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Select players from the club ({availablePlayers.length} available)</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
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
                          className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 shadow-lg flex items-center gap-1"
                          title="Add Player"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">All club players are already assigned to this team</p>
                    <Link
                      to={Routes.clubPlayers(clubId!)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
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

