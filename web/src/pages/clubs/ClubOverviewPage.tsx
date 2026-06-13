import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRequiredParams } from '@utils/routeParams';
import { Plus, Users } from 'lucide-react';
import { apiClient } from '@/api';
import type {
  ClubDetailDto,
  AgeGroupListDto
} from '@/api';
import type { SquadSize } from '@/types';
import { useClubMatches } from '@/api/hooks';
import AgeGroupListCard from '@components/ageGroup/AgeGroupListCard';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';
import { Routes } from '@utils/routes';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ClubOverviewPage() {
  // Validate route parameters
  const params = useRequiredParams(['clubId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const navigate = useNavigate();
  
  const [club, setClub] = useState<ClubDetailDto | null>(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [clubError, setClubError] = useState<string | null>(null);

  const [ageGroups, setAgeGroups] = useState<AgeGroupListDto[]>([]);
  const [ageGroupsLoading, setAgeGroupsLoading] = useState(true);
  const [ageGroupsError, setAgeGroupsError] = useState<string | null>(null);

  const { data: matchesData } = useClubMatches(clubId ?? undefined, { status: 'all' });
  const liveMatches = matchesData?.matches.filter(m => m.status === 'in-progress') ?? [];

  usePageTitle([club?.name ?? 'Club', 'Overview'], !!club);

  useEffect(() => {
    if (!clubId) return;

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

    setAgeGroupsLoading(true);
    apiClient.clubs.getAgeGroups(clubId, false)
      .then((response) => {
        if (response.success && response.data) {
          const sortedAgeGroups = response.data
            .filter(ag => !ag.isArchived)
            .sort((a, b) => a.name.localeCompare(b.name));
          setAgeGroups(sortedAgeGroups);
          setAgeGroupsError(null);
        } else {
          setAgeGroupsError(response.error?.message || 'Failed to load age groups');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch age groups:', err);
        setAgeGroupsError('Failed to load age groups from API');
      })
      .finally(() => setAgeGroupsLoading(false));
  }, [clubId]);

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

  if (clubLoading || ageGroupsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (clubError || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">{clubError || 'Club not found'}</div>
      </div>
    );
  }

  const normalizeLevel = (level: string): 'youth' | 'amateur' | 'reserve' | 'senior' => {
    const normalized = level.toLowerCase();
    if (normalized === 'youth' || normalized === 'amateur' || normalized === 'reserve' || normalized === 'senior') {
      return normalized;
    }
    return 'youth';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={club.name}
          subtitle="Club Overview"
          action={{
            label: 'Settings',
            icon: 'settings',
            title: 'Settings',
            onClick: () => navigate(Routes.clubSettings(clubId)),
            variant: 'primary'
          }}
        />

        {/* Live Now Section */}
        {liveMatches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Live Now</h3>
            <div className="space-y-2">
              {liveMatches.map(match => {
                const homeTeam = match.isHome ? match.teamName : match.opposition;
                const awayTeam = match.isHome ? match.opposition : match.teamName;
                const hasScore = match.homeScore != null && match.awayScore != null;
                return (
                  <Link
                    key={match.id}
                    to={Routes.matchReport(clubId!, match.ageGroupId, match.teamId, match.id)}
                    className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 text-center">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                        </span>
                        <div className="text-[9px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mt-0.5">Live</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{homeTeam}</span>
                          {hasScore ? (
                            <span className="font-bold text-gray-900 dark:text-white text-sm flex-shrink-0">{match.homeScore} – {match.awayScore}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-sm flex-shrink-0">vs</span>
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{awayTeam}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{match.teamName} · {match.competition}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Age Groups Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Age Groups</h3>
            <Link
              to={Routes.ageGroupNew(clubId)}
              className="btn-sm btn-success btn-icon"
              title="Add age group"
              aria-label="Add age group"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
          
          {ageGroupsError ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-red-600 dark:text-red-400">{ageGroupsError}</p>
            </div>
          ) : ageGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
              {ageGroups.map(ageGroup => (
                <Link
                  key={ageGroup.id}
                  to={Routes.ageGroup(clubId, ageGroup.id)}
                  className="block md:border-b last:border-b-0 border-gray-200 dark:border-gray-700"
                >
                  <AgeGroupListCard
                    ageGroup={{
                      id: ageGroup.id,
                      clubId: ageGroup.clubId,
                      name: ageGroup.name,
                      code: ageGroup.code,
                      level: normalizeLevel(ageGroup.level),
                      season: ageGroup.season,
                      seasons: ageGroup.seasons,
                      defaultSeason: ageGroup.defaultSeason,
                      defaultSquadSize: [4, 5, 7, 9, 11].includes(ageGroup.defaultSquadSize)
                        ? (ageGroup.defaultSquadSize as SquadSize)
                        : undefined,
                      description: ageGroup.description,
                      coordinatorIds: [],
                      isArchived: ageGroup.isArchived
                    }}
                    club={{
                      id: club.id,
                      name: club.name,
                      shortName: club.shortName,
                      logo: club.logo ?? '',
                      colors: {
                        primary: club.colors.primary,
                        secondary: club.colors.secondary,
                        accent: club.colors.accent
                      },
                      location: club.location,
                      founded: club.founded ?? 0,
                      history: club.history,
                      ethos: club.ethos,
                      principles: club.principles,
                      kits: []
                    }}
                    stats={{
                      teamCount: ageGroup.teamCount,
                      playerCount: ageGroup.playerCount ?? 0
                    }}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No age groups yet"
              description="No age groups yet in this club"
              action={
                <Link
                  to={Routes.ageGroupNew(clubId)}
                  className="inline-flex px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create First Age Group
                </Link>
              }
            />
          )}
        </div>

      </main>
    </div>
  );
}
