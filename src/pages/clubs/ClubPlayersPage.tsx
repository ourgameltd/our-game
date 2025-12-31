import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getClubById } from '@data/clubs';
import { getPlayersByClubId } from '@data/players';
import { getTeamsByClubId } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { Routes } from '@utils/routes';
import PlayerCard from '@components/player/PlayerCard';
import PageTitle from '@components/common/PageTitle';

export default function ClubPlayersPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const club = getClubById(clubId!);
  const allPlayers = getPlayersByClubId(clubId!);
  const teams = getTeamsByClubId(clubId!);

  const [searchName, setSearchName] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  if (!club) {
    return <div>Club not found</div>;
  }

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
    const ageGroupIds = new Set<string>();
    allPlayers.forEach(player => {
      player.ageGroupIds.forEach(id => ageGroupIds.add(id));
    });
    return Array.from(ageGroupIds)
      .map(id => {
        const ageGroup = getAgeGroupById(id);
        return ageGroup ? { id, name: ageGroup.name } : null;
      })
      .filter((ag): ag is { id: string; name: string } => ag !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
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
            onClick: () => navigate(Routes.clubPlayerSettings(clubId!, 'new')),
            variant: 'success'
          }}
        />

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          {/* Show Archived Toggle */}
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
          
          {showFilters && (
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

        {/* Players List */}
        {filteredPlayers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {filteredPlayers.map((player) => (
              <Link key={player.id} to={Routes.player(clubId!, player.ageGroupIds[0], player.id)}>
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

        {filteredPlayers.length === 0 && allPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">⚽</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first player to the club</p>
            <button className="btn-success btn-md flex items-center gap-2" title="Add First Player">
              <Plus className="w-5 h-5" />
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

