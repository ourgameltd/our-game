import { useParams } from 'react-router-dom';
import { sampleTrainingSessions } from '@/data/training';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { Routes } from '@utils/routes';
import PageTitle from '@components/common/PageTitle';
import TrainingSessionsListContent from '@/components/training/TrainingSessionsListContent';

export default function TrainingSessionsListPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  
  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  
  if (!team || !club) {
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

  // Filter sessions for this team
  const teamSessions = sampleTrainingSessions.filter(s => s.teamId === teamId);

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
          sessions={teamSessions}
          clubId={clubId!}
          ageGroupId={ageGroupId!}
          teamId={teamId}
        />
      </main>
    </div>
  );
}
