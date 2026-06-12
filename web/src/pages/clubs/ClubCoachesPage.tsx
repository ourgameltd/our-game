import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronUp, Filter, UserCog, Search } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { apiClient } from '@/api';
import type { ClubCoachDto, ClubTeamDto, PagedResponse } from '@/api';
import { Routes } from '@utils/routes';
import { useRequiredParams } from '@utils/routeParams';
import CoachCard from '@components/coach/CoachCard';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';
import PaginationBar from '@components/common/PaginationBar';
import type { Coach } from '@/types';
import { usePageTitle } from '@/hooks/usePageTitle';
import { parseDateOfBirth } from '@/utils/dateOfBirth';

const PAGE_SIZE = 50;

function CoachCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-3 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-1 self-stretch rounded-full bg-gray-200 dark:bg-gray-700 min-h-[3.5rem]" />
        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function mapApiCoachToCoach(apiCoach: ClubCoachDto): Coach {
  return {
    id: apiCoach.id,
    clubId: apiCoach.clubId,
    firstName: apiCoach.firstName,
    lastName: apiCoach.lastName,
    dateOfBirth: parseDateOfBirth(apiCoach.dateOfBirth),
    photo: apiCoach.photo,
    email: apiCoach.email || '',
    phone: apiCoach.phone || '',
    associationId: apiCoach.associationId,
    hasAccount: apiCoach.hasAccount,
    clubRoles: apiCoach.clubRoles,
    badges: apiCoach.badges,
    biography: apiCoach.biography,
    specializations: apiCoach.specializations,
    teamIds: apiCoach.teams.map(t => t.id),
    isArchived: apiCoach.isArchived
  };
}

export default function ClubCoachesPage() {
  usePageTitle(['Club Coaches']);

  const params = useRequiredParams(['clubId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const navigate = useNavigate();

  const [pagedResult, setPagedResult] = useState<PagedResponse<ClubCoachDto> | null>(null);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesError, setCoachesError] = useState<string | null>(null);

  const [teams, setTeams] = useState<ClubTeamDto[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchName), 300);
    return () => clearTimeout(t);
  }, [searchName]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterRole, filterAgeGroup, filterTeam, showArchived]);

  useEffect(() => {
    if (!clubId) return;

    setCoachesLoading(true);
    setCoachesError(null);

    apiClient.clubs.getCoaches(clubId, {
      page: currentPage,
      pageSize: PAGE_SIZE,
      includeArchived: showArchived,
      search: debouncedSearch || undefined,
      ageGroupId: filterAgeGroup || undefined,
      teamId: filterTeam || undefined,
      role: filterRole || undefined,
    })
      .then((response) => {
        if (response.success && response.data) {
          setPagedResult(response.data);
        } else {
          setCoachesError(response.error?.message || 'Failed to load coaches');
        }
      })
      .catch(() => setCoachesError('Failed to load coaches from API'))
      .finally(() => setCoachesLoading(false));
  }, [clubId, currentPage, debouncedSearch, filterRole, filterAgeGroup, filterTeam, showArchived]);

  useEffect(() => {
    if (!clubId) return;

    setTeamsLoading(true);
    apiClient.clubs.getTeams(clubId, true)
      .then((response) => {
        if (response.success && response.data) setTeams(response.data);
      })
      .catch((err) => console.error('Failed to fetch teams:', err))
      .finally(() => setTeamsLoading(false));
  }, [clubId]);

  const coaches = useMemo(
    () => (pagedResult?.items ?? []).map(mapApiCoachToCoach),
    [pagedResult]
  );

  const allAgeGroups = useMemo(() => {
    const ageGroupMap = new Map<string, string>();
    teams.forEach(team => {
      if (team.ageGroupName && team.ageGroupId && !ageGroupMap.has(team.ageGroupId)) {
        ageGroupMap.set(team.ageGroupId, team.ageGroupName);
      }
    });
    return Array.from(ageGroupMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teams]);

  const filteredTeams = useMemo(() => {
    if (!filterAgeGroup) return teams;
    return teams.filter(team => team.ageGroupId === filterAgeGroup);
  }, [teams, filterAgeGroup]);

  const totalPages = pagedResult?.totalPages ?? 1;
  const totalCount = pagedResult?.totalCount ?? 0;
  const activeFilterCount = [filterRole, filterAgeGroup, filterTeam, showArchived].filter(Boolean).length;

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
        {coachesLoading && !pagedResult ? (
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
            badge={totalCount}
            subtitle={`View and manage coaches at the club`}
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter coaches by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1 py-0.5 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
            {searchName && (
              <button
                onClick={() => setSearchName('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear search"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            )}
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                {activeFilterCount} active
              </span>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="More filters"
            >
              {showFilters ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {showFilters && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Age Group</label>
                    <select
                      value={filterAgeGroup}
                      onChange={(e) => {
                        setFilterAgeGroup(e.target.value);
                        setFilterTeam('');
                      }}
                      className="input"
                    >
                      <option value="">All Age Groups</option>
                      {allAgeGroups.map(ageGroup => (
                        <option key={ageGroup.id} value={ageGroup.id}>{ageGroup.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Team</label>
                    <select
                      value={filterTeam}
                      onChange={(e) => setFilterTeam(e.target.value)}
                      className="input"
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
                    <label className="label">Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Head Coach"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show archived coaches
                    </span>
                  </label>
                </div>

                {(filterRole || filterAgeGroup || filterTeam) && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                    {filterRole && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded text-sm">
                        Role: {filterRole}
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

        {/* Loading skeleton */}
        {coachesLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <CoachCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Coaches Grid */}
        {!coachesLoading && coaches.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coaches.map((coach) => (
                <Link key={coach.id} to={Routes.coach(clubId, coach.id)}>
                  <CoachCard
                    coach={coach}
                    forceCard
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
          </>
        )}

        {/* Pagination */}
        {!coachesLoading && totalPages > 1 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {!coachesLoading && coaches.length === 0 && totalCount === 0 && !debouncedSearch && !filterRole && !filterAgeGroup && !filterTeam && (
          <EmptyState
            icon={UserCog}
            title="No coaches yet"
            description="Get started by adding your first coach to the club"
            action={
              <button
                onClick={() => navigate(Routes.coachSettings(clubId, 'new'))}
                className="btn-success btn-md flex items-center gap-2"
                title="Add First Coach"
              >
                <Plus className="w-5 h-5" />
                Add First Coach
              </button>
            }
          />
        )}

        {!coachesLoading && coaches.length === 0 && (debouncedSearch || filterRole || filterAgeGroup || filterTeam || showArchived) && (
          <EmptyState
            icon={Search}
            title="No coaches found"
            description="Try adjusting your filters to see more results"
            action={
              <button
                onClick={() => {
                  setSearchName('');
                  setFilterRole('');
                  setFilterAgeGroup('');
                  setFilterTeam('');
                  setShowArchived(false);
                }}
                className="btn-secondary btn-md"
              >
                Clear Filters
              </button>
            }
          />
        )}
      </main>
    </div>
  );
}
