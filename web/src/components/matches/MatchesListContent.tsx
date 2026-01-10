import { Link } from 'react-router-dom';
import { Match } from '@/types';
import { Routes } from '@utils/routes';
import { sampleTeams } from '@/data/teams';

interface MatchesListContentProps {
  matches: Match[];
  clubId: string;
  ageGroupId?: string;
  getTeamName?: (teamId: string) => string;
  showTeamInfo?: boolean;
}

export default function MatchesListContent({
  matches,
  clubId,
  ageGroupId,
  getTeamName,
  showTeamInfo = false
}: MatchesListContentProps) {
  
  const sortedMatches = [...matches].sort((a, b) => b.date.getTime() - a.date.getTime());
  const upcomingMatches = sortedMatches.filter(m => m.date > new Date());
  const pastMatches = sortedMatches.filter(m => m.date <= new Date());

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

  const getMatchLink = (match: Match) => {
    // Get the team to find its age group ID
    const team = sampleTeams.find(t => t.id === match.teamId);
    const matchAgeGroupId = team?.ageGroupId || ageGroupId || '';
    
    return Routes.matchReport(clubId, matchAgeGroupId, match.teamId, match.id);
  };

  const MatchRow = ({ match }: { match: Match }) => {
    const result = getMatchResult(match);
    const ourScore = match.isHome ? match.score?.home : match.score?.away;
    const theirScore = match.isHome ? match.score?.away : match.score?.home;
    const isPast = match.date <= new Date();
    const teamName = showTeamInfo && getTeamName ? getTeamName(match.teamId) : '';

    return (
      <Link
        to={getMatchLink(match)}
        className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 md:border-0 md:border-b"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-4">
          {/* Date & Competition - stacked on mobile, inline on desktop */}
          <div className="flex items-center gap-3 md:flex-shrink-0 md:w-[130px] md:order-1">
            <div className="flex-shrink-0">
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
            </div>
            {/* Competition badge - visible on mobile only */}
            <span className="md:hidden text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded truncate max-w-[120px]">
              {match.competition}
            </span>
          </div>

          {/* Team info badge - shown when viewing multiple teams */}
          {showTeamInfo && teamName && (
            <div className="md:hidden text-xs text-blue-600 dark:text-blue-400 font-medium -mt-2">
              {teamName}
            </div>
          )}

          {/* Match Details - card layout on mobile, row on desktop */}
          <div className="flex items-center gap-4 md:flex-grow md:order-2">
            {/* Home team */}
            <div className="text-right flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                {match.isHome ? 'Vale FC' : match.opposition}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 md:hidden">
                {match.isHome ? 'Home' : 'Away'}
              </div>
            </div>

            {/* Score / VS */}
            <div className="flex-shrink-0 flex items-center justify-center w-[70px] md:w-[80px]">
              {isPast && match.score ? (
                <div className="text-center">
                  <div className="text-xl md:text-lg font-bold text-gray-900 dark:text-white leading-none">
                    {ourScore} - {theirScore}
                  </div>
                  {result && (
                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mt-1 ${getResultColor(result)}`}>
                      {result}
                    </div>
                  )}
                </div>
              ) : isPast && !match.score ? (
                <div className="text-center">
                  <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 leading-tight">
                    Pending
                  </div>
                </div>
              ) : (
                <div className="text-lg font-semibold text-gray-400 dark:text-gray-600 leading-none">
                  VS
                </div>
              )}
            </div>

            {/* Away team */}
            <div className="text-left flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                {match.isHome ? match.opposition : 'Vale FC'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 md:hidden">
                {match.isHome ? 'Away' : 'Home'}
              </div>
            </div>
          </div>

          {/* Location - mobile only as card footer */}
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center md:hidden border-t border-gray-100 dark:border-gray-700 pt-2 -mx-4 px-4 -mb-1">
            📍 {match.location}
          </div>

          {/* Desktop-only: Team name */}
          {showTeamInfo && teamName && (
            <div className="hidden md:block md:order-3 md:flex-shrink-0 md:w-[140px]">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate block">
                {teamName}
              </span>
            </div>
          )}

          {/* Desktop-only: Competition */}
          <div className="hidden md:block md:order-4 md:flex-shrink-0 md:w-[100px]">
            <span className="text-xs text-gray-500 dark:text-gray-500 truncate block">
              {match.competition}
            </span>
          </div>

          {/* Desktop-only: Location */}
          <div className="hidden md:block md:order-5 md:flex-shrink-0 md:w-[140px]">
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate block">
              📍 {match.location}
            </span>
          </div>

          {/* Status/Actions */}
          <div className="hidden md:flex md:order-6 md:flex-shrink-0 items-center gap-2 md:w-[100px] justify-end">
            {match.report?.playerOfTheMatch && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400" title="Has Player of the Match">
                ⭐
              </div>
            )}
            {match.status === 'completed' && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap">
                Report
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {matches.length}
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

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Matches
          </h2>
          <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {upcomingMatches.map(match => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Past Matches */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Previous Matches
        </h2>
        {pastMatches.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
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
    </>
  );
}
