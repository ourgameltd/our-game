import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTeamById } from '@data/teams';
import { getPlayersByTeamId } from '@data/players';
import { getTrainingSessionsByTeamId } from '@data/training';
import { getTeamStatistics } from '@data/statistics';
import StatsGrid from '@components/stats/StatsGrid';
import MatchesCard from '@components/matches/MatchesCard';
import TopPerformersCard from '@components/players/TopPerformersCard';
import NeedsSupportCard from '@components/players/NeedsSupportCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';

export default function TeamOverviewPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  const team = getTeamById(teamId!);
  const players = getPlayersByTeamId(teamId!);
  const stats = getTeamStatistics(teamId!);
  
  const trainingSessions = getTrainingSessionsByTeamId(teamId!);
  const upcomingTrainingSessions = trainingSessions.filter(s => new Date(s.date) > new Date()).slice(0, 3);

  if (!team) {
    return <div>Team not found</div>;
  }

  // Mock performance data - map to correct format
  const topPerformersData = players.slice(0, 3).map(p => ({
    playerId: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    averageRating: 7.5 + Math.random() * 1.5,
    matchesPlayed: Math.floor(Math.random() * 15) + 5
  }));
  
  const needsAttentionData = players.slice(-2).map(p => ({
    playerId: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    averageRating: 5.0 + Math.random() * 1.0,
    matchesPlayed: Math.floor(Math.random() * 15) + 5
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-grow">
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
          </div>
          {team.isArchived && (
            <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
              🗄️ Archived
            </span>
          )}
        </div>

        {/* Archived Notice */}
        {team.isArchived && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This team is archived. Modifications are restricted. Go to Settings to unarchive.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <MatchesCard 
            type="upcoming"
            matches={stats.upcomingMatches}
            limit={3}
            viewAllLink={Routes.matches(clubId!, ageGroupId!, teamId!)}
            getMatchLink={(matchId) => Routes.matchReport(clubId!, ageGroupId!, teamId!, matchId)}
          />
          <MatchesCard 
            type="results"
            matches={stats.previousResults}
            limit={3}
            viewAllLink={Routes.matches(clubId!, ageGroupId!, teamId!)}
            getMatchLink={(matchId) => Routes.matchReport(clubId!, ageGroupId!, teamId!, matchId)}
          />
        </div>

        {/* Upcoming Training Sessions */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Training Sessions</h3>
          </div>
          <div className="space-y-3">
            {upcomingTrainingSessions.length > 0 ? (
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
                        {new Date(session.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} • {session.duration} minutes
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

        <div className="grid md:grid-cols-2 gap-6">
          <TopPerformersCard 
            performers={topPerformersData}
            getPlayerLink={(playerId) => Routes.player(clubId!, ageGroupId!, playerId)}
          />
          <NeedsSupportCard 
            performers={needsAttentionData}
            getPlayerLink={(playerId) => Routes.player(clubId!, ageGroupId!, playerId)}
          />
        </div>
      </main>
    </div>
  );
}

