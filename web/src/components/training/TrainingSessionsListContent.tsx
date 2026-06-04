import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Settings } from 'lucide-react';
import { sampleDrills } from '@/data/training';
import { Routes } from '@utils/routes';
import { TrainingSession } from '@/types';

interface TrainingSessionsListContentProps {
  sessions: TrainingSession[];
  clubId: string;
  ageGroupId: string;
  teamId?: string;
  squadCount?: number;
}

export default function TrainingSessionsListContent({
  sessions,
  clubId,
  ageGroupId,
  teamId,
  squadCount
}: TrainingSessionsListContentProps) {
  const now = new Date();
  
  // Sort and split sessions
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const upcomingSessions = sortedSessions
    .filter(s => new Date(s.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Soonest first
  const pastSessions = sortedSessions.filter(s => new Date(s.date) < now);

  const navigate = useNavigate();

  const SessionRow = ({ session }: { session: TrainingSession }) => {
    const sessionDate = new Date(session.date);
    const isPast = sessionDate < now;
    const drills = session.drillIds.map(id => sampleDrills.find(d => d.id === id)).filter(Boolean);
    const totalDrillTime = drills.reduce((acc, d) => acc + (d?.duration || 0), 0);
    const sessionTeamId = teamId || session.teamId;
    const detailLink = Routes.teamTrainingSession(clubId, ageGroupId, sessionTeamId, session.id);

    return (
      <div
        className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => navigate(detailLink)}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-4">
          {/* Date & Time */}
          <div className="flex items-center gap-3 md:flex-shrink-0 md:w-[130px] md:order-1">
            <div className="flex-shrink-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {sessionDate.toLocaleDateString('en-GB', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {sessionDate.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            {/* Duration badge - visible on mobile only */}
            <span className="md:hidden text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              {session.duration} mins
            </span>
          </div>

          {/* Session Details */}
          <div className="flex-grow md:order-2">
            {/* Focus Areas */}
            {session.focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {session.focusAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}

            {/* Drills + Coaches Info */}
            {(drills.length > 0 || (session.coachCount ?? 0) > 0) && (
              <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
                {drills.length > 0 && (
                  <span>{drills.length} drill{drills.length !== 1 ? 's' : ''} • {totalDrillTime} mins total</span>
                )}
                {drills.length > 0 && (session.coachCount ?? 0) > 0 && (
                  <span>·</span>
                )}
                {(session.coachCount ?? 0) > 0 && (
                  <span>{session.coachCount} coach{session.coachCount !== 1 ? 'es' : ''}</span>
                )}
              </div>
            )}
          </div>

          {/* Location - mobile only as card footer */}
          <div className="text-xs text-gray-600 dark:text-gray-400 md:hidden border-t border-gray-100 dark:border-gray-700 pt-2 -mx-4 px-4 -mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {session.location}
          </div>

          {/* Desktop-only: Duration */}
          <div className="hidden md:block md:order-3 md:flex-shrink-0 md:w-[100px]">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {session.duration} mins
            </span>
          </div>

          {/* Desktop-only: Location */}
          <div className="hidden md:block md:order-4 md:flex-shrink-0 md:w-[140px]">
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 inline" />
              {session.location}
            </span>
          </div>

          {/* Status/Attendance */}
          <div className="hidden md:flex md:order-5 md:flex-shrink-0 items-center gap-2 md:w-[200px] justify-end">
            {isPast && squadCount !== undefined && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap">
                {(session.attendance ?? []).filter(a => a.status === 'confirmed').length}/{squadCount}
              </span>
            )}
            {(session.coachCount ?? 0) > 0 && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded whitespace-nowrap">
                {session.confirmedCoachCount ?? 0}/{session.coachCount}
              </span>
            )}
            {!isPast && (session.coachCount ?? 0) === 0 && (
              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded whitespace-nowrap">
                Scheduled
              </span>
            )}
          </div>

          {/* Mobile-only: Status badge + edit button */}
          <div className="md:hidden -mx-4 px-4 -mb-1 border-t border-gray-100 dark:border-gray-700 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPast && squadCount !== undefined && (
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap">
                  {(session.attendance ?? []).filter(a => a.status === 'confirmed').length}/{squadCount}
                </span>
              )}
              {(session.coachCount ?? 0) > 0 && (
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded whitespace-nowrap">
                  {session.confirmedCoachCount ?? 0}/{session.coachCount}
                </span>
              )}
              {!isPast && (session.coachCount ?? 0) === 0 && (
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded whitespace-nowrap">
                  Scheduled
                </span>
              )}
            </div>
            <Link
              to={Routes.teamTrainingSessionEdit(clubId, ageGroupId, sessionTeamId, session.id)}
              onClick={e => e.stopPropagation()}
              className="p-2 bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 rounded-lg transition-colors"
              title="Edit session"
              aria-label="Edit training session"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop-only: Edit cog button */}
          <div className="hidden md:flex md:order-6 md:flex-shrink-0 items-center gap-2 md:w-[60px] justify-end">
            <Link
              to={Routes.teamTrainingSessionEdit(clubId, ageGroupId, sessionTeamId, session.id)}
              onClick={e => e.stopPropagation()}
              className="p-1.5 bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 rounded-lg transition-colors"
              title="Edit session"
              aria-label="Edit training session"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Sessions
          </h2>
          <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {upcomingSessions.map(session => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Previous Sessions
        </h2>
        {pastSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {pastSessions.map(session => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No previous sessions yet
            </p>
          </div>
        )}
      </div>
    </>
  );
}
