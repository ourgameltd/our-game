import { Player } from '@/types';
import { groupAttributes } from '@/utils/attributeHelpers';
import { ReactNode } from 'react';
import { calculateAge } from '@/utils/dateOfBirth';
import type { CompetencyBand } from '@api/competencies';

const BAND_COLOURS: Record<CompetencyBand, string> = {
  Development: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Advanced: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  Elite: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

interface PlayerCardProps {
  player: Player;
  squadNumber?: number;
  isCaptain?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  badges?: ReactNode;
  actions?: ReactNode;
  detailDisplay?: 'attributes' | 'banding';
  competencyBand?: CompetencyBand | null;
}

export default function PlayerCard({
  player,
  squadNumber,
  isCaptain = false,
  onClick,
  isSelected = false,
  badges,
  actions,
  detailDisplay = 'attributes',
  competencyBand = null
}: PlayerCardProps) {
  const age = calculateAge(player.dateOfBirth);
  const indicatorClass = player.isArchived ? 'bg-gray-300 dark:bg-gray-600' : 'bg-primary-500 dark:bg-primary-400';
  
  // Convert player attributes to grouped format and get top 4 attributes
  const topAttributes = detailDisplay === 'attributes'
    ? [
      ...groupAttributes(player.attributes).skills,
      ...groupAttributes(player.attributes).physical,
      ...groupAttributes(player.attributes).mental,
    ]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)
    : [];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-card p-3 md:rounded-none md:shadow-none md:p-0 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b hover:shadow-card-hover md:hover:shadow-none md:hover:bg-gray-50 md:dark:hover:bg-gray-700 transition-all h-full ${onClick ? 'cursor-pointer' : ''} ${
        isSelected ? 'ring-4 ring-primary-500 dark:ring-primary-400 bg-primary-50 dark:bg-primary-900/30' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 md:items-stretch md:gap-3 h-full">
        <div className={`w-1 self-stretch rounded-full shrink-0 ${indicatorClass}`} />

        <div className="flex items-center gap-2 flex-1 min-w-0 md:flex-row md:items-center md:gap-4">
          {/* Squad Number */}
          {squadNumber !== undefined && (
            <div className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold shrink-0 md:order-1">
              {squadNumber}
            </div>
          )}

          {/* Avatar */}
          <div className="shrink-0 md:order-1">
            {player.photo ? (
              <img
                src={player.photo}
                alt={`${player.firstName} ${player.lastName}`}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 md:w-10 md:h-10 bg-linear-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {player.firstName[0]}{player.lastName[0]}
              </div>
            )}
          </div>

          {/* Name + compact info — mobile only */}
          <div className="flex-1 min-w-0 md:hidden">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {player.firstName} {player.lastName}
              {isCaptain && <span className="ml-1 text-amber-500">©</span>}
            </p>
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {age !== null && <span className="text-xs text-gray-500 dark:text-gray-400">Age {age}</span>}
              {player.preferredPositions.slice(0, 2).map(pos => (
                <span key={pos} className="badge-primary text-[10px] px-1.5 py-0.5">{pos}</span>
              ))}
            </div>
          </div>

          {/* Name — desktop only */}
          <div className="hidden md:flex md:items-baseline md:gap-2 md:min-w-48 md:shrink-0 md:order-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {player.firstName} {player.lastName}
              {isCaptain && <span className="ml-1 text-amber-500" title="Captain">©</span>}
            </h3>
            {player.nickname && (
              <span className="text-xs font-normal text-primary-600 dark:text-primary-400 whitespace-nowrap">"{player.nickname}"</span>
            )}
          </div>

          {/* Age — desktop only */}
          <p className="hidden md:block text-sm text-gray-600 dark:text-gray-400 md:w-16 md:shrink-0 md:order-3">
            {age !== null ? `Age ${age}` : ''}
          </p>

          {/* Positions — desktop only */}
          <div className="hidden md:block md:w-32 md:shrink-0 md:order-4">
            <div className="flex flex-wrap gap-1">
              {player.preferredPositions.map(position => (
                <span key={position} className="badge-primary text-xs">
                  {position}
                </span>
              ))}
            </div>
          </div>

          {/* Attributes — desktop only */}
          {detailDisplay === 'attributes' && topAttributes.length > 0 && (
            <div className="hidden md:block md:order-5 md:flex-1">
              <div className="md:flex md:gap-4 md:justify-end">
                {topAttributes.map(attribute => (
                  <div key={attribute.name} className="flex md:flex-row md:items-center md:gap-2 text-sm gap-1">
                    <span className="text-gray-600 dark:text-gray-400 truncate text-xs">{attribute.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white shrink-0">{attribute.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banding — desktop only */}
          {detailDisplay === 'banding' && (
            <div className="hidden md:flex md:order-5 md:flex-1 md:justify-end md:items-center">
              {competencyBand ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${BAND_COLOURS[competencyBand]}`}>
                  {competencyBand}
                </span>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
              )}
            </div>
          )}

          {/* Empty spacer when no attributes on desktop */}
          {detailDisplay === 'attributes' && topAttributes.length === 0 && (
            <div className="hidden md:block md:flex-1 md:order-5" />
          )}

          {/* Badges */}
          {badges && (
            <div className="flex items-center gap-2 shrink-0 md:order-6">
              {badges}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 shrink-0 md:order-7">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
