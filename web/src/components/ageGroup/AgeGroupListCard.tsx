import React, { ReactNode } from 'react';
import { AgeGroup, Club } from '@/types';
import { getGradientColors, getContrastTextColorClass, getPerformanceColorClass } from '@utils/colorHelpers';

interface AgeGroupStats {
  teamCount: number;
  playerCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
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
  club,
  stats,
  badges,
  actions
}) => {
  const { primaryColor, secondaryColor } = getGradientColors(club);
  const textColorClass = getContrastTextColorClass(primaryColor);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-0 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors overflow-hidden ${
        ageGroup.isArchived ? 'opacity-75' : ''
      }`}
    >
      {/* Mobile: Card Layout */}
      <div className="md:hidden flex items-stretch">
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{
            backgroundImage: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`,
          }}
        />
        <div className="flex-1 min-w-0">
          {/* Gradient Header */}
          <div 
            className={`p-4 ${textColorClass} relative`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{ageGroup.name}</h3>
                <p className="text-sm opacity-90 mt-1">{ageGroup.description}</p>
              </div>
              {ageGroup.isArchived && (
                <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs shrink-0">
                  🗄️ Archived
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-4">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.teamCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.playerCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Players</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getPerformanceColorClass(stats.winRate, 'winRate')}`}>
                  {stats.winRate}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getPerformanceColorClass(stats.goalDifference, 'goalDifference')}`}>
                  {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Goal Diff</div>
              </div>
            </div>

            {/* W-D-L Record */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm">
                <span className="font-semibold text-green-600 dark:text-green-400">{stats.wins}W</span>
                <span className="mx-2 text-gray-400">-</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">{stats.draws}D</span>
                <span className="mx-2 text-gray-400">-</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{stats.losses}L</span>
              </div>
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                View →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Row Layout */}
      <div className="hidden md:flex md:items-center md:gap-4">
        {/* Color indicator */}
        <div 
          className="w-1 self-stretch rounded-full shrink-0"
          style={{
            backgroundImage: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`,
          }}
        />

        {/* Name & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {ageGroup.name}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {ageGroup.description}
          </p>
        </div>

        {/* Teams */}
        <div className="shrink-0 w-15 text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.teamCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Teams</div>
        </div>

        {/* Players */}
        <div className="shrink-0 w-15 text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.playerCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Players</div>
        </div>

        {/* W-D-L */}
        <div className="shrink-0 w-22.5 text-center">
          <div className="text-sm">
            <span className="font-semibold text-green-600 dark:text-green-400">{stats.wins}</span>
            <span className="mx-1 text-gray-400">-</span>
            <span className="font-semibold text-gray-500 dark:text-gray-400">{stats.draws}</span>
            <span className="mx-1 text-gray-400">-</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{stats.losses}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">W - D - L</div>
        </div>

        {/* Win Rate */}
        <div className="shrink-0 w-15 text-center">
          <div className={`text-lg font-bold ${getPerformanceColorClass(stats.winRate, 'winRate')}`}>
            {stats.winRate}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
        </div>

        {/* Goal Difference */}
        <div className="shrink-0 w-12.5 text-center">
          <div className={`text-lg font-bold ${getPerformanceColorClass(stats.goalDifference, 'goalDifference')}`}>
            {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">GD</div>
        </div>

        {/* Badges */}
        {badges && (
          <div className="shrink-0 flex items-center gap-2">
            {badges}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="shrink-0 flex items-center gap-2">
            {actions}
          </div>
        )}

        {/* Arrow indicator */}
        <div className="shrink-0">
          <span className="text-gray-400 dark:text-gray-500">→</span>
        </div>
      </div>
    </div>
  );
};

export default AgeGroupListCard;
