import { Link } from 'react-router-dom';
import { samplePlayers } from '@data/players';
import { currentUser } from '@data/currentUser';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { useMyTeams, useMyChildren } from '@/api/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export default function ClubsListPage() {
  // Get authenticated user information
  const { isLoading: authLoading } = useAuth();

  // Fetch teams the current user has access to
  const { data: myTeams, isLoading: myTeamsLoading, error: myTeamsError } = useMyTeams();

  // Fetch children for the current user (if they are a parent)
  const { data: myChildren, isLoading: myChildrenLoading, error: myChildrenError } = useMyChildren();

  const myTeamsList = myTeams ?? [];
  const hasMyTeams = myTeamsList.length > 0;

  const myChildrenList = myChildren ?? [];
  const hasMyChildren = myChildrenList.length > 0;

  // Extract unique clubs from teams data
  const myClubs = useMemo(() => {
    if (!myTeams || myTeams.length === 0) return [];
    
    const clubMap = new Map();
    myTeams.forEach(team => {
      if (team.club && team.clubId && !clubMap.has(team.clubId)) {
        clubMap.set(team.clubId, {
          id: team.clubId,
          name: team.club.name,
          shortName: team.club.shortName,
          logo: team.club.logo,
          primaryColor: team.club.primaryColor,
          secondaryColor: team.club.secondaryColor,
          accentColor: team.club.accentColor,
          foundedYear: team.club.foundedYear,
        });
      }
    });
    return Array.from(clubMap.values());
  }, [myTeams]);

  const hasClubs = myClubs.length > 0;

  // Get the current user's own player profile (if they are a player)
  const myProfile = currentUser.playerId 
    ? samplePlayers.filter(p => p.id === currentUser.playerId) 
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">

        <PageTitle
          title={"Welcome!"}
          subtitle="You can find things here quickly. Select a club or information relevant to you to get started."
        />

        {/* Quick Access Section */}
        {(hasMyTeams || myProfile.length > 0 || myChildrenLoading || hasMyChildren || authLoading) && (
          <div className="mb-4 space-y-2">
            {/* My Children */}
            {(myChildrenLoading || myChildrenError || hasMyChildren) && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  My Children
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  {myChildrenLoading && (
                    <div className="animate-pulse space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      ))}
                    </div>
                  )}

                  {myChildrenError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-800 dark:text-red-200 font-medium">Failed to load your children</p>
                      <p className="text-red-600 dark:text-red-300 text-sm mt-1">{myChildrenError.message}</p>
                    </div>
                  )}

                  {hasMyChildren && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myChildrenList.map((player) => {
                        // Parse preferred positions (stored as comma-separated string)
                        const preferredPositions = player.preferredPositions 
                          ? player.preferredPositions.split(',').map(p => p.trim())
                          : [];
                        
                        // Get the first age group for the route
                        const firstAgeGroupId = player.ageGroups.length > 0 ? player.ageGroups[0].id : '';
                        
                        return (
                          <Link
                            key={player.id}
                            to={Routes.player(player.clubId, firstAgeGroupId, player.id)}
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
                                {player.club?.shortName} • {preferredPositions.join(', ')}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* My Profile */}
            {(myProfile.length > 0 || authLoading) && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  My Profile
                </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                {authLoading ? (
                  <div className="animate-pulse grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myProfile.map((player) => {
                      const club = myClubs.find(c => c.id === player.clubId);
                      
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
                )}
              </div>
              </>
            )}
          </div>
        )}

        {/* My Teams */}
        {(myTeamsLoading || myTeamsError || hasMyTeams) && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              My Teams
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
              {myTeamsLoading && (
                <div className="animate-pulse grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  ))}
                </div>
              )}

              {myTeamsError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-medium">Failed to load your teams</p>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">{myTeamsError.message}</p>
                </div>
              )}

              {hasMyTeams && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myTeamsList.map((team) => {
                    if (!team.id || !team.clubId || !team.ageGroupId) {
                      return null;
                    }
                    
                    return (
                      <Link
                        key={team.id}
                        to={Routes.team(team.clubId, team.ageGroupId, team.id)}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                      >
                        {team.club?.logo ? (
                          <img 
                            src={team.club.logo} 
                            alt={`${team.club.name} logo`}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: team.colors?.primary || team.club?.primaryColor || '#3b82f6' }}
                          >
                            {(team.name || '').substring(0, 2)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {team.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {team.club?.shortName} • {team.season}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Clubs Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            My Clubs
          </h2>
          
          {/* Loading State */}
          {myTeamsLoading && (
            <div className="animate-pulse grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {myTeamsError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">Failed to load clubs</p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{myTeamsError.message}</p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-2">
                💡 Make sure Azure Functions is running: <code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">cd api/OurGame.Api && func start</code>
              </p>
            </div>
          )}

          {/* Clubs Grid - Derived from teams data */}
          {!myTeamsLoading && !myTeamsError && hasClubs && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClubs.map((club) => (
                <Link
                  key={club.id}
                  to={Routes.club(club.id!)}
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
                        style={{ backgroundColor: club.primaryColor || '#3b82f6' }}
                      >
                        {club.shortName}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {club.name}
                      </h3>
                    </div>
                  </div>
                  
                  {club.foundedYear && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Founded</span>
                        <span className="font-medium text-gray-900 dark:text-white">{club.foundedYear}</span>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
