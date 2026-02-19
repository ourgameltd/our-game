import { useParams } from 'react-router-dom';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import TrainingSessionsListContent from '@/components/training/TrainingSessionsListContent';
import { useTeamTrainingSessions } from '@/api/hooks';
import { TeamTrainingSessionDto } from '@/api/client';
import { TrainingSession } from '@/types';

// Helper function to map API DTO to UI model
const mapApiSessionToUiSession = (dto: TeamTrainingSessionDto): TrainingSession => ({
  id: dto.id,
  teamId: '', // Will be set from context
  date: new Date(dto.date),
  meetTime: dto.meetTime ? new Date(dto.meetTime) : undefined,
  duration: dto.durationMinutes || 90,
  location: dto.location,
  focusAreas: dto.focusAreas,
  drillIds: dto.drillIds,
  attendance: dto.attendance.map(a => ({
    playerId: a.playerId,
    status: a.status as 'confirmed' | 'declined' | 'maybe' | 'pending',
    notes: a.notes
  })),
  status: dto.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
  isLocked: dto.isLocked
});

export default function TrainingSessionsListPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  
  const { data, isLoading, error } = useTeamTrainingSessions(teamId);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="mb-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="card">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Error loading training sessions</h2>
            <p className="text-gray-600 dark:text-gray-400">{error.message || 'An error occurred'}</p>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!data?.team || !data?.club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const team = data.team;
  const club = data.club;
  const sessions = data.sessions.map((s: TeamTrainingSessionDto) => ({
    ...mapApiSessionToUiSession(s),
    teamId: team.id
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-grow">
              <PageTitle
                title="Training Sessions"
                subtitle={`${team.name} - ${club.name}`}
                action={!team.isArchived ? {
                  label: 'Add Session',
                  icon: 'plus',
                  title: 'Add Training Session',
                  onClick: () => window.location.href = Routes.teamTrainingSessionNew(clubId!, ageGroupId!, teamId!),
                  variant: 'success'
                } : undefined}
              />
            </div>
            {team.isArchived && (
              <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
                🗄️ Archived
              </span>
            )}
          </div>

          {/* Archived Notice */}
          {team.isArchived && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                ⚠️ This team is archived. New training sessions cannot be scheduled while the team is archived.
              </p>
            </div>
          )}
        </div>

        <TrainingSessionsListContent
          sessions={sessions}
          clubId={clubId!}
          ageGroupId={ageGroupId!}
          teamId={teamId}
        />
      </main>
    </div>
  );
}
