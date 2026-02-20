import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { apiClient } from '@/api';
import type { ClubCoachDto, ClubTeamDto } from '@/api';
import { coachRoleDisplay } from '@/constants/coachRoleDisplay';
import { Routes } from '@utils/routes';
import { useRequiredParams } from '@utils/routeParams';
import CoachCard from '@components/coach/CoachCard';
import PageTitle from '@components/common/PageTitle';
import type { Coach } from '@/types';

// Skeleton component for coach card loading state
function CoachCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 md:rounded-none md:shadow-none md:p-0 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b flex flex-col md:flex-row md:items-center md:gap-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3 md:mb-0 md:flex-shrink-0 md:order-1">
        <div className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 min-w-0 md:hidden">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="hidden md:flex md:items-baseline md:gap-2 md:min-w-48 md:flex-shrink-0 md:order-2">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="hidden md:block md:w-24 md:flex-shrink-0 md:order-3">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="mb-3 md:mb-0 md:w-32 md:flex-shrink-0 md:order-4">
        <div className="flex flex-wrap gap-1">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="md:flex-1 md:order-5">
        <div className="hidden md:flex md:gap-4 md:justify-end">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

// Helper to map API DTO to Coach type for CoachCard compatibility
function mapApiCoachToCoach(apiCoach: ClubCoachDto): Coach {
  return {
    id: apiCoach.id,
    clubId: apiCoach.clubId,
    firstName: apiCoach.firstName,
    lastName: apiCoach.lastName,
    dateOfBirth: apiCoach.dateOfBirth ? new Date(apiCoach.dateOfBirth) : new Date(),
    photo: apiCoach.photo,
    email: apiCoach.email || '',
    phone: apiCoach.phone || '',
    associationId: apiCoach.associationId,
    hasAccount: apiCoach.hasAccount,
    role: apiCoach.role as Coach['role'],
    biography: apiCoach.biography,
    specializations: apiCoach.specializations,
    teamIds: apiCoach.teams.map(t => t.id),
    isArchived: apiCoach.isArchived
  };
}

export default function ClubCoachesPage() {
  // Validate route parameters
  const params = useRequiredParams(['clubId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const navigate = useNavigate();

  // API state
  const [apiCoaches, setApiCoaches] = useState<ClubCoachDto[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesError, setCoachesError] = useState<string | null>(null);

  const [teams, setTeams] = useState<ClubTeamDto[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // Filter state
  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from API
  useEffect(() => {
    if (!clubId) return;

    // Fetch coaches (always include archived, filter client-side)
    setCoachesLoading(true);
    apiClient.clubs.getCoaches(clubId, true)
      .then((response) => {
        if (response.success && response.data) {
          setApiCoaches(response.data);
          setCoachesError(null);
        } else {
          setCoachesError(response.error?.message || 'Failed to load coaches');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch coaches:', err);
        setCoachesError('Failed to load coaches from API');
      })
      .finally(() => setCoachesLoading(false));

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
  }, [clubId]);

  // Map API coaches to Coach type for compatibility with existing components
  const allCoaches = useMemo(() => {
    return apiCoaches.map(mapApiCoachToCoach);
  }, [apiCoaches]);

  // Get unique roles from all coaches
  const allRoles = useMemo(() => {
    const roles = new Set<string>();
    allCoaches.forEach(coach => {
      roles.add(coach.role);
    });
    return Array.from(roles).sort();
  }, [allCoaches]);

  // Get unique age groups from coaches' team assignments (using API data directly)
  const allAgeGroups = useMemo(() => {
    const ageGroupMap = new Map<string, string>();
    apiCoaches.forEach(coach => {
      coach.teams.forEach(team => {
        if (team.ageGroupName && !ageGroupMap.has(team.ageGroupId)) {
          ageGroupMap.set(team.ageGroupId, team.ageGroupName);
        }
      });
    });
    return Array.from(ageGroupMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [apiCoaches]);

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
  }, [allCoaches, searchName, filterRole, filterAgeGroup, filterTeam, showArchived, teams]);

  // Filter teams by age group for the team dropdown
  const filteredTeams = useMemo(() => {
    if (!filterAgeGroup) return teams;
    return teams.filter(team => team.ageGroupId === filterAgeGroup);
  }, [teams, filterAgeGroup]);

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
        {coachesLoading ? (
          <div className="animate-pulse mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : coachesError ? (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load coaches</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{coachesError}</p>
          </div>
        ) : (
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
              onClick: () => navigate(Routes.coachSettings(clubId, 'new')),
              variant: 'success'
            }}
          />
        )}

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          {/* Show Archived Toggle */}
          {coachesLoading ? (
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
          )}
          
          {showFilters && !coachesLoading && (
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
                disabled={teamsLoading}
              >
                <option value="">All Teams</option>
                {filteredTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.ageGroupName} - {team.name}
                    </option>
                ))}
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

        {/* Loading skeleton for coaches list */}
        {coachesLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <CoachCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Coaches List */}
        {!coachesLoading && filteredCoaches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {filteredCoaches.map((coach) => (
              <Link key={coach.id} to={Routes.coach(clubId, coach.id)}>
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
        )}

        {!coachesLoading && filteredCoaches.length === 0 && allCoaches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first coach to the club</p>
            <button 
              onClick={() => navigate(Routes.coachSettings(clubId, 'new'))}
              className="btn-success btn-md flex items-center gap-2 mx-auto" 
              title="Add First Coach"
            >
              <Plus className="w-5 h-5" />
              Add First Coach
            </button>
          </div>
        )}

        {!coachesLoading && filteredCoaches.length === 0 && allCoaches.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters to see more results</p>
            <button 
              onClick={() => {
                setSearchName('');
                setFilterRole('');
                setFilterAgeGroup('');
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
