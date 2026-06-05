import { Link, useNavigate } from 'react-router-dom';
import { useRequiredParams } from '@utils/routeParams';
import { Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, Users, Search } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { apiClient } from '@/api';
import type { ClubPlayerDto, ClubTeamDto, ClubDetailDto, PagedResponse } from '@/api';
import type { CompetencyBand } from '@/api/competencies';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';
import type { Player, PlayerPosition, PlayerAttributes } from '@/types';
import { usePageTitle } from '@/hooks/usePageTitle';
import PlayerCard from '@components/player/PlayerCard';

const PAGE_SIZE = 20;

const ALL_POSITIONS: PlayerPosition[] = [
  'GK', 'LB', 'CB', 'RB', 'LWB', 'RWB',
  'CDM', 'CM', 'CAM', 'LM', 'RM',
  'LW', 'RW', 'CF', 'ST',
];

function getPaginationPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function PaginationBar({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = getPaginationPages(currentPage, totalPages);
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-400 dark:text-gray-500 text-sm select-none">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary-600 dark:bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function PlayerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-3 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-1 self-stretch rounded-full bg-gray-200 dark:bg-gray-700 min-h-[2.5rem]" />
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="flex gap-1">
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
    dateOfBirth: apiPlayer.dateOfBirth ? new Date(apiPlayer.dateOfBirth) : undefined,
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

export default function ClubPlayersPage() {
  usePageTitle(['Club Players']);

  const params = useRequiredParams(['clubId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const navigate = useNavigate();

  // Server-fetched paged result
  const [pagedResult, setPagedResult] = useState<PagedResponse<ClubPlayerDto> | null>(null);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState<string | null>(null);

  const [teams, setTeams] = useState<ClubTeamDto[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [_club, setClub] = useState<ClubDetailDto | null>(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [clubError, setClubError] = useState<string | null>(null);

  // Filter state
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterBanding, setFilterBanding] = useState<CompetencyBand | ''>('');
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce name search by 300 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchName), 300);
    return () => clearTimeout(t);
  }, [searchName]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterAgeGroup, filterPosition, filterTeam, filterBanding, showArchived]);

  // Fetch players from server with current page + filters
  useEffect(() => {
    if (!clubId) return;

    setPlayersLoading(true);
    setPlayersError(null);

    apiClient.clubs.getPlayers(clubId, {
      page: currentPage,
      pageSize: PAGE_SIZE,
      includeArchived: showArchived,
      search: debouncedSearch || undefined,
      ageGroupId: filterAgeGroup || undefined,
      teamId: filterTeam || undefined,
      position: filterPosition || undefined,
      band: filterBanding || undefined,
    })
      .then((response) => {
        if (response.success && response.data) {
          setPagedResult(response.data);
        } else {
          setPlayersError(response.error?.message || 'Failed to load players');
        }
      })
      .catch(() => setPlayersError('Failed to load players from API'))
      .finally(() => setPlayersLoading(false));
  }, [clubId, currentPage, debouncedSearch, filterAgeGroup, filterPosition, filterTeam, filterBanding, showArchived]);

  // Fetch teams (for filter dropdown) and club (for page title)
  useEffect(() => {
    if (!clubId) return;

    setTeamsLoading(true);
    apiClient.clubs.getTeams(clubId, true)
      .then((response) => {
        if (response.success && response.data) setTeams(response.data);
      })
      .catch((err) => console.error('Failed to fetch teams:', err))
      .finally(() => setTeamsLoading(false));

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

  // Age groups derived from teams (no extra API call)
  const ageGroupsFromTeams = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach(t => {
      if (t.ageGroupId && !map.has(t.ageGroupId)) {
        map.set(t.ageGroupId, t.ageGroupName ?? t.ageGroupId);
      }
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teams]);

  const playerBands = useMemo<Record<string, CompetencyBand | null>>(() => {
    const items: ClubPlayerDto[] = pagedResult?.items ?? [];
    return Object.fromEntries(items.map((p) => [p.id, p.overallBand ?? null]));
  }, [pagedResult]);

  const players = useMemo<Player[]>(
    () => (pagedResult?.items ?? ([] as ClubPlayerDto[])).map(mapApiPlayerToPlayer),
    [pagedResult]
  );

  const totalPages = pagedResult?.totalPages ?? 0;
  const totalCount = pagedResult?.totalCount ?? 0;
  const pageStart = totalCount > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, totalCount);
  const hasActiveFilters = !!(filterAgeGroup || filterPosition || filterTeam || filterBanding || debouncedSearch);

  if (!clubId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invalid Page Parameters</h3>
            <p className="text-gray-600 dark:text-gray-400">Club ID is required to view this page.</p>
          </div>
        </main>
      </div>
    );
  }

  const pageSubtitle = (() => {
    if (!pagedResult) return 'Loading players…';
    if (totalCount === 0) return hasActiveFilters ? 'No players match the current filters' : 'No players registered to this club';
    if (totalPages > 1) return `Showing ${pageStart}–${pageEnd} of ${totalCount} players`;
    if (hasActiveFilters) return `Showing ${totalCount} filtered player${totalCount !== 1 ? 's' : ''}`;
    return `View and manage players registered to the club`;
  })();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {(clubLoading) ? (
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
            badge={totalCount}
            subtitle={pageSubtitle}
            action={{
              label: 'Add New Player',
              icon: 'plus',
              title: 'Add New Player',
              onClick: () => navigate(Routes.clubPlayerSettings(clubId, 'new')),
              variant: 'success'
            }}
          />
        )}

        {playersError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load players</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{playersError}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search players by name..."
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
            {(hasActiveFilters || showArchived) && (
              <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                {[filterAgeGroup ? 1 : 0, filterPosition ? 1 : 0, filterTeam ? 1 : 0, filterBanding ? 1 : 0, showArchived ? 1 : 0, debouncedSearch ? 1 : 0].reduce((a, b) => a + b, 0)} active
              </span>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="More filters"
            >
              {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {showFilters && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Age Group</label>
                    <select
                      value={filterAgeGroup}
                      onChange={(e) => setFilterAgeGroup(e.target.value)}
                      className="input"
                      disabled={teamsLoading}
                    >
                      <option value="">All Age Groups</option>
                      {ageGroupsFromTeams.map(ag => (
                        <option key={ag.id} value={ag.id}>{ag.name}</option>
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
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.ageGroupName} - {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Position</label>
                    <select
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                      className="input"
                    >
                      <option value="">All Positions</option>
                      {ALL_POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Banding</label>
                    <select
                      value={filterBanding}
                      onChange={(e) => setFilterBanding(e.target.value as CompetencyBand | '')}
                      className="input"
                    >
                      <option value="">All Bands</option>
                      <option value="Development">Development</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Elite">Elite</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show archived players
                    </span>
                  </label>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-wrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Name: "{debouncedSearch}"
                      <button onClick={() => setSearchName('')} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                    </span>
                  )}
                  {filterAgeGroup && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Age: {ageGroupsFromTeams.find(ag => ag.id === filterAgeGroup)?.name || filterAgeGroup}
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
                  {filterBanding && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Band: {filterBanding}
                      <button onClick={() => setFilterBanding('')} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchName('');
                      setFilterAgeGroup('');
                      setFilterPosition('');
                      setFilterTeam('');
                      setFilterBanding('');
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

        {/* Players Grid — Loading */}
        {playersLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <PlayerCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Players Grid */}
        {!playersLoading && players.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {players.map((player) => (
                <Link key={player.id} to={Routes.clubPlayer(clubId, player.id)}>
                  <PlayerCard
                    player={player}
                    detailDisplay="banding"
                    competencyBand={playerBands[player.id] ?? null}
                    forceCard
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

            {totalPages > 1 && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {!playersLoading && totalCount === 0 && !hasActiveFilters && !showArchived && (
          <EmptyState
            icon={Users}
            title="No players yet"
            description="Get started by adding your first player to the club"
            action={
              <button
                className="btn-success btn-md flex items-center gap-2"
                onClick={() => navigate(Routes.clubPlayerSettings(clubId, 'new'))}
              >
                <Plus className="w-5 h-5" />
                Add First Player
              </button>
            }
          />
        )}

        {!playersLoading && totalCount === 0 && (hasActiveFilters || showArchived) && (
          <EmptyState
            icon={Search}
            title="No players found"
            description="Try adjusting your filters to see more results"
            action={
              <button
                onClick={() => {
                  setSearchName('');
                  setFilterAgeGroup('');
                  setFilterPosition('');
                  setFilterTeam('');
                  setFilterBanding('');
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
