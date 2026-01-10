import { Link } from 'react-router-dom';
import { PlayerReport, Player } from '@/types';
import { Calendar } from 'lucide-react';

interface ReportCardTableRowProps {
  report: PlayerReport;
  player: Player;
  linkTo: string;
}

export default function ReportCardTableRow({ report, player, linkTo }: ReportCardTableRowProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Link 
      to={linkTo}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
    >
      {/* Player Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {player.photo ? (
          <img
            src={player.photo}
            alt={`${player.firstName} ${player.lastName}`}
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {player.firstName[0]}{player.lastName[0]}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {player.firstName} {player.lastName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {player.preferredPositions[0] || 'N/A'}
          </div>
        </div>
      </div>

      {/* Period */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(report.period.start)} - {formatDate(report.period.end)}</span>
      </div>

      {/* Stats */}
      <div className="hidden lg:block text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
        {report.strengths.length} / {report.areasForImprovement.length}
      </div>

      {/* Arrow */}
      <div className="text-primary-600 dark:text-primary-400 flex-shrink-0">
        →
      </div>
    </Link>
  );
}
