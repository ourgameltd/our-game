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
      return acc + s.attendance.filter(a => a.present).length;
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
        className="block bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Date & Time */}
          <div className="flex-shrink-0 w-[110px]">
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
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {session.duration} mins
            </div>
          </div>

          {/* Session Details */}
          <div className="flex-grow">
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
            
            {/* Location */}
            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {session.location}
            </div>
            
            {/* Drills Info */}
            {drills.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {drills.length} drill{drills.length !== 1 ? 's' : ''} ({totalDrillTime} mins)
              </div>
            )}
          </div>

          {/* Status/Attendance */}
          <div className="flex-shrink-0 flex items-center gap-2 min-w-[120px] justify-end">
            {isPast && session.attendance && session.attendance.length > 0 && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded whitespace-nowrap">
                {session.attendance.filter(a => a.present).length}/{session.attendance.length} attended
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Sessions
          </h2>
          <div className="space-y-3">
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
          <div className="space-y-3">
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
