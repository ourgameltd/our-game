import { Coach } from '@/types';

interface CoachCardProps {
  coach: Coach;
  onClick?: () => void;
}

export default function CoachCard({ coach, onClick }: CoachCardProps) {
  const age = new Date().getFullYear() - coach.dateOfBirth.getFullYear();

  const handleSendInvite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking invite button
    // In a real app, this would send an invite email via the backend
    alert(`Invite sent to ${coach.email}! (Demo - not actually sent)`);
  };

  const roleDisplay: Record<string, string> = {
    'head-coach': 'Head Coach',
    'assistant-coach': 'Assistant Coach',
    'goalkeeper-coach': 'Goalkeeper Coach',
    'fitness-coach': 'Fitness Coach',
    'technical-coach': 'Technical Coach',
  };

  return (
    <div 
      className={`card-hover h-full flex flex-col ${onClick ? 'cursor-pointer' : ''}`}
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

      <div className="mt-auto pt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {coach.associationId && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              FA ID: {coach.associationId}
            </p>
          )}
          {coach.hasAccount ? (
            <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Account Active
            </span>
          ) : (
            <button
              onClick={handleSendInvite}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Invite
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
