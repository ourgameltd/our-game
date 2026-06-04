import React, { ReactNode } from 'react';
import { AgeGroup, Club } from '@/types';
import { getPerformanceColorClass } from '@utils/colorHelpers';

interface AgeGroupStats {
  teamCount: number;
  playerCount: number;
  matchesPlayed?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  winRate?: number;
  goalDifference?: number;
}

interface AgeGroupListCardProps {
  ageGroup: AgeGroup;
  club: Club;
  stats: AgeGroupStats;
  badges?: ReactNode;
  actions?: ReactNode;
}

const AgeGroupListCard: React.FC<AgeGroupListCardProps> = ({
  ageGroup,
  club: _club,
  stats,
  badges,
  actions
}) => {
  const indicatorClass = ageGroup.isArchived
    ? 'bg-gray-300 dark:bg-gray-600'
    : 'bg-primary-500 dark:bg-primary-400';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg md:rounded-none px-4 py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors overflow-hidden ${
        ageGroup.isArchived ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Indicator */}
        <div className={`w-1 self-stretch rounded-full shrink-0 ${indicatorClass}`} />

        {/* Name & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {ageGroup.name}
            </span>
            {ageGroup.isArchived && (
              <span className="hidden sm:inline-flex badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs shrink-0">
                🗄️ Archived
              </span>
            )}
          </div>
          {ageGroup.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ageGroup.description}</p>
          )}
        </div>

        {/* Counts */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center min-w-[36px]">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{stats.teamCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Teams</div>
          </div>
          <div className="text-center min-w-[36px]">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{stats.playerCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Players</div>
          </div>

          {stats.wins !== undefined && (
            <>
              <div className="hidden sm:block text-center min-w-[52px]">
                <div className="text-xs font-medium">
                  <span className="text-green-600 dark:text-green-400">{stats.wins}</span>
                  <span className="mx-0.5 text-gray-400">-</span>
                  <span className="text-gray-500 dark:text-gray-400">{stats.draws}</span>
                  <span className="mx-0.5 text-gray-400">-</span>
                  <span className="text-red-600 dark:text-red-400">{stats.losses}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">W-D-L</div>
              </div>
              <div className="hidden md:block text-center min-w-[44px]">
                <div className={`text-sm font-semibold ${getPerformanceColorClass(stats.winRate ?? 0, 'winRate')}`}>
                  {stats.winRate}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
              </div>
              <div className="hidden md:block text-center min-w-[32px]">
                <div className={`text-sm font-semibold ${getPerformanceColorClass(stats.goalDifference ?? 0, 'goalDifference')}`}>
                  {(stats.goalDifference ?? 0) >= 0 ? '+' : ''}{stats.goalDifference}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">GD</div>
              </div>
            </>
          )}
        </div>

        {badges && <div className="shrink-0 flex items-center gap-2">{badges}</div>}
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}

        <span className="text-gray-400 dark:text-gray-500 shrink-0">→</span>
      </div>
    </div>
  );
};

export default AgeGroupListCard;
