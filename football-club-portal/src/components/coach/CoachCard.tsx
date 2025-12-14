import { Coach } from '@/types';

interface CoachCardProps {
  coach: Coach;
  onClick?: () => void;
}

export default function CoachCard({ coach, onClick }: CoachCardProps) {
  const age = new Date().getFullYear() - coach.dateOfBirth.getFullYear();

  const roleDisplay: Record<string, string> = {
    'head-coach': 'Head Coach',
    'assistant-coach': 'Assistant Coach',
    'goalkeeper-coach': 'Goalkeeper Coach',
    'fitness-coach': 'Fitness Coach',
    'technical-coach': 'Technical Coach',
  };

  return (
    <div 
      className={`card-hover ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {coach.photo ? (
          <img 
            src={coach.photo} 
            alt={`${coach.firstName} ${coach.lastName}`}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {coach.firstName[0]}{coach.lastName[0]}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {coach.firstName} {coach.lastName}
          </h3>
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
            {roleDisplay[coach.role]}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Age {age}</p>
        </div>
      </div>

      {coach.specializations && coach.specializations.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {coach.specializations.slice(0, 3).map((spec, index) => (
              <span key={index} className="badge-secondary">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {coach.associationId && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            FA ID: {coach.associationId}
          </p>
        </div>
      )}
    </div>
  );
}
