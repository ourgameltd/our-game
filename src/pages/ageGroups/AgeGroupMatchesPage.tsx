import { useParams, useNavigate } from 'react-router-dom';
import { sampleMatches } from '@/data/matches';
import { sampleClubs } from '@/data/clubs';
import { sampleTeams } from '@/data/teams';
import { getAgeGroupById } from '@/data/ageGroups';
import { Routes } from '@utils/routes';
import { getAgeGroupNavigationTabs } from '@/utils/navigationHelpers';
import PageNavigation from '@/components/navigation/PageNavigation';
import PageTitle from '@components/common/PageTitle';
import MatchesListContent from '@/components/matches/MatchesListContent';

export default function AgeGroupMatchesPage() {
  const { clubId, ageGroupId } = useParams();
  const navigate = useNavigate();
  
  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroup = getAgeGroupById(ageGroupId!);
  
  if (!club || !ageGroup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
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

  // Filter matches for all teams in this age group
  const ageGroupMatches = sampleMatches.filter(m => ageGroupTeamIds.includes(m.teamId));

  const getTeamName = (teamId: string): string => {
    const team = sampleTeams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getAgeGroupNavigationTabs(clubId!, ageGroupId!)} />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-grow">
              <PageTitle
                title="All Matches"
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
                ⚠️ This age group is archived. No new matches can be scheduled while the age group is archived.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Viewing matches from all teams in this age group
          </p>
        </div>

        <MatchesListContent
          matches={ageGroupMatches}
          clubId={clubId!}
          ageGroupId={ageGroupId!}
          showTeamInfo={true}
          getTeamName={getTeamName}
        />
      </main>
    </div>
  );
}
