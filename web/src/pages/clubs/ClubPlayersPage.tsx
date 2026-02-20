import { Link, useNavigate } from 'react-router-dom';
import { useRequiredParams } from '@utils/routeParams';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { apiClient } from '@/api';
import type { ClubPlayerDto, ClubTeamDto, ClubDetailDto } from '@/api';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import type { Player, PlayerPosition, PlayerAttributes } from '@/types';

// Skeleton component for player card loading state
function PlayerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 md:rounded-none md:shadow-none md:p-0 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b flex flex-col md:flex-row md:items-center md:gap-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3 md:mb-0 md:flex-shrink-0 md:order-1">
        <div className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 min-w-0 md:hidden">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="hidden md:flex md:items-baseline md:gap-2 md:min-w-48 md:flex-shrink-0 md:order-2">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="hidden md:block md:w-16 md:flex-shrink-0 md:order-3">
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="mb-3 md:mb-0 md:w-32 md:flex-shrink-0 md:order-4">
        <div className="flex flex-wrap gap-1">
          <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="md:flex-1 md:order-5">
        <div className="hidden md:flex md:gap-4 md:justify-end">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

// Helper to map API DTO to Player type for PlayerCard compatibility
function mapApiPlayerToPlayer(apiPlayer: ClubPlayerDto): Player {
  const defaultAttributes: PlayerAttributes = {
    ballControl: 50, crossing: 50, weakFoot: 50, dribbling: 50, finishing: 50,
    freeKick: 50, heading: 50, longPassing: 50, longShot: 50, penalties: 50,
    shortPassing: 50, shotPower: 50, slidingTackle: 50, standingTackle: 50, volleys: 50,
    acceleration: 50, agility: 50, balance: 50, jumping: 50, pace: 50,
    reactions: 50, sprintSpeed: 50, stamina: 50, strength: 50,
    aggression: 50, attackingPosition: 50, awareness: 50, communication: 50,
    composure: 50, defensivePositioning: 50, interceptions: 50, marking: 50,
    positivity: 50, positioning: 50, vision: 50
  };

  return {
    id: apiPlayer.id,
    clubId: apiPlayer.clubId,
    firstName: apiPlayer.firstName,
    lastName: apiPlayer.lastName,
    nickname: apiPlayer.nickname,
    dateOfBirth: apiPlayer.dateOfBirth ? new Date(apiPlayer.dateOfBirth) : new Date(),
    photo: apiPlayer.photo,
    associationId: apiPlayer.associationId,
    preferredPositions: apiPlayer.preferredPositions as PlayerPosition[],
    attributes: defaultAttributes,
    overallRating: apiPlayer.overallRating || 50,
    evaluations: [],
    ageGroupIds: apiPlayer.ageGroups.map(ag => ag.id),
    teamIds: apiPlayer.teams.map(t => t.id),
    isArchived: apiPlayer.isArchived
  };
}

// Dynamically import PlayerCard to avoid issues if not needed during loading
import PlayerCard from '@components/player/PlayerCard';

export default function ClubPlayersPage() {
  // Validate route parameters
  const params = useRequiredParams(['clubId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const navigate = useNavigate();

  // API state
  const [apiPlayers, setApiPlayers] = useState<ClubPlayerDto[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState<string | null>(null);

  const [teams, setTeams] = useState<ClubTeamDto[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [_club, setClub] = useState<ClubDetailDto | null>(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [clubError, setClubError] = useState<string | null>(null);

  // Filter state
  const [searchName, setSearchName] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from API
  useEffect(() => {
    if (!clubId) return;

    // Fetch players (always include archived, filter client-side)
    setPlayersLoading(true);
    apiClient.clubs.getPlayers(clubId, true)
      .then((response) => {
        if (response.success && response.data) {
          setApiPlayers(response.data);
          setPlayersError(null);
        } else {
          setPlayersError(response.error?.message || 'Failed to load players');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch players:', err);
        setPlayersError('Failed to load players from API');
      })
      .finally(() => setPlayersLoading(false));

    // Fetch teams
    setTeamsLoading(true);
    apiClient.clubs.getTeams(clubId, true)
      .then((response) => {
        if (response.success && response.data) {
          setTeams(response.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch teams:', err);
      })
      .finally(() => setTeamsLoading(false));

    // Fetch club
    setClubLoading(true);
    apiClient.clubs.getClubById(clubId)
      .then((response) => {
        if (response.success && response.data) {
          setClub(response.data);
          setClubError(null);
        } else {
          setClubError(response.error?.message || 'Failed to load club');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch club:', err);
        setClubError('Failed to load club from API');
      })
      .finally(() => setClubLoading(false));
  }, [clubId]);

  // Map API players to Player type for compatibility with existing components
  const allPlayers = useMemo(() => {
    return apiPlayers.map(mapApiPlayerToPlayer);
  }, [apiPlayers]);

  // Get unique positions from all players
  const allPositions = useMemo(() => {
    const positions = new Set<string>();
    allPlayers.forEach(player => {
      player.preferredPositions.forEach(pos => positions.add(pos));
    });
    return Array.from(positions).sort();
  }, [allPlayers]);

  // Get unique age groups from all players (using API data directly)
  const allAgeGroups = useMemo(() => {
    const ageGroupMap = new Map<string, string>();
    apiPlayers.forEach(player => {
      player.ageGroups.forEach(ag => {
        if (!ageGroupMap.has(ag.id)) {
          ageGroupMap.set(ag.id, ag.name);
        }
      });
    });
    return Array.from(ageGroupMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [apiPlayers]);

  // Filter players based on search and filters
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(player => {
      // Name filter
      if (searchName) {
        const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
        if (!fullName.includes(searchName.toLowerCase())) {
          return false;
        }
      }

      // Age group filter
      if (filterAgeGroup) {
        if (!player.ageGroupIds.includes(filterAgeGroup)) {
          return false;
        }
      }

      // Position filter
      if (filterPosition) {
        if (!player.preferredPositions.includes(filterPosition as any)) {
          return false;
        }
      }

      // Team filter
      if (filterTeam) {
        if (!player.teamIds.includes(filterTeam)) {
          return false;
        }
      }

      // Archived filter
      if (!showArchived && player.isArchived) {
        return false;
      }

      return true;
    });
  }, [allPlayers, searchName, filterAgeGroup, filterPosition, filterTeam, showArchived]);

  // Invalid parameters state
  if (!clubId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invalid Page Parameters</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Club ID is required to view this page.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              The URL may be malformed or contain invalid values.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title with loading state */}
        {(clubLoading || playersLoading) ? (
          <div className="animate-pulse mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : clubError ? (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load club</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{clubError}</p>
          </div>
        ) : (
          <PageTitle
            title="All Club Players"
            badge={allPlayers.filter(p => !p.isArchived).length}
            subtitle={
              filteredPlayers.length !== allPlayers.length 
                ? `Showing ${filteredPlayers.length} of ${allPlayers.length} players${allPlayers.filter(p => p.isArchived).length > 0 ? ` (${allPlayers.filter(p => p.isArchived).length} archived)` : ''}`
                : `View and manage players registered to the club${allPlayers.filter(p => p.isArchived).length > 0 ? ` (${allPlayers.filter(p => p.isArchived).length} archived)` : ''}`
            }
            action={{
              label: 'Add New Player',
              icon: 'plus',
              title: 'Add New Player',
              onClick: () => navigate(Routes.clubPlayerSettings(clubId, 'new')),
              variant: 'success'
            }}
          />
        )}

        {/* Players error message */}
        {playersError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load players</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{playersError}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          {/* Show Archived Toggle */}
          {playersLoading ? (
            <div className="flex items-center justify-between gap-4 mb-4 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : (
          <div className="flex items-center justify-between gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show archived players ({allPlayers.filter(p => p.isArchived).length})
              </span>
            </label>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              {showFilters ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Filters
                </>
              )}
            </button>
          </div>
          )}
          
          {showFilters && !playersLoading && (
            <>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Name</label>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Group</label>
                    <select 
                      value={filterAgeGroup}
                      onChange={(e) => setFilterAgeGroup(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Age Groups</option>
                      {allAgeGroups.map(ageGroup => (
                        <option key={ageGroup.id} value={ageGroup.id}>{ageGroup.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                    <select 
                      value={filterTeam}
                      onChange={(e) => setFilterTeam(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={teamsLoading}
                    >
                      <option value="">All Teams</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.ageGroupName} - {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                    <select 
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Positions</option>
                      {allPositions.map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
          
              {/* Active filters display and clear */}
              {(searchName || filterAgeGroup || filterPosition || filterTeam) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                  {searchName && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Name: {searchName}
                      <button onClick={() => setSearchName('')} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                    </span>
                  )}
                  {filterAgeGroup && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Age: {allAgeGroups.find(ag => ag.id === filterAgeGroup)?.name || filterAgeGroup}
                      <button onClick={() => setFilterAgeGroup('')} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                    </span>
                  )}
                  {filterPosition && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Position: {filterPosition}
                      <button onClick={() => setFilterPosition('')} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                    </span>
                  )}
                  {filterTeam && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Team: {teams.find(t => t.id === filterTeam)?.name}
                      <button onClick={() => setFilterTeam('')} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setSearchName('');
                      setFilterAgeGroup('');
                      setFilterPosition('');
                      setFilterTeam('');
                    }}
                    className="ml-auto text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Players List - Loading State */}
        {playersLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <PlayerCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Players List */}
        {!playersLoading && filteredPlayers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {filteredPlayers.map((player) => (
              <Link key={player.id} to={player.ageGroupIds[0] ? Routes.player(clubId, player.ageGroupIds[0], player.id) : '#'}>
                <PlayerCard 
                  player={player}
                  badges={
                    player.isArchived ? (
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs px-2 py-1 rounded-full font-medium">
                        🗄️ Archived
                      </span>
                    ) : undefined
                  }
                />
              </Link>
            ))}
          </div>
        )}

        {!playersLoading && filteredPlayers.length === 0 && allPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">⚽</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first player to the club</p>
            <button className="btn-success btn-md flex items-center gap-2" title="Add First Player">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {!playersLoading && filteredPlayers.length === 0 && allPlayers.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters to see more results</p>
            <button 
              onClick={() => {
                setSearchName('');
                setFilterAgeGroup('');
                setFilterPosition('');
                setFilterTeam('');
              }}
              className="btn-secondary btn-md"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

