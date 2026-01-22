import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiClient } from '@/api';
import type { 
  ClubDetailDto, 
  ClubStatisticsDto, 
  AgeGroupListDto, 
  AgeGroupStatisticsDto 
} from '@/api';
import type { SquadSize } from '@/types';
import StatsGrid from '@components/stats/StatsGrid';
import MatchesCard from '@components/matches/MatchesCard';
import AgeGroupListCard from '@components/ageGroup/AgeGroupListCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function ClubOverviewPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  
  const [club, setClub] = useState<ClubDetailDto | null>(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [clubError, setClubError] = useState<string | null>(null);

  const [stats, setStats] = useState<ClubStatisticsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [ageGroups, setAgeGroups] = useState<AgeGroupListDto[]>([]);
  const [ageGroupsLoading, setAgeGroupsLoading] = useState(true);
  const [ageGroupsError, setAgeGroupsError] = useState<string | null>(null);

  const [ageGroupStats, setAgeGroupStats] = useState<Map<string, AgeGroupStatisticsDto>>(new Map());

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

    setStatsLoading(true);
    apiClient.clubs.getClubStatistics(clubId)
      .then((response) => {
        if (response.success && response.data) {
          setStats(response.data);
          setStatsError(null);
        } else {
          setStatsError(response.error?.message || 'Failed to load statistics');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch statistics:', err);
        setStatsError('Failed to load statistics from API');
      })
      .finally(() => setStatsLoading(false));

    setAgeGroupsLoading(true);
    apiClient.clubs.getAgeGroups(clubId, false)
      .then((response) => {
        if (response.success && response.data) {
          const sortedAgeGroups = response.data
            .filter(ag => !ag.isArchived)
            .sort((a, b) => a.name.localeCompare(b.name));
          setAgeGroups(sortedAgeGroups);
          setAgeGroupStats(new Map());
          setAgeGroupsError(null);

          sortedAgeGroups.forEach(ag => {
            apiClient.ageGroups.getStatistics(ag.id)
              .then((statsResponse) => {
                if (statsResponse.success && statsResponse.data) {
                  setAgeGroupStats(prev => new Map(prev).set(ag.id, statsResponse.data!));
                }
              })
              .catch((err) => {
                console.error(`Failed to fetch stats for age group ${ag.id}:`, err);
              });
          });
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

  if (clubLoading || statsLoading || ageGroupsLoading) {
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
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

          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
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

  const toDate = (value?: string) => (value ? new Date(value) : undefined);

  const upcomingMatches = stats?.upcomingMatches.map(m => ({
    id: m.id,
    teamId: m.teamId,
    opposition: m.opposition,
    date: new Date(m.date),
    meetTime: toDate(m.meetTime),
    kickOffTime: toDate(m.kickOffTime) ?? new Date(m.date),
    location: m.location || '',
    isHome: m.isHome,
    competition: m.competition || '',
    status: 'scheduled' as const,
    score: undefined
  })) ?? [];

  const previousResults = stats?.previousResults.map(m => ({
    id: m.id,
    teamId: m.teamId,
    opposition: m.opposition,
    date: new Date(m.date),
    meetTime: toDate(m.meetTime),
    kickOffTime: toDate(m.kickOffTime) ?? new Date(m.date),
    location: m.location || '',
    isHome: m.isHome,
    competition: m.competition || '',
    status: 'completed' as const,
    score: m.score ? {
      home: m.score.home,
      away: m.score.away
    } : undefined
  })) ?? [];

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
            onClick: () => navigate(Routes.clubSettings(clubId!)),
            variant: 'primary'
          }}
        />

        {/* Stats Overview */}
        {statsError ? (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {statsError}
          </div>
        ) : stats && (
          <StatsGrid 
            stats={{
              playerCount: stats.playerCount,
              matchesPlayed: stats.matchesPlayed,
              wins: stats.wins,
              draws: stats.draws,
              losses: stats.losses,
              winRate: stats.winRate,
              goalDifference: stats.goalDifference
            }}
            onPlayerCountClick={() => navigate(Routes.clubPlayers(clubId!))}
            additionalInfo={`${ageGroups.length} age groups`}
          />
        )}

        {/* Age Groups Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Age Groups</h3>
            <Link
              to={Routes.ageGroupNew(clubId!)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
          
          {ageGroupsError ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-red-600 dark:text-red-400">{ageGroupsError}</p>
            </div>
          ) : ageGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
              {ageGroups.map(ageGroup => {
                const agStats = ageGroupStats.get(ageGroup.id);
                
                return (
                  <Link
                    key={ageGroup.id}
                    to={Routes.ageGroup(clubId!, ageGroup.id)}
                    className="block"
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
                        playerCount: agStats?.playerCount ?? 0,
                        matchesPlayed: agStats?.matchesPlayed ?? 0,
                        wins: agStats?.wins ?? 0,
                        draws: agStats?.draws ?? 0,
                        losses: agStats?.losses ?? 0,
                        winRate: agStats?.winRate ?? 0,
                        goalDifference: agStats?.goalDifference ?? 0
                      }}
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No age groups yet in this club</p>
              <Link
                to={Routes.ageGroupNew(clubId!)}
                className="inline-flex px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create First Age Group
              </Link>
            </div>
          )}
        </div>

        {stats && (
          <div className="grid md:grid-cols-2 gap-4">
            <MatchesCard 
              type="upcoming"
              matches={upcomingMatches}
              limit={3}
              viewAllLink={Routes.clubMatches(clubId!)}
              showTeamInfo={true}
              getTeamInfo={(match) => ({
                teamName: stats.upcomingMatches.find(m => m.id === match.id)?.teamName || 'Unknown',
                ageGroupName: stats.upcomingMatches.find(m => m.id === match.id)?.ageGroupName || 'Unknown'
              })}
              getMatchLink={(matchId) => {
                const matchData = stats.upcomingMatches.find(m => m.id === matchId);
                if (matchData) {
                  return Routes.matchReport(clubId!, matchData.ageGroupId, matchData.teamId, matchId);
                }
                return '#';
              }}
            />
            <MatchesCard 
              type="results"
              matches={previousResults}
              limit={3}
              viewAllLink={Routes.clubMatches(clubId!)}
              showTeamInfo={true}
              getTeamInfo={(match) => ({
                teamName: stats.previousResults.find(m => m.id === match.id)?.teamName || 'Unknown',
                ageGroupName: stats.previousResults.find(m => m.id === match.id)?.ageGroupName || 'Unknown'
              })}
              getMatchLink={(matchId) => {
                const matchData = stats.previousResults.find(m => m.id === matchId);
                if (matchData) {
                  return Routes.matchReport(clubId!, matchData.ageGroupId, matchData.teamId, matchId);
                }
                return '#';
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
