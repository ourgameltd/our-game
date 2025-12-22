import { Link } from 'react-router-dom';
import { sampleClubs } from '@data/clubs';
import { sampleTeams } from '@data/teams';
import { samplePlayers } from '@data/players';
import { currentUser } from '@data/currentUser';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function ClubsListPage() {
  // Get teams assigned to the current user (if they are a coach/staff)
  const myTeams = currentUser.staffId 
    ? sampleTeams.filter(team => team.coachIds.includes(currentUser.staffId!))
    : [];

  // Get the current user's own player profile (if they are a player)
  const myProfile = currentUser.playerId 
    ? samplePlayers.filter(p => p.id === currentUser.playerId) 
    : [];

  // Get children's player profiles (if they are a parent)
  const myChildren = currentUser.childrenIds 
    ? samplePlayers.filter(p => currentUser.childrenIds!.includes(p.id)) 
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title="Clubs You Have Access To"
          subtitle="Select a club to view details and manage teams"
        />

        {/* Quick Access Section */}
        {(myTeams.length > 0 || myProfile.length > 0 || myChildren.length > 0) && (
          <div className="mb-8 space-y-6">
            {/* My Teams */}
            {myTeams.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  My Teams
                </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myTeams.map((team) => {
                    const club = sampleClubs.find(c => c.id === team.clubId);
                    
                    return (
                      <Link
                        key={team.id}
                        to={Routes.team(team.clubId, team.ageGroupId, team.id)}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                      >
                        {club?.logo ? (
                          <img 
                            src={club.logo} 
                            alt={`${club.name} logo`}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: team.colors?.primary || club?.colors.primary }}
                          >
                            {team.shortName || team.name.substring(0, 2)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {team.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {club?.shortName} • {team.season}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              </>
            )}

            {/* My Profile */}
            {myProfile.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  My Profile
                </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myProfile.map((player) => {
                    const club = sampleClubs.find(c => c.id === player.clubId);
                    
                    return (
                      <Link
                        key={player.id}
                        to={Routes.player(player.clubId, player.ageGroupIds[0], player.id)}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                      >
                        {player.photo ? (
                          <img 
                            src={player.photo} 
                            alt={`${player.firstName} ${player.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                            {player.firstName[0]}{player.lastName[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {club?.shortName} • {player.preferredPositions.join(', ')}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              </>
            )}

            {/* My Children */}
            {myChildren.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  My Children
                </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myChildren.map((player) => {
                    const club = sampleClubs.find(c => c.id === player.clubId);
                    
                    return (
                      <Link
                        key={player.id}
                        to={Routes.player(player.clubId, player.ageGroupIds[0], player.id)}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                      >
                        {player.photo ? (
                          <img 
                            src={player.photo} 
                            alt={`${player.firstName} ${player.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                            {player.firstName[0]}{player.lastName[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {club?.shortName} • {player.preferredPositions.join(', ')}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              </>
            )}
          </div>
        )}

        {/* Clubs Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All Clubs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleClubs.map((club) => (
              <Link
                key={club.id}
                to={Routes.club(club.id)}
                className="card-hover group"
              >
                <div className="flex items-center gap-4 mb-4">
                  {club.logo ? (
                    <img 
                      src={club.logo} 
                      alt={`${club.name} logo`}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div 
                      className="w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold text-white"
                      style={{ backgroundColor: club.colors.primary }}
                    >
                      {club.shortName}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {club.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{club.location.city}, {club.location.country}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Founded</span>
                    <span className="font-medium text-gray-900 dark:text-white">{club.founded}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
