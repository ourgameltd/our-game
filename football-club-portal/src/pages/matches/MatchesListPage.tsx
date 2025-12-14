import { useParams, Link } from 'react-router-dom';
import { sampleMatches } from '@/data/matches';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { Match } from '@/types';
import { Routes } from '@utils/routes';
import { getTeamNavigationTabs } from '@/utils/navigationHelpers';
import PageNavigation from '@/components/navigation/PageNavigation';

export default function MatchesListPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  
  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  
  if (!team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  // Filter matches for this team
  const teamMatches = sampleMatches
    .filter(m => m.teamId === teamId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const upcomingMatches = teamMatches.filter(m => m.date > new Date());
  const pastMatches = teamMatches.filter(m => m.date <= new Date());

  const getMatchResult = (match: Match) => {
    if (!match.score) return null;
    const ourScore = match.isHome ? match.score.home : match.score.away;
    const theirScore = match.isHome ? match.score.away : match.score.home;
    
    if (ourScore > theirScore) return 'W';
    if (ourScore < theirScore) return 'L';
    return 'D';
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'W': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'L': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'D': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const MatchRow = ({ match }: { match: Match }) => {
    const result = getMatchResult(match);
    const ourScore = match.isHome ? match.score?.home : match.score?.away;
    const theirScore = match.isHome ? match.score?.away : match.score?.home;
    const isPast = match.date <= new Date();

    return (
      <Link
        to={Routes.matchReport(clubId!, ageGroupId!, teamId!, match.id)}
        className="block bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Date & Competition */}
          <div className="flex-shrink-0 w-[110px]">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {match.date.toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {match.date.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
              {match.competition}
            </div>
          </div>

          {/* Match Details */}
          <div className="flex-grow">
            <div className="flex items-center gap-4">
              <div className="text-right flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {match.isHome ? team.name : match.opposition}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {match.isHome ? 'Home' : 'Away'}
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center justify-center w-[80px]">
                {isPast && match.score ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                      {ourScore} - {theirScore}
                    </div>
                    {result && (
                      <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mt-1 ${getResultColor(result)}`}>
                        {result}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xl font-semibold text-gray-400 dark:text-gray-600 leading-none">
                    VS
                  </div>
                )}
              </div>

              <div className="text-left flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {match.isHome ? match.opposition : team.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {match.isHome ? 'Away' : 'Home'}
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              📍 {match.location}
            </div>
          </div>

          {/* Status/Actions */}
          <div className="flex-shrink-0 flex items-center gap-2 min-w-[120px] justify-end">
            {match.report?.playerOfTheMatch && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400" title="Has Player of the Match">
                ⭐
              </div>
            )}
            {match.status === 'completed' && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap">
                Report Available
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getTeamNavigationTabs(clubId!, ageGroupId!, teamId!)} />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Matches
                </h2>
                {team.isArchived && (
                  <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                    🗄️ Archived
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {team.name} - {club.name}
              </p>
            </div>
            {!team.isArchived && (
              <Link
                to={Routes.matchNew(clubId!, ageGroupId!, teamId!)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <span className="text-xl mr-2">+</span>
                Add Match
              </Link>
            )}
          </div>

          {/* Archived Notice */}
          {team.isArchived && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                ⚠️ This team is archived. New matches cannot be scheduled while the team is archived.
              </p>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {teamMatches.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {pastMatches.filter(m => getMatchResult(m) === 'W').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Wins</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {pastMatches.filter(m => getMatchResult(m) === 'D').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Draws</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {pastMatches.filter(m => getMatchResult(m) === 'L').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Losses</div>
            </div>
          </div>
        </div>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Upcoming Matches
            </h2>
            <div className="space-y-3">
              {upcomingMatches.map(match => (
                <MatchRow key={match.id} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* Past Matches */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Previous Matches
          </h2>
          {pastMatches.length > 0 ? (
            <div className="space-y-3">
              {pastMatches.map(match => (
                <MatchRow key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No previous matches yet
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
