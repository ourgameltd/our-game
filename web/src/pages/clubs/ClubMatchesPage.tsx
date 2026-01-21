import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { sampleMatches } from '@/data/matches';
import { sampleClubs } from '@/data/clubs';
// import { getAgeGroupById } from '@/data/ageGroups';
import type { TeamListItemDto } from '@/api';
import PageTitle from '@components/common/PageTitle';
import MatchesListContent from '@/components/matches/MatchesListContent';

export default function ClubMatchesPage() {
  const { clubId } = useParams();
  
  const club = sampleClubs.find(c => c.id === clubId);
  
  // Fetch teams from API
  const [clubTeams] = useState<TeamListItemDto[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;
    
    setTeamsLoading(true);
    // TODO: Re-enable when clubs.getTeams endpoint is implemented
    // apiClient.clubs.getTeams(clubId, undefined, false)
    //   .then((response: any) => {
    //     if (response.success && response.data) {
    //       setClubTeams(response.data);
    //     }
    //   })
    //   .catch((err: any) => {
    //     console.error('Failed to fetch teams:', err);
    //   })
    //   .finally(() => setTeamsLoading(false));
    setTeamsLoading(false);
  }, [clubId]);
  
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

  // Get team IDs from API data
  const clubTeamIds = clubTeams.map(t => t.id).filter(Boolean) as string[];

  // Filter matches for all teams in this club
  const clubMatches = sampleMatches.filter(m => m?.teamId && clubTeamIds.includes(m.teamId));

  const getTeamName = (teamId: string): string => {
    const team = clubTeams.find(t => t.id === teamId);
    if (!team) return 'Unknown Team';
    
    return `${team.ageGroupName || 'Unknown'} - ${team.name}`;
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

        {teamsLoading ? (
          <div className="card p-8 text-center text-gray-600 dark:text-gray-400">
            Loading teams...
          </div>
        ) : (
          <MatchesListContent
            matches={clubMatches}
            clubId={clubId!}
            showTeamInfo={true}
            getTeamName={getTeamName}
          />
        )}
      </main>
    </div>
  );
}
