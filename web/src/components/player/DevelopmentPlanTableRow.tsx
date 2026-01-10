import { Link } from 'react-router-dom';
import { DevelopmentPlan, Player } from '@/types';
import { Calendar, Target } from 'lucide-react';

interface DevelopmentPlanTableRowProps {
  plan: DevelopmentPlan;
  player: Player;
  linkTo: string;
}

export default function DevelopmentPlanTableRow({ plan, player, linkTo }: DevelopmentPlanTableRowProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'completed':
        return 'text-blue-600 dark:text-blue-400';
      case 'archived':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const completedGoals = plan.goals.filter(g => g.completed).length;
  const totalGoals = plan.goals.length;

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
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
        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(plan.period.start)} - {formatDate(plan.period.end)}</span>
      </div>

      {/* Status & Goals */}
      <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-medium capitalize ${getStatusColor(plan.status)}`}>
          {plan.status}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Target className="w-3.5 h-3.5" />
          <span>{completedGoals} / {totalGoals}</span>
        </div>
      </div>

      {/* Arrow */}
      <div className="text-primary-600 dark:text-primary-400 flex-shrink-0">
        →
      </div>
    </Link>
  );
}
