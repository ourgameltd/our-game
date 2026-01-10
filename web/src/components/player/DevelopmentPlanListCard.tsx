import { Link } from 'react-router-dom';
import { DevelopmentPlan, Player } from '@/types';
import { Target, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';

interface DevelopmentPlanListCardProps {
  plan: DevelopmentPlan;
  player: Player;
  linkTo: string;
}

export default function DevelopmentPlanListCard({ plan, player, linkTo }: DevelopmentPlanListCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'archived':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
    }
  };

  const completedGoals = plan.goals.filter(g => g.completed).length;
  const totalGoals = plan.goals.length;
  const overallProgress = totalGoals > 0 
    ? Math.round(plan.goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
    : 0;

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
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {player.firstName[0]}{player.lastName[0]}
              </span>
            </div>
          )}
        </div>

        {/* Plan Content */}
        <div className="flex-1 min-w-0">
          {/* Player Name & Status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {player.firstName} {player.lastName}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize flex-shrink-0 ${getStatusColor(plan.status)}`}>
              {plan.status}
            </span>
          </div>

          {/* Plan Title */}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {plan.title}
          </p>

          {/* Period */}
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(plan.period.start)} - {formatDate(plan.period.end)}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{completedGoals} / {totalGoals} goals completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{overallProgress}% overall progress</span>
            </div>
          </div>

          {/* Top Goal Preview */}
          {plan.goals.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  plan.goals[0].completed 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {plan.goals[0].goal}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
