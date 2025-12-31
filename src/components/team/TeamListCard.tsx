import React, { ReactNode } from 'react';
import { Team, Club, AgeGroup } from '@/types';
import { getGradientColors, getContrastTextColorClass, getPerformanceColorClass } from '@utils/colorHelpers';

interface TeamStats {
  playerCount: number;
  coachCount: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalDifference: number;
}

interface TeamListCardProps {
  team: Team;
  club: Club;
  ageGroup?: AgeGroup;
  stats: TeamStats;
  badges?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
}

const TeamListCard: React.FC<TeamListCardProps> = ({ 
  team, 
  club,
  ageGroup,
  stats,
  badges,
  actions,
  onClick
}) => {
  const { primaryColor, secondaryColor } = getGradientColors(club, team);
  const textColorClass = getContrastTextColorClass(primaryColor);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-0 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors overflow-hidden ${
        team.isArchived ? 'opacity-75' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Mobile: Card Layout */}
      <div className="md:hidden">
        {/* Gradient Header */}
        <div 
          className={`p-4 ${textColorClass} relative`}
          style={{
            backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{team.name}</h3>
              <p className="text-sm opacity-90 mt-1">
                {ageGroup?.name && <span>{ageGroup.name} • </span>}
                {team.level.charAt(0).toUpperCase() + team.level.slice(1)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`badge bg-white/20 backdrop-blur-sm ${textColorClass} border border-white/30 text-xs`}>
                {team.level.charAt(0).toUpperCase() + team.level.slice(1)}
              </span>
              {team.isArchived && (
                <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs">
                  🗄️ Archived
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.playerCount}</div>
              <div className="text-xs text-gray-500">Players</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.coachCount}</div>
              <div className="text-xs text-gray-500">Coaches</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${getPerformanceColorClass(stats.winRate, 'winRate')}`}>
                {stats.winRate}%
              </div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${getPerformanceColorClass(stats.goalDifference, 'goalDifference')}`}>
                {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference}
              </div>
              <div className="text-xs text-gray-500">Goal Diff</div>
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

      {/* Desktop: Row Layout */}
      <div className="hidden md:flex md:items-center md:gap-6">
        {/* Color indicator */}
        <div 
          className="w-1 h-12 rounded-full flex-shrink-0"
          style={{
            backgroundImage: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`,
          }}
        />

        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {team.name}
            </h3>
            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
              {team.level.charAt(0).toUpperCase() + team.level.slice(1)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {ageGroup?.name && <span>{ageGroup.name} • </span>}
            Season: {team.season}
          </p>
        </div>

        {/* Players */}
        <div className="flex-shrink-0 w-[60px] text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.playerCount}</div>
          <div className="text-xs text-gray-500">Players</div>
        </div>

        {/* Coaches */}
        <div className="flex-shrink-0 w-[60px] text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.coachCount}</div>
          <div className="text-xs text-gray-500">Coaches</div>
        </div>

        {/* W-D-L */}
        <div className="flex-shrink-0 w-[90px] text-center">
          <div className="text-sm">
            <span className="font-semibold text-green-600 dark:text-green-400">{stats.wins}</span>
            <span className="mx-1 text-gray-400">-</span>
            <span className="font-semibold text-gray-500 dark:text-gray-400">{stats.draws}</span>
            <span className="mx-1 text-gray-400">-</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{stats.losses}</span>
          </div>
          <div className="text-xs text-gray-500">W - D - L</div>
        </div>

        {/* Win Rate */}
        <div className="flex-shrink-0 w-[60px] text-center">
          <div className={`text-lg font-bold ${getPerformanceColorClass(stats.winRate, 'winRate')}`}>
            {stats.winRate}%
          </div>
          <div className="text-xs text-gray-500">Win Rate</div>
        </div>

        {/* Goal Difference */}
        <div className="flex-shrink-0 w-[50px] text-center">
          <div className={`text-lg font-bold ${getPerformanceColorClass(stats.goalDifference, 'goalDifference')}`}>
            {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference}
          </div>
          <div className="text-xs text-gray-500">GD</div>
        </div>

        {/* Badges */}
        {badges && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {badges}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {actions}
          </div>
        )}

        {/* Arrow indicator */}
        <div className="flex-shrink-0">
          <span className="text-gray-400 dark:text-gray-500">→</span>
        </div>
      </div>
    </div>
  );
};

export default TeamListCard;
