import { Player } from '@/types';
import { groupAttributes } from '@/utils/attributeHelpers';
import { ReactNode } from 'react';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  isSelected?: boolean;
  badges?: ReactNode;
  actions?: ReactNode;
}

export default function PlayerCard({ player, onClick, isSelected = false, badges, actions }: PlayerCardProps) {
  const age = new Date().getFullYear() - player.dateOfBirth.getFullYear();
  
  // Convert player attributes to grouped format and get top 4 attributes
  const groupedAttributes = groupAttributes(player.attributes);
  const allAttributes = [
    ...groupedAttributes.skills,
    ...groupedAttributes.physical,
    ...groupedAttributes.mental
  ];
  
  // Sort by rating and take top 4
  const topAttributes = allAttributes
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div 
      className={`card-hover h-full ${onClick ? 'cursor-pointer' : ''} ${
        isSelected ? 'ring-4 ring-primary-500 dark:ring-primary-400 bg-primary-50 dark:bg-primary-900/30' : ''
      } flex flex-col md:flex-row md:items-center md:gap-4 md:py-3`}
      onClick={onClick}
    >
      {/* Photo - shows at top on mobile, left on desktop */}
      <div className="flex items-center gap-3 mb-3 md:mb-0 md:flex-shrink-0 md:order-1">
        {player.photo ? (
          <img 
            src={player.photo} 
            alt={`${player.firstName} ${player.lastName}`}
            className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 md:w-10 md:h-10 bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 rounded-full flex items-center justify-center text-white text-lg md:text-base font-bold flex-shrink-0">
            {player.firstName[0]}{player.lastName[0]}
          </div>
        )}
        
        {/* Name and positions shown inline with photo on mobile only */}
        <div className="flex-1 min-w-0 md:hidden">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {player.firstName} {player.lastName}
            {player.nickname && (
              <span className="text-sm font-normal text-primary-600 dark:text-primary-400 ml-2">"{player.nickname}"</span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Age {age}</p>
        </div>
        
        {/* Mobile badges */}
        {badges && (
          <div className="flex gap-2 md:hidden">
            {badges}
          </div>
        )}
      </div>

      {/* Name - desktop only (separate column) */}
      <h3 className="hidden md:block text-base font-semibold text-gray-900 dark:text-white truncate md:w-44 md:flex-shrink-0 md:order-2">
        {player.firstName} {player.lastName}
        {player.nickname && (
          <span className="text-xs font-normal text-primary-600 dark:text-primary-400 ml-1">"{player.nickname}"</span>
        )}
      </h3>

      {/* Age - desktop only */}
      <p className="hidden md:block text-sm text-gray-600 dark:text-gray-400 md:w-16 md:flex-shrink-0 md:order-3">
        Age {age}
      </p>

      {/* Positions */}
      <div className="mb-3 md:mb-0 md:w-32 md:flex-shrink-0 md:order-4">
        <div className="flex flex-wrap gap-1">
          {player.preferredPositions.map(position => (
            <span key={position} className="badge-primary text-xs">
              {position}
            </span>
          ))}
        </div>
      </div>

      {/* Top Attributes - shown differently on mobile vs desktop */}
      {topAttributes.length > 0 && (
        <div className="mt-auto pt-4 md:pt-0 md:mt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700 md:order-5">
          <div className="grid grid-cols-2 md:flex md:gap-6 gap-2">
            {topAttributes.map(attribute => (
              <div key={attribute.name} className="flex justify-between md:flex-row md:items-center md:gap-2 text-sm gap-1">
                <span className="text-gray-600 dark:text-gray-400 truncate text-xs">{attribute.name}</span>
                <span className="font-medium text-gray-900 dark:text-white flex-shrink-0">{attribute.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty spacer when no attributes on desktop */}
      {topAttributes.length === 0 && (
        <div className="hidden md:block md:order-5" />
      )}

      {/* Desktop badges - inline */}
      {badges && (
        <div className="hidden md:flex items-center gap-2 md:order-6 md:flex-shrink-0">
          {badges}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="hidden md:flex items-center gap-2 md:order-7 md:flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
