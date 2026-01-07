import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { sampleDrills } from '@/data/training';
import { Routes } from '@utils/routes';
import { TrainingSession } from '@/types';

interface TrainingSessionsListContentProps {
  sessions: TrainingSession[];
  clubId: string;
  ageGroupId: string;
  teamId?: string;
}

export default function TrainingSessionsListContent({
  sessions,
  clubId,
  ageGroupId,
  teamId
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

  // Stats
  const completedCount = pastSessions.length;
  const totalAttendance = pastSessions.reduce((acc, s) => {
    if (s.attendance) {
      return acc + s.attendance.filter(a => a.status === 'confirmed').length;
    }
    return acc;
  }, 0);
  const totalExpected = pastSessions.reduce((acc, s) => {
    if (s.attendance) {
      return acc + s.attendance.length;
    }
    return acc;
  }, 0);
  const avgAttendance = totalExpected > 0 ? Math.round((totalAttendance / totalExpected) * 100) : 0;

  const SessionRow = ({ session }: { session: TrainingSession }) => {
    const sessionDate = new Date(session.date);
    const isPast = sessionDate < now;
    const drills = session.drillIds.map(id => sampleDrills.find(d => d.id === id)).filter(Boolean);
    const totalDrillTime = drills.reduce((acc, d) => acc + (d?.duration || 0), 0);
    const sessionTeamId = teamId || session.teamId;

    return (
      <Link
        to={Routes.teamTrainingSessionEdit(clubId, ageGroupId, sessionTeamId, session.id)}
        className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 md:border-0 md:border-b"
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
            
            {/* Drills Info */}
            {drills.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {drills.length} drill{drills.length !== 1 ? 's' : ''} • {totalDrillTime} mins total
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
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate block flex items-center gap-1">
              <MapPin className="w-3 h-3 inline" />
              {session.location}
            </span>
          </div>

          {/* Status/Attendance */}
          <div className="hidden md:flex md:order-5 md:flex-shrink-0 items-center gap-2 md:w-[120px] justify-end">
            {isPast && session.attendance && session.attendance.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap">
                {session.attendance.filter(a => a.status === 'confirmed').length}/{session.attendance.length}
              </span>
            )}
            {!isPast && (
              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded whitespace-nowrap">
                Scheduled
              </span>
            )}
          </div>

          {/* Mobile-only: Status badge */}
          <div className="md:hidden flex items-center gap-2">
            {isPast && session.attendance && session.attendance.length > 0 && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap">
                {session.attendance.filter(a => a.status === 'confirmed').length}/{session.attendance.length} attended
              </span>
            )}
            {!isPast && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded whitespace-nowrap">
                Scheduled
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sessions.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {upcomingSessions.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {avgAttendance}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</div>
        </div>
      </div>

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
