import { Coach } from '@/types';
import { Link } from 'react-router-dom';
import { coachRoleDisplay } from '@/data/referenceData';

interface CoachDetailsHeaderProps {
  coach: Coach;
  customColorClass?: string;
  settingsLink?: string;
}

export default function CoachDetailsHeader({ 
  coach, 
  customColorClass = 'from-secondary-500 to-secondary-600',
  settingsLink
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

  return (
    <div className="flex items-start gap-4">
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
          <span className="font-medium text-secondary-600 dark:text-secondary-400">{coachRoleDisplay[coach.role]}</span>
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
      {settingsLink && (
        <Link
          to={settingsLink}
          className="p-2 bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 rounded-lg transition-colors"
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
