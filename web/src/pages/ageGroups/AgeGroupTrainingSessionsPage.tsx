import { useParams } from 'react-router-dom';
import { sampleTrainingSessions } from '@/data/training';
import { sampleClubs } from '@/data/clubs';
import { sampleTeams } from '@/data/teams';
import { getAgeGroupById } from '@/data/ageGroups';
import PageTitle from '@components/common/PageTitle';
import TrainingSessionsListContent from '@/components/training/TrainingSessionsListContent';

export default function AgeGroupTrainingSessionsPage() {
  const { clubId, ageGroupId } = useParams();
  
  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroup = getAgeGroupById(ageGroupId!);
  
  if (!club || !ageGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              {!club ? 'Club not found' : 'Age group not found'}
            </h2>
          </div>
        </main>
      </div>
    );
  }

  // Get all teams for this age group
  const ageGroupTeams = sampleTeams.filter(t => t.ageGroupId === ageGroupId);
  const ageGroupTeamIds = ageGroupTeams.map(t => t.id);

  // Filter training sessions for all teams in this age group
  const ageGroupSessions = sampleTrainingSessions.filter(s => ageGroupTeamIds.includes(s.teamId));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-grow">
              <PageTitle
                title="All Training Sessions"
                subtitle={`${ageGroup.name} - ${club.name}`}
              />
            </div>
            {ageGroup.isArchived && (
              <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 self-start">
                🗄️ Archived
              </span>
            )}
          </div>

          {/* Archived Notice */}
          {ageGroup.isArchived && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                ⚠️ This age group is archived. No new training sessions can be scheduled while the age group is archived.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Viewing training sessions from all teams in this age group
          </p>
        </div>

        <TrainingSessionsListContent
          sessions={ageGroupSessions}
          clubId={clubId!}
          ageGroupId={ageGroupId!}
        />
      </main>
    </div>
  );
}
