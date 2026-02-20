import { Link } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { 
  useTeamOverview, 
  useAgeGroupPlayers, 
  useTeamPlayers,
  useAddTeamPlayer,
  useRemoveTeamPlayer,
  type AgeGroupPlayerDto,
  type TeamPlayerDto
} from '@/api';
import PlayerCard from '@components/player/PlayerCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { Player, PlayerAttributes } from '@/types';
import { useRequiredParams } from '@utils/routeParams';

export default function TeamPlayersPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Extract and validate route parameters
  let clubId: string | undefined = undefined;
  let ageGroupId: string | undefined = undefined;
  let teamId: string | undefined = undefined;
  let paramError: Error | null = null;

  try {
    const params = useRequiredParams(['clubId', 'ageGroupId', 'teamId']);
    clubId = params.clubId;
    ageGroupId = params.ageGroupId;
    teamId = params.teamId;
  } catch (error) {
    paramError = error as Error;
  }

  // Fetch data from API - only make calls if we have valid params
  const teamOverview = useTeamOverview(teamId);
  const ageGroupPlayersData = useAgeGroupPlayers(ageGroupId, showArchived);
  const teamPlayersData = useTeamPlayers(teamId, showArchived);
  
  // Mutations
  const addPlayerMutation = useAddTeamPlayer(teamId);
  const removePlayerMutation = useRemoveTeamPlayer(teamId);

  // Map API data to Player type and filter for team players
  const { teamPlayers, availablePlayers, squadNumberMap } = useMemo(() => {
    const ageGroupPlayers = ageGroupPlayersData.data || [];
    const teamPlayerDtos = teamPlayersData.data || [];
    
    // Helper to map AgeGroupPlayerDto to Player
    const mapAgeGroupPlayerToPlayer = (player: AgeGroupPlayerDto): Player => ({
      id: player.id,
      clubId: player.clubId,
      firstName: player.firstName,
      lastName: player.lastName,
      nickname: player.nickname,
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : new Date(),
      photo: player.photo,
      associationId: player.associationId,
      preferredPositions: player.preferredPositions as any[],
      attributes: {
        ballControl: player.attributes?.dribbling ?? 0,
        crossing: player.attributes?.crossing ?? 0,
        weakFoot: player.attributes?.weakFoot ?? 0,
        dribbling: player.attributes?.dribbling ?? 0,
        finishing: player.attributes?.finishing ?? 0,
        freeKick: player.attributes?.shotPower ?? 0,
        heading: player.attributes?.heading ?? 0,
        longPassing: player.attributes?.longPassing ?? 0,
        longShot: player.attributes?.longShots ?? 0,
        penalties: player.attributes?.penalties ?? 0,
        shortPassing: player.attributes?.shortPassing ?? 0,
        shotPower: player.attributes?.shotPower ?? 0,
        slidingTackle: player.attributes?.slidingTackle ?? 0,
        standingTackle: player.attributes?.standingTackle ?? 0,
        volleys: player.attributes?.volleys ?? 0,
        acceleration: player.attributes?.acceleration ?? 0,
        agility: player.attributes?.agility ?? 0,
        balance: player.attributes?.balance ?? 0,
        jumping: player.attributes?.jumping ?? 0,
        pace: player.attributes?.pace ?? 0,
        reactions: player.attributes?.reactions ?? 0,
        sprintSpeed: player.attributes?.sprintSpeed ?? 0,
        stamina: player.attributes?.stamina ?? 0,
        strength: player.attributes?.physicalStrength ?? 0,
        aggression: player.attributes?.aggression ?? 0,
        attackingPosition: player.attributes?.offensiveAwareness ?? 0,
        awareness: player.attributes?.defensiveAwareness ?? 0,
        communication: player.attributes?.leadership ?? 0,
        composure: player.attributes?.composure ?? 0,
        defensivePositioning: player.attributes?.defensiveAwareness ?? 0,
        interceptions: player.attributes?.interceptions ?? 0,
        marking: player.attributes?.marking ?? 0,
        positivity: player.attributes?.workRate ?? 0,
        positioning: player.attributes?.positioning ?? 0,
        vision: player.attributes?.vision ?? 0,
      } as PlayerAttributes,
      overallRating: player.overallRating ?? 0,
      evaluations: [],
      ageGroupIds: player.ageGroupIds ?? [],
      teamIds: player.teamIds ?? [],
      parentIds: player.parentIds,
      isArchived: player.isArchived,
    });
    
    // Create squad number map
    const squadMap: Record<string, number> = {};
    teamPlayerDtos.forEach((tp: TeamPlayerDto) => {
      if (tp.squadNumber) {
        squadMap[tp.id] = tp.squadNumber;
      }
    });

    // Filter age group players to only those in the team
    const teamPlayerIds = new Set(teamPlayerDtos.map(tp => tp.id));
    const team = ageGroupPlayers
      .filter(p => teamPlayerIds.has(p.id))
      .map(mapAgeGroupPlayerToPlayer);
    
    // Get available players (not in team)
    const available = ageGroupPlayers
      .filter(p => !teamPlayerIds.has(p.id))
      .map(mapAgeGroupPlayerToPlayer);

    return {
      teamPlayers: team,
      availablePlayers: available,
      squadNumberMap: squadMap
    };
  }, [ageGroupPlayersData.data, teamPlayersData.data]);

  const team = teamOverview.data?.team;

  // Auto-compute next available squad number
  const getNextSquadNumber = (): number => {
    const usedNumbers = Object.values(squadNumberMap).sort((a, b) => a - b);
    for (let i = 1; i <= 99; i++) {
      if (!usedNumbers.includes(i)) {
        return i;
      }
    }
    return usedNumbers.length + 1;
  };

  // Handle remove player
  const handleRemovePlayer = async (playerId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (team?.isArchived) return;
    await removePlayerMutation.removePlayer(playerId);
  };

  // Handle add player
  const handleAddPlayer = async (playerId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const squadNumber = getNextSquadNumber();
    await addPlayerMutation.addPlayer({ playerId, squadNumber });
  };

  // Parameter validation error
  if (paramError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
                  Invalid Route Parameters
                </h2>
                <p className="text-red-700 dark:text-red-400 mb-4">
                  {paramError.message}
                </p>
                <Link 
                  to={Routes.dashboard()}
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (teamOverview.isLoading || ageGroupPlayersData.isLoading || teamPlayersData.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          {/* Title skeleton */}
          <div className="mb-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>
          
          {/* Toggle skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          
          {/* List skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 md:rounded-none md:p-4 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (teamOverview.error || ageGroupPlayersData.error || teamPlayersData.error) {
    const error = teamOverview.error || ageGroupPlayersData.error || teamPlayersData.error;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading data</h3>
            <p className="text-gray-600 dark:text-gray-400">{error?.message}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
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
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. Players cannot be added or removed while the team is archived.
            </p>
          </div>
        )}

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
        {teamPlayers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {teamPlayers.map((player) => (
              <Link key={player.id} to={Routes.player(clubId!, ageGroupId!, player.id)}>
                <PlayerCard 
                  player={player}
                  squadNumber={squadNumberMap[player.id]}
                  badges={
                    player.teamIds.length > 1 ? (
                      <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                        {player.teamIds.length} teams
                      </span>
                    ) : undefined
                  }
                  actions={
                    !team.isArchived ? (
                      <button
                        onClick={(e) => handleRemovePlayer(player.id, e)}
                        disabled={removePlayerMutation.isSubmitting}
                        className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from team"
                      >
                        {removePlayerMutation.isSubmitting ? '...' : '✕'}
                      </button>
                    ) : undefined
                  }
                />
              </Link>
            ))}
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
                          onClick={(e) => handleAddPlayer(player.id, e)}
                          disabled={addPlayerMutation.isSubmitting}
                          className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 shadow-lg flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Add Player"
                        >
                          {addPlayerMutation.isSubmitting ? '...' : <Plus className="w-4 h-4" />}
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

