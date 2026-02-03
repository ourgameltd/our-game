import { Link } from 'react-router-dom';
import { PlayerReport } from '@/types';
import { TrendingUp, Calendar, FileText } from 'lucide-react';

type PlayerInfo = {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  preferredPositions?: string[];
};

interface ReportCardListCardProps {
  report: PlayerReport;
  player: PlayerInfo;
  linkTo: string;
}

export default function ReportCardListCard({ report, player, linkTo }: ReportCardListCardProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Link
      to={linkTo}
      className="block card hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Player Photo */}
        <div className="flex-shrink-0">
          {player.photo ? (
            <img
              src={player.photo}
              alt={`${player.firstName} ${player.lastName}`}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {player.firstName[0]}{player.lastName[0]}
              </span>
            </div>
          )}
        </div>

        {/* Report Content */}
        <div className="flex-1 min-w-0">
          {/* Player Name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {player.firstName} {player.lastName}
          </h3>

          {/* Period */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(report.period.start)} - {formatDate(report.period.end)}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>{report.strengths.length} strengths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{report.areasForImprovement.length} areas to improve</span>
            </div>
            {report.developmentActions && (
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{report.developmentActions.length} action plans</span>
              </div>
            )}
          </div>

          {/* Top Strength Preview */}
          {report.strengths.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                "{report.strengths[0]}"
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
