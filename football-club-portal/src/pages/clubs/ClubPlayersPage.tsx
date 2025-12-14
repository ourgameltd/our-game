import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { getClubById } from '@data/clubs';
import { getPlayersByClubId } from '@data/players';
import { getTeamsByClubId } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { Routes } from '@utils/routes';
import PlayerCard from '@components/player/PlayerCard';
import PageNavigation from '@components/navigation/PageNavigation';
import { getClubNavigationTabs } from '@utils/navigationHelpers';

export default function ClubPlayersPage() {
  const { clubId } = useParams();
  const club = getClubById(clubId!);
  const allPlayers = getPlayersByClubId(clubId!);
  const teams = getTeamsByClubId(clubId!);

  const [searchName, setSearchName] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterTeam, setFilterTeam] = useState('');

  if (!club) {
    return <div>Club not found</div>;
  }

  // Group players by age group based on date of birth
  const getAgeGroup = (dateOfBirth: Date): string => {
    const birthYear = dateOfBirth.getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    if (age <= 8) return 'U8s';
    if (age <= 10) return 'U10s';
    if (age <= 12) return 'U12s';
    if (age <= 14) return 'U14s';
    if (age <= 16) return 'U16s';
    if (age <= 18) return 'U18s';
    return 'Senior';
  };

  // Get unique positions from all players
  const allPositions = useMemo(() => {
    const positions = new Set<string>();
    allPlayers.forEach(player => {
      player.preferredPositions.forEach(pos => positions.add(pos));
    });
    return Array.from(positions).sort();
  }, [allPlayers]);

  // Get unique age groups from all players
  const allAgeGroups = useMemo(() => {
    const ageGroups = new Set<string>();
    allPlayers.forEach(player => {
      ageGroups.add(getAgeGroup(player.dateOfBirth));
    });
    const ageGroupOrder = ['U8s', 'U10s', 'U12s', 'U14s', 'U16s', 'U18s', 'Senior'];
    return Array.from(ageGroups).sort(
      (a, b) => ageGroupOrder.indexOf(a) - ageGroupOrder.indexOf(b)
    );
  }, [allPlayers]);

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
        if (getAgeGroup(player.dateOfBirth) !== filterAgeGroup) {
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

      return true;
    });
  }, [allPlayers, searchName, filterAgeGroup, filterPosition, filterTeam]);

  // Group filtered players by age group
  const playersByAgeGroup = useMemo(() => {
    return filteredPlayers.reduce((acc, player) => {
      const ageGroup = getAgeGroup(player.dateOfBirth);
      if (!acc[ageGroup]) {
        acc[ageGroup] = [];
      }
      acc[ageGroup].push(player);
      return acc;
    }, {} as Record<string, typeof filteredPlayers>);
  }, [filteredPlayers]);

  // Sort age groups
  const ageGroupOrder = ['U8s', 'U10s', 'U12s', 'U14s', 'U16s', 'U18s', 'Senior'];
  const sortedAgeGroups = Object.keys(playersByAgeGroup).sort(
    (a, b) => ageGroupOrder.indexOf(a) - ageGroupOrder.indexOf(b)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getClubNavigationTabs(clubId!)} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Club Players ({allPlayers.length})</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredPlayers.length !== allPlayers.length 
                ? `Showing ${filteredPlayers.length} of ${allPlayers.length} players`
                : 'View and manage all players registered to the club'}
            </p>
          </div>
          <button className="btn-success btn-md">
            + Add New Player
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
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
                  <option key={ageGroup} value={ageGroup}>{ageGroup}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
              <select 
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Teams</option>
                {teams.map(team => {
                  const ageGroup = getAgeGroupById(team.ageGroupId);
                  return (
                    <option key={team.id} value={team.id}>
                      {ageGroup?.name || ''} - {team.name}
                    </option>
                  );
                })}
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
                  Age: {filterAgeGroup}
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
        </div>

        {/* Players grouped by age */}
        {sortedAgeGroups.map((ageGroup) => (
          <div key={ageGroup} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {ageGroup} ({playersByAgeGroup[ageGroup].length} players)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {playersByAgeGroup[ageGroup].map((player) => {
                const playerTeam = teams.find(t => player.teamIds.includes(t.id));
                return (
                  <Link
                    key={player.id}
                    to={playerTeam ? Routes.player(clubId!, playerTeam.ageGroupId, playerTeam.id, player.id) : '#'}
                  >
                    <div className="relative">
                      <PlayerCard player={player} />
                      {player.teamIds.length > 1 && (
                        <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          {player.teamIds.length} teams
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredPlayers.length === 0 && allPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">⚽</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first player to the club</p>
            <button className="btn-success btn-md">
              + Add First Player
            </button>
          </div>
        )}

        {filteredPlayers.length === 0 && allPlayers.length > 0 && (
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
