import { Player } from '@/types';

interface PlayerDetailsHeaderProps {
  player: Player;
  customColorClass?: string;
}

export default function PlayerDetailsHeader({ 
  player, 
  customColorClass = 'from-primary-500 to-primary-600' 
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
    <div className="flex items-start gap-6">
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
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
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
    </div>
  );
}
