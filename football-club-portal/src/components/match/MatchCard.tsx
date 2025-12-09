import { Match } from '@/types';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const hasScore = match.score !== undefined;
  const isWin = match.score
    ? match.isHome 
      ? match.score.home > match.score.away
      : match.score.away > match.score.home
    : false;
  const isDraw = match.score ? match.score.home === match.score.away : false;
  const isLoss = match.score && !isWin && !isDraw;

  const statusColor = isWin 
    ? 'bg-green-50 border-green-200'
    : isDraw
    ? 'bg-yellow-50 border-yellow-200'
    : isLoss
    ? 'bg-red-50 border-red-200'
    : 'bg-blue-50 border-blue-200';

  return (
    <div 
      className={`card-hover border ${statusColor} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">
          {format(match.date, 'EEE, MMM d, yyyy')}
        </span>
        {hasScore && (
          <span className={`badge ${
            isWin ? 'badge-success' : isDraw ? 'badge-warning' : 'badge-danger'
          }`}>
            {isWin ? 'Won' : isDraw ? 'Draw' : 'Lost'}
          </span>
        )}
        {!hasScore && (
          <span className="badge bg-blue-100 text-blue-800">Upcoming</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="font-semibold text-gray-900">
            {match.isHome ? 'Vale FC' : match.opposition}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {match.isHome ? 'Home' : 'Away'}
          </div>
        </div>

        <div className="px-4">
          {match.score ? (
            <div className="text-2xl font-bold text-gray-900">
              {match.isHome ? match.score.home : match.score.away}
              {' - '}
              {match.isHome ? match.score.away : match.score.home}
            </div>
          ) : (
            <div className="text-lg font-medium text-gray-600">
              {format(match.date, 'h:mm a')}
            </div>
          )}
        </div>

        <div className="text-center flex-1">
          <div className="font-semibold text-gray-900">
            {match.isHome ? match.opposition : 'Vale FC'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {match.isHome ? 'Away' : 'Home'}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          📍 {match.location}
        </div>
        <div className="text-xs text-gray-500">
          {match.competition}
        </div>
      </div>
    </div>
  );
}
