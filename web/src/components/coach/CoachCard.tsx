import { Coach } from '@/types';
import { ReactNode } from 'react';
import { calculateAge } from '@/utils/dateOfBirth';

interface CoachCardProps {
  coach: Coach;
  onClick?: () => void;
  badges?: ReactNode;
  actions?: ReactNode;
  forceCard?: boolean;
}

export default function CoachCard({ coach, onClick, badges, actions, forceCard = false }: CoachCardProps) {
  const age = calculateAge(coach.dateOfBirth);
  const indicatorClass = coach.isArchived ? 'bg-gray-300 dark:bg-gray-600' : 'bg-primary-500 dark:bg-primary-400';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-card p-3 border border-gray-200 dark:border-gray-700 hover:shadow-card-hover transition-all h-full ${
        !forceCard
          ? 'md:rounded-none md:shadow-none md:p-0 md:px-4 md:py-3 md:border-0 md:border-b md:hover:shadow-none md:hover:bg-gray-50 md:dark:hover:bg-gray-700'
          : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`flex items-center gap-2 h-full ${!forceCard ? 'md:items-stretch md:gap-3' : ''}`}>
        <div className={`w-1 self-stretch rounded-full shrink-0 ${indicatorClass}`} />

        <div className={`flex items-center gap-2 flex-1 min-w-0 ${!forceCard ? 'md:flex-row md:items-center md:gap-4' : ''}`}>
          {/* Avatar */}
          <div className={`shrink-0 ${!forceCard ? 'md:order-1' : ''}`}>
            {coach.photo ? (
              <img
                src={coach.photo}
                alt={`${coach.firstName} ${coach.lastName}`}
                className={`w-9 h-9 rounded-full object-cover ${!forceCard ? 'md:w-10 md:h-10' : ''}`}
              />
            ) : (
              <div className={`w-9 h-9 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white text-sm font-bold ${!forceCard ? 'md:w-10 md:h-10' : ''}`}>
                {coach.firstName[0]}{coach.lastName[0]}
              </div>
            )}
          </div>

          {/* Name + role — always visible in card mode; mobile-only in list mode */}
          <div className={`flex-1 min-w-0 ${!forceCard ? 'md:hidden' : ''}`}>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {coach.firstName} {coach.lastName}
            </p>
            {coach.clubRoles?.[0] && (
              <p className="text-xs text-secondary-600 dark:text-secondary-400 truncate mt-0.5">
                {coach.clubRoles[0]}
              </p>
            )}
            {forceCard && age !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Age {age}</p>
            )}
          </div>

          {/* Name — desktop list mode only */}
          {!forceCard && (
            <h3 className="hidden md:block text-base font-semibold text-gray-900 dark:text-white truncate md:w-44 md:shrink-0 md:order-2">
              {coach.firstName} {coach.lastName}
            </h3>
          )}

          {/* Role — desktop list mode only */}
          {!forceCard && (
            <p className="hidden md:block text-sm font-medium text-secondary-600 dark:text-secondary-400 md:w-32 md:shrink-0 md:order-3">
              {coach.clubRoles?.[0] ?? ''}
            </p>
          )}

          {/* Age — desktop list mode only */}
          {!forceCard && (
            age !== null ? (
              <p className="hidden md:block text-sm text-gray-600 dark:text-gray-400 md:w-16 md:shrink-0 md:order-4">
                Age {age}
              </p>
            ) : (
              <div className="hidden md:block md:w-16 md:shrink-0 md:order-4" />
            )
          )}

          {/* Specializations — desktop list mode only */}
          {!forceCard && (
            coach.specializations && coach.specializations.length > 0 ? (
              <div className="hidden md:block md:flex-1 md:order-5">
                <div className="flex flex-wrap gap-1">
                  {coach.specializations.slice(0, 3).map((spec, index) => (
                    <span key={index} className="badge-secondary text-xs">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="hidden md:block md:flex-1 md:order-5" />
            )
          )}

          {/* Badges */}
          {badges && (
            <div className={`flex items-center gap-2 shrink-0 ${!forceCard ? 'md:order-6' : ''}`}>
              {badges}
            </div>
          )}

          {/* Actions / status */}
          <div className={`flex items-center gap-2 shrink-0 ${!forceCard ? 'md:order-7' : ''}`}>
            {coach.associationId && (
              <p className="text-xs text-gray-500 dark:text-gray-500 hidden lg:block">
                FA ID: {coach.associationId}
              </p>
            )}
            {coach.hasAccount && (
              <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="hidden md:inline">Active</span>
              </span>
            )}
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}
