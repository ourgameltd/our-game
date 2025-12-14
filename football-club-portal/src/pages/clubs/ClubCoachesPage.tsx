import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { getClubById } from '@data/clubs';
import { getCoachesByClub } from '@data/coaches';
import { getTeamsByClubId } from '@data/teams';
import { getAgeGroupById } from '@data/ageGroups';
import { Routes } from '@utils/routes';
import CoachCard from '@components/coach/CoachCard';
import PageNavigation from '@components/navigation/PageNavigation';
import PageTitle from '@components/common/PageTitle';
import { getClubNavigationTabs } from '@utils/navigationHelpers';

export default function ClubCoachesPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const club = getClubById(clubId!);
  const allCoaches = getCoachesByClub(clubId!);
  const teams = getTeamsByClubId(clubId!);

  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [showArchived, setShowArchived] = useState(false);

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

  const roleDisplay: Record<string, string> = {
    'head-coach': 'Head Coach',
    'assistant-coach': 'Assistant Coach',
    'goalkeeper-coach': 'Goalkeeper Coach',
    'fitness-coach': 'Fitness Coach',
    'technical-coach': 'Technical Coach',
  };

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
      const role = roleDisplay[coach.role] || coach.role;
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(coach);
      return acc;
    }, {} as Record<string, typeof filteredCoaches>);
  }, [filteredCoaches]);

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
      {/* Navigation Tabs */}
      <PageNavigation tabs={getClubNavigationTabs(clubId!)} />

      <main className="container mx-auto px-4 py-8">
        <PageTitle
          title="All Club Coaches"
          badge={allCoaches.filter(c => !c.isArchived).length}
          subtitle={
            filteredCoaches.length !== allCoaches.length 
              ? `Showing ${filteredCoaches.length} of ${allCoaches.length} coaches${allCoaches.filter(c => c.isArchived).length > 0 ? ` (${allCoaches.filter(c => c.isArchived).length} archived)` : ''}`
              : `View and manage coaches at the club${allCoaches.filter(c => c.isArchived).length > 0 ? ` (${allCoaches.filter(c => c.isArchived).length} archived)` : ''}`
          }
          action={{
            label: '+ Add New Coach',
            onClick: () => navigate(Routes.coachSettings(clubId!, 'new')),
            variant: 'success'
          }}
        />

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          {/* Show Archived Toggle */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
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
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                <option value="">All Roles</option>
                {allRoles.map(role => (
                  <option key={role} value={role}>{roleDisplay[role] || role}</option>
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
          </div>
          
          {/* Active filters display and clear */}
          {(searchName || filterRole || filterTeam) && (
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
                  Role: {roleDisplay[filterRole] || filterRole}
                  <button onClick={() => setFilterRole('')} className="hover:text-secondary-900 dark:hover:text-secondary-100">×</button>
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
                  setFilterTeam('');
                }}
                className="ml-auto text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Coaches grouped by role */}
        {sortedRoles.map((role) => (
          <div key={role} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {role} ({coachesByRole[role].length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coachesByRole[role].map((coach) => (
                <div key={coach.id} className="relative">
                  <Link to={Routes.coachSettings(clubId!, coach.id)}>
                    <CoachCard coach={coach} />
                  </Link>
                  {coach.isArchived && (
                    <div className="absolute top-2 left-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs px-2 py-1 rounded-full font-medium">
                      🗄️ Archived
                    </div>
                  )}
                  {coach.teamIds.length > 1 && (
                    <div className="absolute top-2 right-2 bg-secondary-600 text-white text-xs px-2 py-1 rounded-full">
                      {coach.teamIds.length} teams
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredCoaches.length === 0 && allCoaches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👨‍🏫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coaches yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first coach to the club</p>
            <button className="btn-success btn-md">
              + Add First Coach
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
