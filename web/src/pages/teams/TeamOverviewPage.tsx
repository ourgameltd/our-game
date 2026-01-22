import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTeamOverview } from '@/api/hooks';
import { TeamMatchSummaryDto } from '@/api';
import StatsGrid from '@components/stats/StatsGrid';
import MatchesCard from '@components/matches/MatchesCard';
import TopPerformersCard from '@components/players/TopPerformersCard';
import NeedsSupportCard from '@components/players/NeedsSupportCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { Match } from '@/types';

export default function TeamOverviewPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  const { data: overview, isLoading, error } = useTeamOverview(teamId);

  const team = overview?.team ?? null;
  const stats = overview?.statistics ?? null;
  const upcomingTrainingSessions = overview?.upcomingTrainingSessions ?? [];

  const mapMatchSummary = (matches: TeamMatchSummaryDto[], status: Match['status']): Match[] => {
    return matches.map(match => ({
      id: match.id,
      teamId: match.teamId,
      opposition: match.opposition,
      date: new Date(match.date),
      meetTime: match.meetTime ? new Date(match.meetTime) : undefined,
      kickOffTime: match.kickOffTime ? new Date(match.kickOffTime) : new Date(match.date),
      location: match.location,
      isHome: match.isHome,
      competition: match.competition ?? '',
      score: match.score,
      status
    }));
  };

  const upcomingMatches = stats ? mapMatchSummary(stats.upcomingMatches, 'scheduled') : [];
  const previousResults = stats ? mapMatchSummary(stats.previousResults, 'completed') : [];

  const topPerformersData = stats?.topPerformers ?? [];
  const needsAttentionData = stats?.underperforming ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-grow">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ) : team ? (
              <PageTitle
                title={team.name}
                subtitle="Team Overview"
                action={{
                  label: 'Settings',
                  icon: 'settings',
                  title: 'Settings',
                  onClick: () => navigate(Routes.teamSettings(clubId!, ageGroupId!, teamId!)),
                  variant: 'primary'
                }}
              />
            ) : (
              <div className="text-red-600 dark:text-red-400">
                {error?.message || 'Team not found'}
              </div>
            )}
          </div>
          {team?.isArchived && (
            <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
              🗄️ Archived
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load team overview</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Archived Notice */}
        {team?.isArchived && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. Modifications are restricted. Go to Settings to unarchive.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        ) : stats ? (
          <StatsGrid stats={stats} />
        ) : null}

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))
          ) : (
            <>
              <MatchesCard 
                type="upcoming"
                matches={upcomingMatches}
                limit={3}
                viewAllLink={Routes.matches(clubId!, ageGroupId!, teamId!)}
                getMatchLink={(matchId) => Routes.matchReport(clubId!, ageGroupId!, teamId!, matchId)}
              />
              <MatchesCard 
                type="results"
                matches={previousResults}
                limit={3}
                viewAllLink={Routes.matches(clubId!, ageGroupId!, teamId!)}
                getMatchLink={(matchId) => Routes.matchReport(clubId!, ageGroupId!, teamId!, matchId)}
              />
            </>
          )}
        </div>

        {/* Upcoming Training Sessions */}
        <div className="card mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Training Sessions</h3>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
              </div>
            ) : upcomingTrainingSessions.length > 0 ? (
              upcomingTrainingSessions.map((session) => (
                <Link
                  key={session.id}
                  to={Routes.teamTrainingSessionEdit(clubId!, ageGroupId!, teamId!, session.id)}
                  className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {new Date(session.date).toLocaleDateString('en-GB', { 
                          weekday: 'long',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} • {session.durationMinutes ?? 0} minutes
                      </div>
                    </div>
                    <span className="badge bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {session.location}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {session.focusAreas.map((area, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No upcoming training sessions scheduled.</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))
          ) : (
            <>
              <TopPerformersCard 
                performers={topPerformersData}
                getPlayerLink={(playerId) => Routes.player(clubId!, ageGroupId!, playerId)}
              />
              <NeedsSupportCard 
                performers={needsAttentionData}
                getPlayerLink={(playerId) => Routes.player(clubId!, ageGroupId!, playerId)}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

