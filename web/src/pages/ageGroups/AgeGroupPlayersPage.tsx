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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={`${ageGroup.name} - Players`}
          badge={ageGroupPlayers.length}
          subtitle={`Players registered to teams in the ${ageGroup.name} age group`}
        />

        {/* Archived Toggle */}
        <div className="mb-4 flex items-center gap-2">
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

        {/* Players List */}
        {ageGroupPlayers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {ageGroupPlayers.map((player) => (
              <Link
                key={player.id}
                to={Routes.player(clubId!, ageGroupId!, player.id)}
              >
                <PlayerCard 
                  player={player}
                  badges={player.isArchived ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      🗄️ Archived
                    </span>
                  ) : undefined}
                />
              </Link>
            ))}
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


