import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { apiClient } from '@/api';
import type {
  AgeGroupDetailDto,
  AgeGroupStatisticsDto,
  TeamWithStatsDto,
  ClubDetailDto
} from '@/api';
import type { AgeGroup, Club, Team, SquadSize, Match } from '@/types';
import StatsGrid from '../../components/stats/StatsGrid';
import MatchesCard from '../../components/matches/MatchesCard';
import TopPerformersCard from '../../components/players/TopPerformersCard';
import NeedsSupportCard from '../../components/players/NeedsSupportCard';
import TeamListCard from '../../components/team/TeamListCard';
import PageTitle from '../../components/common/PageTitle';
import { Routes } from '@utils/routes';

const AgeGroupOverviewPage: React.FC = () => {
  const { clubId, ageGroupId } = useParams<{ clubId: string; ageGroupId: string }>();
  const navigate = useNavigate();
  
  const [ageGroup, setAgeGroup] = useState<AgeGroupDetailDto | null>(null);
  const [ageGroupLoading, setAgeGroupLoading] = useState(true);
  const [ageGroupError, setAgeGroupError] = useState<string | null>(null);

  const [club, setClub] = useState<ClubDetailDto | null>(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [clubError, setClubError] = useState<string | null>(null);

  const [teams, setTeams] = useState<TeamWithStatsDto[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const [stats, setStats] = useState<AgeGroupStatisticsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId || !ageGroupId) return;

    setAgeGroupLoading(true);
    apiClient.ageGroups.getById(ageGroupId)
      .then((response) => {
        if (response.success && response.data) {
          setAgeGroup(response.data);
          setAgeGroupError(null);
        } else {
          setAgeGroupError(response.error?.message || 'Failed to load age group');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch age group:', err);
        setAgeGroupError('Failed to load age group from API');
      })
      .finally(() => setAgeGroupLoading(false));

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

    setTeamsLoading(true);
    apiClient.teams.getByAgeGroupId(ageGroupId)
      .then((response) => {
        if (response.success && response.data) {
          setTeams(response.data);
          setTeamsError(null);
        } else {
          setTeamsError(response.error?.message || 'Failed to load teams');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch teams:', err);
        setTeamsError('Failed to load teams from API');
      })
      .finally(() => setTeamsLoading(false));

    setStatsLoading(true);
    apiClient.ageGroups.getStatistics(ageGroupId)
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
  }, [clubId, ageGroupId]);

  const normalizeLevel = (level: string): 'youth' | 'amateur' | 'reserve' | 'senior' => {
    const normalized = level.toLowerCase();
    if (normalized === 'youth' || normalized === 'amateur' || normalized === 'reserve' || normalized === 'senior') {
      return normalized;
    }
    return 'youth';
  };

  const toDate = (value?: string) => (value ? new Date(value) : undefined);

  type AgeGroupMatchSummary = AgeGroupStatisticsDto['upcomingMatches'][number];

  const toMatch = (match: AgeGroupMatchSummary, status: Match['status']): Match => ({
    id: match.id,
    teamId: match.teamId,
    opposition: match.opposition,
    date: new Date(match.date),
    meetTime: toDate(match.meetTime),
    kickOffTime: toDate(match.kickOffTime) ?? new Date(match.date),
    location: match.location || '',
    isHome: match.isHome,
    competition: match.competition || '',
    status,
    score: match.score ? { home: match.score.home, away: match.score.away } : undefined
  });

  const upcomingMatches = stats?.upcomingMatches.map(match => toMatch(match, 'scheduled')) ?? [];
  const previousResults = stats?.previousResults.map(match => toMatch(match, 'completed')) ?? [];

  const ageGroupModel: AgeGroup | null = ageGroup
    ? {
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
      }
    : null;

  const clubModel: Club | null = club
    ? {
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
      }
    : null;

  const teamModels: Team[] = teams.map(team => ({
    id: team.id,
    clubId: team.clubId,
    ageGroupId: team.ageGroupId,
    name: team.name,
    shortName: team.shortName,
    level: normalizeLevel(team.level),
    season: team.season,
    coachIds: [],
    playerIds: [],
    colors: {
      primary: team.colors?.primary || '#000000',
      secondary: team.colors?.secondary || '#FFFFFF'
    },
    isArchived: team.isArchived
  }));

  const isArchived = ageGroupModel?.isArchived ?? false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-grow">
            {(ageGroupLoading || clubLoading) ? (
              <div className="animate-pulse">
                <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ) : ageGroupModel ? (
              <PageTitle
                title={ageGroupModel.name}
                subtitle={`${ageGroupModel.description ?? ''} • Season: ${ageGroupModel.season}${ageGroupModel.defaultSquadSize ? ` • Default: ${ageGroupModel.defaultSquadSize}-a-side` : ''}`.trim()}
                action={{
                  label: 'Settings',
                  icon: 'settings',
                  title: 'Settings',
                  onClick: () => navigate(Routes.ageGroupSettings(clubId!, ageGroupId!)),
                  variant: 'primary'
                }}
              />
            ) : (
              <div className="text-red-600 dark:text-red-400">
                {ageGroupError || 'Age group not found'}
              </div>
            )}
          </div>
          {isArchived && (
            <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
              🗄️ Archived
            </span>
          )}
        </div>

        {clubError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load club</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{clubError}</p>
          </div>
        )}

        {/* Archived Notice */}
        {isArchived && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This age group is archived. No new teams can be added and modifications are restricted. Go to Settings to unarchive.
            </p>
          </div>
        )}

        {/* Statistics Cards */}
        {statsError ? (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load statistics</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{statsError}</p>
          </div>
        ) : statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        ) : stats ? (
          <StatsGrid stats={stats} />
        ) : null}

        {/* Teams Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Teams</h3>
            {!isArchived && (
              <Link
                to={Routes.teamNew(clubId!, ageGroupId!)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
              </Link>
            )}
          </div>
          
          {teamsError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">Failed to load teams</p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{teamsError}</p>
            </div>
          ) : teamsLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          ) : teamModels.length > 0 && clubModel && ageGroupModel ? (
            <div className="flex flex-col gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
              {teamModels.map((team, index) => (
                <TeamListCard
                  key={team.id}
                  team={team}
                  club={clubModel}
                  ageGroup={ageGroupModel}
                  stats={teams[index].stats}
                  onClick={team.isArchived ? undefined : () => navigate(Routes.team(clubId!, ageGroupId!, team.id))}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No teams yet in this age group</p>
              {!isArchived && (
                <Link
                  to={Routes.teamNew(clubId!, ageGroupId!)}
                  className="inline-flex px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create First Team
                </Link>
              )}
            </div>
          )}
        </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {statsLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))
        ) : (
          <>
            <MatchesCard 
              type="upcoming"
              matches={upcomingMatches}
              limit={3}
              viewAllLink={Routes.ageGroupMatches(clubId!, ageGroupId!)}
              showTeamInfo={true}
              getTeamInfo={(match) => ({
                teamName: stats?.upcomingMatches.find(m => m.id === match.id)?.teamName || 'Unknown',
                ageGroupName: stats?.upcomingMatches.find(m => m.id === match.id)?.ageGroupName || 'Unknown'
              })}
              getMatchLink={(matchId, match) => {
                return Routes.matchReport(clubId!, ageGroupId!, match.teamId, matchId);
              }}
            />
            <MatchesCard 
              type="results"
              matches={previousResults}
              limit={3}
              viewAllLink={Routes.ageGroupMatches(clubId!, ageGroupId!)}
              showTeamInfo={true}
              getTeamInfo={(match) => ({
                teamName: stats?.previousResults.find(m => m.id === match.id)?.teamName || 'Unknown',
                ageGroupName: stats?.previousResults.find(m => m.id === match.id)?.ageGroupName || 'Unknown'
              })}
              getMatchLink={(matchId, match) => {
                return Routes.matchReport(clubId!, ageGroupId!, match.teamId, matchId);
              }}
            />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {statsLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))
        ) : (
          <>
            <TopPerformersCard 
              performers={(stats?.topPerformers ?? []).map(p => ({
                playerId: p.playerId,
                firstName: p.firstName || '',
                lastName: p.lastName || '',
                averageRating: p.averageRating,
                matchesPlayed: p.matchesPlayed
              }))}
              getPlayerLink={(playerId) => Routes.player(clubId!, ageGroupId!, playerId)}
            />
            <NeedsSupportCard 
              performers={(stats?.underperforming ?? []).map(p => ({
                playerId: p.playerId,
                firstName: p.firstName || '',
                lastName: p.lastName || '',
                averageRating: p.averageRating,
                matchesPlayed: p.matchesPlayed
              }))}
              getPlayerLink={(playerId) => Routes.player(clubId!, ageGroupId!, playerId)}
            />
          </>
        )}
      </div>
      </main>
    </div>
  );
};

export default AgeGroupOverviewPage;

