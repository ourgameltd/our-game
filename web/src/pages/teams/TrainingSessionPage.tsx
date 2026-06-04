import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import PageTitle from '@components/common/PageTitle';
import { apiClient } from '@/api';
import type { TrainingSessionDetailDto } from '@/api';
import { useCurrentUser, useMyChildren, useUpdateMySessionAttendance } from '@/api/hooks';
import { useNavigation } from '@/contexts/NavigationContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Routes } from '@/utils/routes';
import AttendanceResponse from '@components/AttendanceResponse';

export default function TrainingSessionPage() {
  const { sessionId, clubId, ageGroupId, teamId } = useParams();
  const { setEntityName } = useNavigation();

  const [session, setSession] = useState<TrainingSessionDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>({});

  const { data: currentUser } = useCurrentUser();
  const { data: myChildren } = useMyChildren();
  const { submit: submitAttendance, isSubmitting: attendanceSubmitting } = useUpdateMySessionAttendance(sessionId ?? '');

  usePageTitle(
    [session?.teamName ?? 'Team', 'Training Session'],
    !!session,
  );

  useEffect(() => {
    if (!sessionId) return;
    setIsLoading(true);
    apiClient.trainingSessions.getById(sessionId).then(res => {
      if (res.success && res.data) {
        setSession(res.data);
        setEntityName('team', res.data.teamId, res.data.teamName);
      } else {
        setLoadError(res.error?.message ?? 'Failed to load session');
      }
      setIsLoading(false);
    });
  }, [sessionId]);

  const handleAttendanceRespond = async (status: 'confirmed' | 'declined', playerId?: string) => {
    const key = playerId ?? (currentUser?.coachId ? 'coach' : 'player');
    const res = await submitAttendance(status, playerId);
    if (res.success) {
      setAttendanceOverrides(prev => ({ ...prev, [key]: status }));
    }
  };

  const handleAddToCalendar = () => {
    if (!session?.meetTime) return;
    const meet = new Date(session.meetTime);
    const end = session.durationMinutes
      ? new Date(meet.getTime() + session.durationMinutes * 60 * 1000)
      : new Date(meet.getTime() + 90 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(meet)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Training — ${session.teamName}`,
      `LOCATION:${session.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Error Loading Session</h2>
            <p className="text-gray-700 dark:text-gray-300">{loadError}</p>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card mb-4">
            <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
            <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="card mb-4">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isCoach = !!currentUser?.coachId;
  const sessionDate = new Date(session.sessionDate);
  const children = myChildren ?? [];

  // Build my attendance rows
  const myAttendanceRows: { label?: string; photo?: string; initials?: string; status: string; playerId?: string }[] = [];

  if (currentUser?.playerId) {
    const rec = session.attendance.find(a => a.playerId === currentUser.playerId);
    if (rec) myAttendanceRows.push({ status: attendanceOverrides['player'] ?? rec.status });
  }

  if (currentUser?.coachId) {
    const rec = session.coaches.find(c => c.coachId === currentUser.coachId);
    if (rec) myAttendanceRows.push({
      photo: currentUser.photo || undefined,
      initials: `${currentUser.firstName[0]}${currentUser.lastName[0]}`,
      status: attendanceOverrides['coach'] ?? rec.status,
    });
  }

  for (const child of children) {
    const rec = session.attendance.find(a => a.playerId === child.id);
    if (rec) {
      myAttendanceRows.push({
        photo: child.photo,
        initials: `${child.firstName[0]}${child.lastName[0]}`,
        status: attendanceOverrides[child.id] ?? rec.status,
        playerId: child.id,
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={`Training — ${session.teamName}`}
          backLink={clubId && ageGroupId && teamId ? Routes.teamTrainingSessions(clubId, ageGroupId, teamId) : undefined}
          action={isCoach && clubId && ageGroupId && teamId && sessionId ? {
            label: 'Settings',
            href: Routes.teamTrainingSessionEdit(clubId, ageGroupId, teamId, sessionId),
            icon: 'settings',
          } : undefined}
        />

        {/* Session Details */}
        <div className="card mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Session Details</h2>
          <div className="mb-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>📅 {sessionDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              {session.meetTime && (
                <>
                  <span>•</span>
                  <span>🕐 Meet: {new Date(session.meetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button type="button" onClick={handleAddToCalendar} className="btn-sm btn-secondary btn-icon" title="Add to calendar">
                    <CalendarPlus className="w-4 h-4" />
                  </button>
                </>
              )}
              {session.durationMinutes && (
                <>
                  <span>•</span>
                  <span>⏱ {session.durationMinutes} min</span>
                </>
              )}
            </div>
            {session.location && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">📍 {session.location}</p>
            )}
            {session.focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {session.focusAreas.map(area => (
                  <span key={area} className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
          {session.notes && (
            <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-600 dark:border-blue-400">
              <p className="text-sm text-gray-700 dark:text-gray-300">{session.notes}</p>
            </div>
          )}
        </div>

        {/* Your Attendance */}
        {myAttendanceRows.length > 0 && (
          <div className="card mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Attendance</h2>
            <div className="space-y-3">
              {myAttendanceRows.map((row, i) => (
                <AttendanceResponse
                  key={i}
                  status={row.status}
                  onConfirm={() => handleAttendanceRespond('confirmed', row.playerId)}
                  onDecline={() => handleAttendanceRespond('declined', row.playerId)}
                  isSubmitting={attendanceSubmitting}
                  label={row.label}
                  photo={row.photo}
                  initials={row.initials}
                />
              ))}
            </div>
          </div>
        )}

        {/* Drills */}
        {session.drills.length > 0 && (
          <div className="card mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Session Plan</h2>
            <div className="space-y-3">
              {session.drills.map((drill, index) => (
                <div key={drill.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-7 h-7 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{drill.drillName}</p>
                    {drill.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{drill.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{drill.category}</span>
                      {drill.durationMinutes && <><span>•</span><span>{drill.durationMinutes} min</span></>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
