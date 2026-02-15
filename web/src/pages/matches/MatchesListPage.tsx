import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useTeamMatches, TeamMatchDto } from '@/api';
import type { Match } from '@/types';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import MatchesListContent from '@/components/matches/MatchesListContent';

/**
 * Maps a TeamMatchDto from the API to the Match type used by MatchesListContent
 */
function mapTeamMatchToMatch(dto: TeamMatchDto, teamId: string): Match {
  return {
    id: dto.id,
    teamId: teamId,
    opposition: dto.opponentName,
    date: new Date(dto.date),
    kickOffTime: new Date(dto.kickOffTime),
    location: dto.location,
    isHome: dto.isHome,
    competition: dto.competition,
    score: dto.homeScore !== null && dto.homeScore !== undefined && dto.awayScore !== null && dto.awayScore !== undefined
      ? { home: dto.homeScore, away: dto.awayScore }
      : undefined,
    status: dto.status as Match['status'],
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

export default function MatchesListPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  
  // Fetch matches from API
  const { data: matchesData, isLoading, error } = useTeamMatches(teamId);

  // Extract team and club info, and map matches
  const { team, club, matches } = useMemo(() => {
    if (!matchesData) {
      return { team: null, club: null, matches: [] };
    }

    const mappedMatches = matchesData.matches.map(m => mapTeamMatchToMatch(m, teamId!));

    return {
      team: matchesData.team,
      club: matchesData.club,
      matches: mappedMatches,
    };
  }, [matchesData, teamId]);

  // Show not found if team doesn't exist after loading
  if (!isLoading && !team && error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const hasError = error && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-grow">
                  <PageTitle
                    title="Matches"
                    subtitle={team ? `${team.name} - ${club?.name}` : ''}
                    action={team && !team.isArchived ? {
                      label: 'Add Match',
                      icon: 'plus',
                      title: 'Add Match',
                      onClick: () => window.location.href = Routes.matchNew(clubId!, ageGroupId!, teamId!),
                      variant: 'success'
                    } : undefined}
                  />
                </div>
                {team?.isArchived && (
                  <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
                    🗄️ Archived
                  </span>
                )}
              </div>

              {/* Archived Notice */}
              {team?.isArchived && (
                <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    ⚠️ This team is archived. New matches cannot be scheduled while the team is archived.
                  </p>
                </div>
              )}
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
            matches={matches}
            clubId={clubId!}
            ageGroupId={ageGroupId!}
            showTeamInfo={false}
          />
        )}
      </main>
    </div>
  );
}
