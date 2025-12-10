import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '@/types';

interface PreviousResultsCardProps {
  matches: Match[];
  viewAllLink?: string;
  getMatchLink?: (matchId: string, match: Match) => string;
  title?: string;
  showTeamInfo?: boolean;
  getTeamInfo?: (match: Match) => { teamName: string; ageGroupName: string } | null;
}

const PreviousResultsCard: React.FC<PreviousResultsCardProps> = ({ 
  matches, 
  viewAllLink,
  getMatchLink,
  title = 'Recent Results',
  showTeamInfo = false,
  getTeamInfo
}) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            View All →
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {matches.length > 0 ? (
          matches.map((match) => {
            const isWin = match.score && match.isHome 
              ? match.score.home > match.score.away
              : match.score && match.score.away > match.score.home;
            const isDraw = match.score && match.score.home === match.score.away;
            
            const matchLink = getMatchLink ? getMatchLink(match.id, match) : undefined;
            const teamInfo = showTeamInfo && getTeamInfo ? getTeamInfo(match) : null;
            
            const content = (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(match.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {teamInfo && ` - ${teamInfo.teamName} (${teamInfo.ageGroupName})`}
                  </span>
                  <span className={`badge ${
                    isWin ? 'badge-success' : isDraw ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {isWin ? 'Won' : isDraw ? 'Draw' : 'Lost'}
                  </span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {match.isHome ? 'vs' : '@'} {match.opposition}
                </div>
                {match.score && (
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {match.isHome ? match.score.home : match.score.away} - {match.isHome ? match.score.away : match.score.home}
                  </div>
                )}
              </>
            );
            
            return matchLink ? (
              <Link
                key={match.id}
                to={matchLink}
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                {content}
              </Link>
            ) : (
              <div
                key={match.id}
                className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {content}
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No previous results</p>
        )}
      </div>
    </div>
  );
};

export default PreviousResultsCard;
