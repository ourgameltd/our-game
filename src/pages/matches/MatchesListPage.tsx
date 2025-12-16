import { useParams } from 'react-router-dom';
import { sampleMatches } from '@/data/matches';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { Routes } from '@utils/routes';
import { getTeamNavigationTabs } from '@/utils/navigationHelpers';
import PageNavigation from '@/components/navigation/PageNavigation';
import PageTitle from '@components/common/PageTitle';
import MatchesListContent from '@/components/matches/MatchesListContent';

export default function MatchesListPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  
  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  
  if (!team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Team not found</h2>
          </div>
        </main>
      </div>
    );
  }

  // Filter matches for this team
  const teamMatches = sampleMatches.filter(m => m.teamId === teamId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getTeamNavigationTabs(clubId!, ageGroupId!, teamId!)} />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-grow">
              <PageTitle
                title="Matches"
                subtitle={`${team.name} - ${club.name}`}
                action={!team.isArchived ? {
                  label: '+ Add Match',
                  onClick: () => window.location.href = Routes.matchNew(clubId!, ageGroupId!, teamId!),
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
                ⚠️ This team is archived. New matches cannot be scheduled while the team is archived.
              </p>
            </div>
          )}
        </div>

        <MatchesListContent
          matches={teamMatches}
          clubId={clubId!}
          ageGroupId={ageGroupId!}
          showTeamInfo={false}
        />
      </main>
    </div>
  );
}
