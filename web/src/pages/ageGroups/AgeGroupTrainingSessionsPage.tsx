import { useParams } from 'react-router-dom';
import { useClub } from '@/api/hooks';
import { useClubTrainingSessions } from '@/api/hooks';
import { useAgeGroup } from '@/api/hooks';
import PageTitle from '@components/common/PageTitle';
import TrainingSessionsListContent from '@/components/training/TrainingSessionsListContent';

export default function AgeGroupTrainingSessionsPage() {
  const { clubId, ageGroupId } = useParams();
  
  const { data: club, isLoading: clubLoading, error: clubError } = useClub(clubId);
  const { data: ageGroup, isLoading: ageGroupLoading, error: ageGroupError } = useAgeGroup(ageGroupId);
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useClubTrainingSessions(
    clubId,
    { ageGroupId, status: undefined } // No status filter - fetch all sessions
  );

  const isLoading = clubLoading || ageGroupLoading || sessionsLoading;
  const error = clubError || ageGroupError || sessionsError;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
              Error loading training sessions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!club || !ageGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
              </div>
            ) : (
              <h2 className="text-xl font-semibold mb-4">
                {!club ? 'Club not found' : 'Age group not found'}
              </h2>
            )}
          </div>
        </main>
      </div>
    );
  }

  const sessions = sessionsData?.sessions || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {sessionsLoading ? (
          <div className="card">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <TrainingSessionsListContent
            sessions={sessions}
            clubId={clubId!}
            ageGroupId={ageGroupId!}
          />
        )}
      </main>
    </div>
  );
}
