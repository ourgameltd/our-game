import { Coach } from '@/types';
import { coachRoleDisplay } from '@/constants/coachRoleDisplay';
import { ReactNode } from 'react';

interface CoachCardProps {
  coach: Coach;
  onClick?: () => void;
  badges?: ReactNode;
  actions?: ReactNode;
}

export default function CoachCard({ coach, onClick, badges, actions }: CoachCardProps) {
  const age = new Date().getFullYear() - coach.dateOfBirth.getFullYear();

  const handleSendInvite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking invite button
    // In a real app, this would send an invite email via the backend
    alert(`Invite sent to ${coach.email}! (Demo - not actually sent)`);
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 md:rounded-none md:shadow-none md:p-0 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b hover:shadow-card-hover md:hover:shadow-none md:hover:bg-gray-50 md:dark:hover:bg-gray-700 transition-all h-full ${onClick ? 'cursor-pointer' : ''} 
        flex flex-col md:flex-row md:items-center md:gap-4`}
      onClick={onClick}
    >
      {/* Photo - shows at top on mobile, left on desktop */}
      <div className="flex items-center gap-3 mb-3 md:mb-0 md:flex-shrink-0 md:order-1">
        {coach.photo ? (
          <img 
            src={coach.photo} 
            alt={`${coach.firstName} ${coach.lastName}`}
            className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 md:w-10 md:h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white text-lg md:text-base font-bold flex-shrink-0">
            {coach.firstName[0]}{coach.lastName[0]}
          </div>
        )}
        
        {/* Name and role shown inline with photo on mobile only */}
        <div className="flex-1 min-w-0 md:hidden">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {coach.firstName} {coach.lastName}
          </h3>
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
            {coachRoleDisplay[coach.role]}
          </p>
        </div>
        
        {/* Mobile badges - top right corner style */}
        {badges && (
          <div className="flex gap-2 md:hidden">
            {badges}
          </div>
        )}
      </div>

      {/* Name - desktop only (separate column) */}
      <h3 className="hidden md:block text-base font-semibold text-gray-900 dark:text-white truncate md:w-44 md:flex-shrink-0 md:order-2">
        {coach.firstName} {coach.lastName}
      </h3>

      {/* Role - desktop only (separate column) */}
      <p className="hidden md:block text-sm font-medium text-secondary-600 dark:text-secondary-400 md:w-32 md:flex-shrink-0 md:order-3">
        {coachRoleDisplay[coach.role]}
      </p>

      {/* Age */}
      <p className="hidden md:block text-sm text-gray-600 dark:text-gray-400 md:w-16 md:flex-shrink-0 md:order-4">
        Age {age}
      </p>

      {/* Specializations */}
      {coach.specializations && coach.specializations.length > 0 && (
        <div className="mt-4 md:mt-0 md:flex-1 md:order-5">
          <div className="flex flex-wrap gap-2 md:gap-1">
            {coach.specializations.slice(0, 3).map((spec, index) => (
              <span key={index} className="badge-secondary text-xs">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty spacer when no specializations on desktop */}
      {(!coach.specializations || coach.specializations.length === 0) && (
        <div className="hidden md:block md:flex-1 md:order-5" />
      )}

      {/* Desktop badges - inline */}
      {badges && (
        <div className="hidden md:flex items-center gap-2 md:order-6 md:flex-shrink-0">
          {badges}
        </div>
      )}

      {/* Status/Actions */}
      <div className="mt-auto pt-3 md:pt-0 md:mt-0 flex items-center justify-between md:justify-end md:gap-4 md:flex-shrink-0 md:order-7">
        <div className="flex items-center gap-3 md:gap-4">
          {coach.associationId && (
            <p className="text-xs text-gray-500 dark:text-gray-500 hidden lg:block">
              FA ID: {coach.associationId}
            </p>
          )}
          {coach.hasAccount ? (
            <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hidden md:inline">Active</span>
              <span className="md:hidden">Account Active</span>
            </span>
          ) : (
            <button
              onClick={handleSendInvite}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden md:inline">Invite</span>
              <span className="md:hidden">Send Invite</span>
            </button>
          )}
          {/* Custom actions */}
          {actions}
        </div>
      </div>
    </div>
  );
}
