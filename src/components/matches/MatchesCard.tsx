import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Match } from '@/types';

interface TeamInfo {
  teamName: string;
  ageGroupName: string;
}

interface MatchesCardProps {
  type: 'upcoming' | 'results';
  matches: Match[];
  limit?: number;
  title?: string;
  emptyMessage?: string;
  addMatchLink?: string;
  viewAllLink?: string;
  getMatchLink?: (matchId: string, match: Match) => string;
  showTeamInfo?: boolean;
  getTeamInfo?: (match: Match) => TeamInfo | null;
}

const MatchesCard: React.FC<MatchesCardProps> = ({ 
  type,
  matches,
  limit = 3,
  title,
  emptyMessage,
  addMatchLink,
  viewAllLink,
  getMatchLink,
  showTeamInfo = false,
  getTeamInfo
}) => {
  const displayMatches = matches.slice(0, limit);
  const isUpcoming = type === 'upcoming';
  
  const defaultTitle = isUpcoming ? 'Upcoming Matches' : 'Recent Results';
  const defaultEmptyMessage = isUpcoming ? 'No upcoming matches scheduled' : 'No previous results';

  const getMatchResult = (match: Match) => {
    if (!match.score) return null;
    const ourScore = match.isHome ? match.score.home : match.score.away;
    const theirScore = match.isHome ? match.score.away : match.score.home;
    
    if (ourScore > theirScore) return 'W';
    if (ourScore < theirScore) return 'L';
    return 'D';
  };

  const getResultBadgeClass = (result: string | null) => {
    switch (result) {
      case 'W': return 'badge-success';
      case 'L': return 'badge-danger';
      case 'D': return 'badge-warning';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title || defaultTitle}
        </h3>
        <div className="flex items-center gap-2">
          {isUpcoming && addMatchLink && (
            <Link
              to={addMatchLink}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              title="Add Match"
            >
              <Plus className="w-5 h-5" />
            </Link>
          )}
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View All →
            </Link>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {displayMatches.length > 0 ? (
          displayMatches.map((match) => {
            const matchLink = getMatchLink ? getMatchLink(match.id, match) : undefined;
            const teamInfo = showTeamInfo && getTeamInfo ? getTeamInfo(match) : null;
            const result = !isUpcoming ? getMatchResult(match) : null;
            const ourScore = match.isHome ? match.score?.home : match.score?.away;
            const theirScore = match.isHome ? match.score?.away : match.score?.home;
            
            const content = (
              <div className="flex items-center gap-3">
                {/* Date */}
                <div className="flex-shrink-0 w-[70px] text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(match.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Opposition */}
                <div className="flex-grow min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {match.isHome ? 'vs' : '@'} {match.opposition}
                  </div>
                  {teamInfo && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                      {teamInfo.teamName} ({teamInfo.ageGroupName})
                    </div>
                  )}
                  {!teamInfo && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                      {match.competition}
                    </div>
                  )}
                </div>

                {/* Score/Time badge */}
                <div className="flex-shrink-0 text-right">
                  {isUpcoming ? (
                    <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {match.isHome ? 'H' : 'A'}
                    </span>
                  ) : match.score ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {ourScore} - {theirScore}
                      </span>
                      <span className={`badge ${getResultBadgeClass(result)}`}>
                        {result}
                      </span>
                    </div>
                  ) : (
                    <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                      TBD
                    </span>
                  )}
                </div>
              </div>
            );
            
            return matchLink ? (
              <Link
                key={match.id}
                to={matchLink}
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {content}
              </Link>
            ) : (
              <div
                key={match.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {content}
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {emptyMessage || defaultEmptyMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchesCard;
