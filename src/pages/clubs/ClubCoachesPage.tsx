import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getClubById } from '@data/clubs';
import { getCoachesByClub } from '@data/coaches';
import { getTeamsByClubId } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { coachRoleDisplay } from '@/data/referenceData';
import { Routes } from '@utils/routes';
import CoachCard from '@components/coach/CoachCard';
import PageTitle from '@components/common/PageTitle';

export default function ClubCoachesPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const club = getClubById(clubId!);
  const allCoaches = getCoachesByClub(clubId!);
  const teams = getTeamsByClubId(clubId!);

  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  if (!club) {
    return <div>Club not found</div>;
  }

  // Get unique roles from all coaches
  const allRoles = useMemo(() => {
    const roles = new Set<string>();
    allCoaches.forEach(coach => {
      roles.add(coach.role);
    });
    return Array.from(roles).sort();
  }, [allCoaches]);

  // Get unique age groups from coaches' team assignments
  const allAgeGroups = useMemo(() => {
    const ageGroupIds = new Set<string>();
    allCoaches.forEach(coach => {
      coach.teamIds.forEach(teamId => {
        const team = teams.find(t => t.id === teamId);
        if (team) {
          ageGroupIds.add(team.ageGroupId);
        }
      });
    });
    return Array.from(ageGroupIds)
      .map(id => {
        const ageGroup = getAgeGroupById(id);
        return ageGroup ? { id, name: ageGroup.name } : null;
      })
      .filter((ag): ag is { id: string; name: string } => ag !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allCoaches, teams]);

  // Filter coaches based on search and filters
  const filteredCoaches = useMemo(() => {
    return allCoaches.filter(coach => {
      // Name filter
      if (searchName) {
        const fullName = `${coach.firstName} ${coach.lastName}`.toLowerCase();
        if (!fullName.includes(searchName.toLowerCase())) {
          return false;
        }
      }

      // Role filter
      if (filterRole) {
        if (coach.role !== filterRole) {
          return false;
        }
      }

      // Age group filter
      if (filterAgeGroup) {
        const coachTeams = coach.teamIds.map(teamId => teams.find(t => t.id === teamId)).filter(Boolean);
        if (!coachTeams.some(team => team?.ageGroupId === filterAgeGroup)) {
          return false;
        }
      }

      // Team filter
      if (filterTeam) {
        if (!coach.teamIds.includes(filterTeam)) {
          return false;
        }
      }

      // Archived filter
      if (!showArchived && coach.isArchived) {
        return false;
      }

      return true;
    });
  }, [allCoaches, searchName, filterRole, filterTeam, showArchived]);

  // Group filtered coaches by role
  const coachesByRole = useMemo(() => {
    return filteredCoaches.reduce((acc, coach) => {
      const role = coachRoleDisplay[coach.role] || coach.role;
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(coach);
      return acc;
    }, {} as Record<string, typeof filteredCoaches>);
  }, [filteredCoaches]);

  // Filter teams by age group for the team dropdown
  const filteredTeams = useMemo(() => {
    if (!filterAgeGroup) return teams;
    return teams.filter(team => team.ageGroupId === filterAgeGroup);
  }, [teams, filterAgeGroup]);

  // Sort roles by priority
  const roleOrder = ['Head Coach', 'Assistant Coach', 'Goalkeeper Coach', 'Fitness Coach', 'Technical Coach'];
  const sortedRoles = Object.keys(coachesByRole).sort(
    (a, b) => {
      const indexA = roleOrder.indexOf(a);
      const indexB = roleOrder.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title="All Club Coaches"
          badge={allCoaches.filter(c => !c.isArchived).length}
          subtitle={
            filteredCoaches.length !== allCoaches.length 
              ? `Showing ${filteredCoaches.length} of ${allCoaches.length} coaches${allCoaches.filter(c => c.isArchived).length > 0 ? ` (${allCoaches.filter(c => c.isArchived).length} archived)` : ''}`
              : `View and manage coaches at the club${allCoaches.filter(c => c.isArchived).length > 0 ? ` (${allCoaches.filter(c => c.isArchived).length} archived)` : ''}`
          }
          action={{
            label: 'Add New Coach',
            icon: 'plus',
            title: 'Add New Coach',
            onClick: () => navigate(Routes.coachSettings(clubId!, 'new')),
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
                className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show archived coaches ({allCoaches.filter(c => c.isArchived).length})
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Name</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Group</label>
              <select 
                value={filterAgeGroup}
                onChange={(e) => {
                  setFilterAgeGroup(e.target.value);
                  setFilterTeam(''); // Clear team filter when age group changes
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                <option value="">All Teams</option>
                {filteredTeams.map(team => {
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                <option value="">All Roles</option>
                {allRoles.map(role => (
                  <option key={role} value={role}>{coachRoleDisplay[role] || role}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active filters display and clear */}
          {(searchName || filterRole || filterAgeGroup || filterTeam) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {searchName && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded text-sm">
                  Name: {searchName}
                  <button onClick={() => setSearchName('')} className="hover:text-secondary-900 dark:hover:text-secondary-100">×</button>
                </span>
              )}
              {filterRole && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded text-sm">
                  Role: {coachRoleDisplay[filterRole] || filterRole}
                  <button onClick={() => setFilterRole('')} className="hover:text-secondary-900 dark:hover:text-secondary-100">×</button>
                </span>
              )}
              {filterAgeGroup && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded text-sm">
                  Age Group: {allAgeGroups.find(ag => ag.id === filterAgeGroup)?.name}
                  <button onClick={() => setFilterAgeGroup('')} className="hover:text-secondary-900 dark:hover:text-secondary-100">×</button>
                </span>
              )}
              {filterTeam && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded text-sm">
                  Team: {teams.find(t => t.id === filterTeam)?.name}
                  <button onClick={() => setFilterTeam('')} className="hover:text-secondary-900 dark:hover:text-secondary-100">×</button>
                </span>
              )}
              <button 
                onClick={() => {
                  setSearchName('');
                  setFilterRole('');
                  setFilterAgeGroup('');
                  setFilterTeam('');
                }}
                className="ml-auto text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear all
              </button>
            </div>
          )}
              </div>
            </>
          )}
        </div>

        {/* Coaches grouped by role */}
        {sortedRoles.map((role) => (
          <div key={role} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {role} ({coachesByRole[role].length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0">
              {coachesByRole[role].map((coach) => (
                <Link key={coach.id} to={Routes.coach(clubId!, coach.id)}>
                  <CoachCard 
                    coach={coach} 
                    badges={
                      <>
                        {coach.isArchived && (
                          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs px-2 py-1 rounded-full font-medium">
                            🗄️ Archived
                          </span>
                        )}
                        {coach.teamIds.length > 1 && (
                          <span className="bg-secondary-600 text-white text-xs px-2 py-1 rounded-full">
                            {coach.teamIds.length} teams
                          </span>
                        )}
                      </>
                    }
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filteredCoaches.length === 0 && allCoaches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first coach to the club</p>
            <button className="btn-success btn-md flex items-center gap-2" title="Add First Coach">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {filteredCoaches.length === 0 && allCoaches.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters to see more results</p>
            <button 
              onClick={() => {
                setSearchName('');
                setFilterRole('');
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
