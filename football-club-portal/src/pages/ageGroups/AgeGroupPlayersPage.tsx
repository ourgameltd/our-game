import { useParams, Link } from 'react-router-dom';
import { getAgeGroupById } from '@data/ageGroups';
import { getPlayersByAgeGroupId } from '@data/players';
import PlayerCard from '@components/player/PlayerCard';
import PageNavigation from '@components/navigation/PageNavigation';
import PageTitle from '@components/common/PageTitle';
import { getAgeGroupNavigationTabs } from '@utils/navigationHelpers';
import { Routes } from '@utils/routes';

export default function AgeGroupPlayersPage() {
  const { clubId, ageGroupId } = useParams();
  const ageGroup = getAgeGroupById(ageGroupId!);
  const ageGroupPlayers = getPlayersByAgeGroupId(ageGroupId!);

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
      {/* Navigation Tabs */}
      <PageNavigation tabs={getAgeGroupNavigationTabs(clubId!, ageGroupId!)} />

      <main className="container mx-auto px-4 py-8">
        <PageTitle
          title={`${ageGroup.name} - Players`}
          badge={ageGroupPlayers.length}
          subtitle={`Players registered to teams in the ${ageGroup.name} age group`}
        />

        {/* Info Banner */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Age Group Player Overview</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This page shows players across all teams in the {ageGroup.name} age group. 
                Players may be assigned to multiple teams within this age group.{' '}
                <Link to={Routes.teams(clubId!, ageGroupId!)} className="font-medium underline text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  View teams
                </Link> to manage individual team squads.
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
                <div key={player.id} className="relative">
                  {/* We'll link to first team for now - could be improved to show team selection */}
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.teamIds[0], player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                  {player.teamIds.length > 1 && (
                    <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
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
                <div key={player.id} className="relative">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.teamIds[0], player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                  {player.teamIds.length > 1 && (
                    <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {player.teamIds.length} teams
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
                <div key={player.id} className="relative">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.teamIds[0], player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                  {player.teamIds.length > 1 && (
                    <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {player.teamIds.length} teams
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
                <div key={player.id} className="relative">
                  <Link
                    to={Routes.player(clubId!, ageGroupId!, player.teamIds[0], player.id)}
                  >
                    <PlayerCard player={player} />
                  </Link>
                  {player.teamIds.length > 1 && (
                    <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {player.teamIds.length} teams
                    </div>
                  )}
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
