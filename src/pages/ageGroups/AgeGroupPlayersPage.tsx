import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { getAgeGroupById } from '@data/ageGroups';
import { getPlayersByAgeGroupId } from '@data/players';
import PlayerCard from '@components/player/PlayerCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function AgeGroupPlayersPage() {
  const { clubId, ageGroupId } = useParams();
  const [showArchived, setShowArchived] = useState(false);
  const ageGroup = getAgeGroupById(ageGroupId!);
  const ageGroupPlayers = getPlayersByAgeGroupId(ageGroupId!, showArchived);

  if (!ageGroup) {
    return <div>Age Group not found</div>;
  }

  // Group players by position
  const goalkeepers = ageGroupPlayers.filter(p => p.preferredPositions.includes('GK'));
  const defenders = ageGroupPlayers.filter(p => 
    p.preferredPositions.some(pos => ['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(pos))
  );
  const midfielders = ageGroupPlayers.filter(p => 
    p.preferredPositions.some(pos => ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos))
  );
  const forwards = ageGroupPlayers.filter(p => 
    p.preferredPositions.some(pos => ['LW', 'RW', 'CF', 'ST'].includes(pos))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title={`${ageGroup.name} - Players`}
          badge={ageGroupPlayers.length}
          subtitle={`Players registered to teams in the ${ageGroup.name} age group`}
        />

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
                <div key={player.id} className="relative">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
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
                <div key={player.id} className="relative">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
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
                <div key={player.id} className="relative">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
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
                <div key={player.id} className="relative">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {ageGroupPlayers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players in this age group yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Players will appear here once they are assigned to teams in this age group
            </p>
            <Link
              to={Routes.teams(clubId!, ageGroupId!)}
              className="btn-primary btn-md inline-block"
            >
              View Teams
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}


