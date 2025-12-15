import { Player } from '@/types';
import { groupAttributes } from '@/utils/attributeHelpers';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
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
      className={`card-hover h-full flex flex-col ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {player.photo ? (
          <img 
            src={player.photo} 
            alt={`${player.firstName} ${player.lastName}`}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {player.firstName[0]}{player.lastName[0]}
          </div>
        )}
        
        <div className="flex-1 min-w-0 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {player.firstName} {player.lastName}
            {player.nickname && (
              <span className="text-sm font-normal text-primary-600 dark:text-primary-400 ml-2">"{player.nickname}"</span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Age {age}</p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {player.preferredPositions.map(position => (
              <span key={position} className="badge-primary">
                {position}
              </span>
            ))}
          </div>
        </div>
      </div>

      {topAttributes.length > 0 && (
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            {topAttributes.map(attribute => (
              <div key={attribute.name} className="flex justify-between text-sm gap-2">
                <span className="text-gray-600 dark:text-gray-400 truncate">{attribute.name}</span>
                <span className="font-medium text-gray-900 dark:text-white flex-shrink-0">{attribute.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
