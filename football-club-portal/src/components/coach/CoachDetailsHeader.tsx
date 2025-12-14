import { Coach } from '@/types';

interface CoachDetailsHeaderProps {
  coach: Coach;
  customColorClass?: string;
}

export default function CoachDetailsHeader({ 
  coach, 
  customColorClass = 'from-secondary-500 to-secondary-600' 
}: CoachDetailsHeaderProps) {
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(coach.dateOfBirth);

  const roleDisplay: Record<string, string> = {
    'head-coach': 'Head Coach',
    'assistant-coach': 'Assistant Coach',
    'goalkeeper-coach': 'Goalkeeper Coach',
    'fitness-coach': 'Fitness Coach',
    'technical-coach': 'Technical Coach',
  };

  return (
    <div className="flex items-start gap-6">
      {coach.photo ? (
        <img 
          src={coach.photo} 
          alt={`${coach.firstName} ${coach.lastName}`}
          className="w-24 h-24 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${customColorClass} flex items-center justify-center text-white text-3xl font-bold flex-shrink-0`}>
          {coach.firstName[0]}{coach.lastName[0]}
        </div>
      )}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {coach.firstName} {coach.lastName}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-secondary-600 dark:text-secondary-400">{roleDisplay[coach.role]}</span>
          <span>•</span>
          <span>Age: {age} years old</span>
          {coach.associationId && (
            <>
              <span>•</span>
              <span>FA ID: {coach.associationId}</span>
            </>
          )}
        </div>
        {coach.specializations && coach.specializations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {coach.specializations.map((spec, index) => (
              <span key={index} className="badge-secondary">
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
