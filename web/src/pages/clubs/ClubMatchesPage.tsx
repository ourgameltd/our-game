import { useParams } from 'react-router-dom';
import { sampleMatches } from '@/data/matches';
import { sampleClubs } from '@/data/clubs';
import { sampleTeams } from '@/data/teams';
import { getAgeGroupById } from '@/data/ageGroups';
import PageTitle from '@components/common/PageTitle';
import MatchesListContent from '@/components/matches/MatchesListContent';

export default function ClubMatchesPage() {
  const { clubId } = useParams();
  
  const club = sampleClubs.find(c => c.id === clubId);
  
  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Club not found</h2>
          </div>
        </main>
      </div>
    );
  }

  // Get all teams for this club
  const clubTeams = sampleTeams.filter(t => t.clubId === clubId);
  const clubTeamIds = clubTeams.map(t => t.id);

  // Filter matches for all teams in this club
  const clubMatches = sampleMatches.filter(m => clubTeamIds.includes(m.teamId));

  const getTeamName = (teamId: string): string => {
    const team = sampleTeams.find(t => t.id === teamId);
    if (!team) return 'Unknown Team';
    
    const ageGroup = getAgeGroupById(team.ageGroupId);
    return `${ageGroup?.name || 'Unknown'} - ${team.name}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <PageTitle
            title="All Matches"
            subtitle={`${club.name}`}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Viewing matches from all teams across the club
          </p>
        </div>

        <MatchesListContent
          matches={clubMatches}
          clubId={clubId!}
          showTeamInfo={true}
          getTeamName={getTeamName}
        />
      </main>
    </div>
  );
}
