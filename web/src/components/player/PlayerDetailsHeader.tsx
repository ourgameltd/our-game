import { Player } from '@/types';
import { Link } from 'react-router-dom';

interface PlayerDetailsHeaderProps {
  player: Player;
  customColorClass?: string;
  settingsLink?: string;
}

export default function PlayerDetailsHeader({ 
  player, 
  customColorClass = 'from-primary-500 to-primary-600',
  settingsLink
}: PlayerDetailsHeaderProps) {
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(player.dateOfBirth);

  return (
    <div className="flex items-start gap-4">
      {player.photo ? (
        <img 
          src={player.photo} 
          alt={`${player.firstName} ${player.lastName}`}
          className="w-24 h-24 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${customColorClass} flex items-center justify-center text-white text-3xl font-bold flex-shrink-0`}>
          {player.firstName[0]}{player.lastName[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white break-words">
          {player.firstName} {player.lastName}
          {player.nickname && (
            <span className="text-xl font-normal text-primary-600 dark:text-primary-400 ml-3">"{player.nickname}"</span>
          )}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Age: {age} years old</span>
          <span>•</span>
          <span>Positions: {player.preferredPositions.join(', ')}</span>
        </div>
      </div>
      {settingsLink && (
        <Link
          to={settingsLink}
          className="p-2 bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 rounded-lg transition-colors flex-shrink-0"
          title="Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      )}
    </div>
  );
}
