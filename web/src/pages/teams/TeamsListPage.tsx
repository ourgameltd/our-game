import { useParams, useNavigate } from 'react-router-dom';
import { useClubById, useAgeGroupById, useTeamsByAgeGroupId } from '@/api/hooks';
import TeamListCard from '@components/team/TeamListCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { Team, Club, AgeGroup, SquadSize } from '@/types';

export default function TeamsListPage() {
  const { clubId, ageGroupId } = useParams();
  const navigate = useNavigate();
  
  // Fetch data from API
  const { data: club, isLoading: clubLoading, error: clubError } = useClubById(clubId);
  const { data: ageGroup, isLoading: ageGroupLoading, error: ageGroupError } = useAgeGroupById(ageGroupId);
  const { data: teamsData, isLoading: teamsLoading, error: teamsError } = useTeamsByAgeGroupId(ageGroupId);

  // Critical data errors (club or age group not found)
  if (clubError && !clubLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Club Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {clubError.message || 'The requested club could not be found.'}
          </p>
          <button
            onClick={() => navigate(Routes.dashboard())}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (ageGroupError && !ageGroupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Age Group Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {ageGroupError.message || 'The requested age group could not be found.'}
          </p>
          <button
            onClick={() => navigate(Routes.club(clubId!))}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Club
          </button>
        </div>
      </div>
    );
  }

  // Map API DTOs to component types
  const clubMapped: Club | null = club ? {
    id: club.id || '',
    name: club.name || '',
    shortName: club.shortName || '',
    logo: club.logo || '',
    colors: {
      primary: club.colors.primary || '',
      secondary: club.colors.secondary || '',
      accent: club.colors.accent || ''
    },
    founded: club.founded || 0,
    location: {
      city: club.location.city || '',
      country: club.location.country || '',
      venue: club.location.venue || '',
      address: club.location.address
    },
    history: club.history,
    ethos: club.ethos,
    principles: club.principles || []
  } : null;

  const ageGroupMapped: AgeGroup | null = ageGroup ? {
    id: ageGroup.id || '',
    clubId: ageGroup.clubId || '',
    name: ageGroup.name || '',
    code: ageGroup.code || '',
    level: ageGroup.level as 'youth' | 'amateur' | 'reserve' | 'senior',
    season: ageGroup.season || '',
    seasons: ageGroup.seasons || [],
    defaultSeason: ageGroup.defaultSeason,
    defaultSquadSize: ageGroup.defaultSquadSize as SquadSize,
    description: ageGroup.description,
    isArchived: ageGroup.isArchived || false
  } : null;

  const teamsMapped: Team[] = teamsData?.map(team => ({
    id: team.id,
    clubId: team.clubId,
    ageGroupId: team.ageGroupId,
    name: team.name,
    shortName: team.shortName,
    level: team.level as 'youth' | 'amateur' | 'reserve' | 'senior',
    season: team.season,
    colors: {
      primary: team.colors.primary || '',
      secondary: team.colors.secondary || ''
    },
    isArchived: team.isArchived,
    playerIds: [],
    coachIds: []
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Title Section with Skeleton */}
        {clubLoading || ageGroupLoading ? (
          <div className="mb-6 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-5 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : ageGroupMapped ? (
          <>
            <PageTitle
              title={`${ageGroupMapped.name} Teams`}
              subtitle={ageGroupMapped.description}
            />
            {(clubError || ageGroupError) && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Warning: Some data could not be loaded
                </p>
                <p className="text-yellow-600 dark:text-yellow-300 text-sm mt-1">
                  {clubError?.message || ageGroupError?.message}
                </p>
              </div>
            )}
          </>
        ) : null}

        {/* Teams List Section with Skeleton */}
        {teamsLoading ? (
          <div className="flex flex-col gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-6 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="hidden md:flex gap-4">
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : teamsError ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 font-medium">
                  Failed to load teams
                </p>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  {teamsError.message || 'An error occurred while fetching teams.'}
                </p>
              </div>
            </div>
          </div>
        ) : teamsMapped.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No teams found for this age group.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {teamsMapped.map((team) => {
              const teamData = teamsData?.find(t => t.id === team.id);
              return (
                <TeamListCard
                  key={team.id}
                  team={team}
                  club={clubMapped!}
                  ageGroup={ageGroupMapped || undefined}
                  stats={{
                    playerCount: teamData?.stats.playerCount || 0,
                    coachCount: teamData?.stats.coachCount || 0,
                    matchesPlayed: teamData?.stats.matchesPlayed || 0,
                    wins: teamData?.stats.wins || 0,
                    draws: teamData?.stats.draws || 0,
                    losses: teamData?.stats.losses || 0,
                    winRate: teamData?.stats.winRate || 0,
                    goalDifference: teamData?.stats.goalDifference || 0
                  }}
                  onClick={team.isArchived ? undefined : () => navigate(Routes.team(clubId!, ageGroupId!, team.id))}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
