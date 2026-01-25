import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useClubById, useClubMatches, ClubMatchDto } from '@/api';
import type { Match } from '@/types';
import PageTitle from '@components/common/PageTitle';
import MatchesListContent from '@/components/matches/MatchesListContent';

/**
 * Maps a ClubMatchDto from the API to the Match type used by MatchesListContent
 */
function mapClubMatchToMatch(dto: ClubMatchDto): Match {
  return {
    id: dto.id,
    teamId: dto.teamId,
    squadSize: dto.squadSize as Match['squadSize'],
    opposition: dto.opposition,
    date: new Date(dto.date),
    meetTime: dto.meetTime ? new Date(dto.meetTime) : undefined,
    kickOffTime: new Date(dto.kickOffTime),
    location: dto.location,
    isHome: dto.isHome,
    competition: dto.competition,
    score: dto.homeScore !== null && dto.homeScore !== undefined && dto.awayScore !== null && dto.awayScore !== undefined
      ? { home: dto.homeScore, away: dto.awayScore }
      : undefined,
    status: dto.status as Match['status'],
    isLocked: dto.isLocked,
    weather: dto.weatherCondition
      ? { condition: dto.weatherCondition, temperature: dto.weatherTemperature ?? 0 }
      : undefined,
  };
}

function MatchesListSkeleton() {
  return (
    <>
      {/* Stats Summary Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card text-center animate-pulse">
            <div className="h-8 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>

      {/* Matches List Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-24">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex-1 flex items-center justify-center gap-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ClubMatchesPage() {
  const { clubId } = useParams();
  
  // Fetch club details from API
  const { data: club, isLoading: clubLoading, error: clubError } = useClubById(clubId);
  
  // Fetch matches from API
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useClubMatches(clubId);

  // Map API DTOs to Match type and create team name lookup
  const { clubMatches, getTeamName, getAgeGroupId } = useMemo(() => {
    if (!matchesData?.matches) {
      return { clubMatches: [], getTeamName: () => 'Unknown Team', getAgeGroupId: () => '' };
    }

    const matches = matchesData.matches.map(mapClubMatchToMatch);
    
    // Build team name and age group ID lookup from match data
    const teamNameMap = new Map<string, string>();
    const teamAgeGroupMap = new Map<string, string>();
    matchesData.matches.forEach(m => {
      if (m.teamId && m.ageGroupName && m.teamName) {
        teamNameMap.set(m.teamId, `${m.ageGroupName} - ${m.teamName}`);
      }
      if (m.teamId && m.ageGroupId) {
        teamAgeGroupMap.set(m.teamId, m.ageGroupId);
      }
    });

    const getTeamNameFn = (teamId: string): string => {
      return teamNameMap.get(teamId) ?? 'Unknown Team';
    };

    const getAgeGroupIdFn = (teamId: string): string => {
      return teamAgeGroupMap.get(teamId) ?? '';
    };

    return { clubMatches: matches, getTeamName: getTeamNameFn, getAgeGroupId: getAgeGroupIdFn };
  }, [matchesData]);

  // Show not found if club doesn't exist after loading
  if (!clubLoading && !club && clubError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Club not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const isLoading = clubLoading || matchesLoading;
  const hasError = matchesError && !matchesLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          {clubLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : (
            <>
              <PageTitle
                title="All Matches"
                subtitle={club?.name ?? ''}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Viewing matches from all teams across the club
              </p>
            </>
          )}
        </div>

        {isLoading ? (
          <MatchesListSkeleton />
        ) : hasError ? (
          <div className="card p-8 text-center text-red-600 dark:text-red-400">
            Failed to load matches. Please try again later.
          </div>
        ) : (
          <MatchesListContent
            matches={clubMatches}
            clubId={clubId!}
            showTeamInfo={true}
            getTeamName={getTeamName}
            getAgeGroupId={getAgeGroupId}
          />
        )}
      </main>
    </div>
  );
}
