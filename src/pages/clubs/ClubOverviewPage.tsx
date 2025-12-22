import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getClubById } from '@data/clubs';
import { getAgeGroupsByClubId, getAgeGroupById } from '@data/ageGroups';
import { getClubStatistics, getAgeGroupStatistics } from '@data/statistics';
import { getTeamById, getTeamsByAgeGroupId } from '@data/teams';
import StatsGrid from '@components/stats/StatsGrid';
import UpcomingMatchesCard from '@components/matches/UpcomingMatchesCard';
import PreviousResultsCard from '@components/matches/PreviousResultsCard';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { getGradientColors, getContrastTextColorClass } from '@utils/colorHelpers';

export default function ClubOverviewPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const club = getClubById(clubId!);
  const ageGroups = getAgeGroupsByClubId(clubId!)
    .filter(ag => !ag.isArchived)
    .sort((a, b) => a.name.localeCompare(b.name));
  const stats = getClubStatistics(clubId!);

  if (!club) {
    return <div>Club not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title={club.name}
          subtitle="Club Overview"
          action={{
            label: 'Settings',
            icon: 'settings',
            title: 'Settings',
            onClick: () => navigate(Routes.clubSettings(clubId!)),
            variant: 'primary'
          }}
        />

        {/* Stats Overview */}
        <StatsGrid 
          stats={stats} 
          onPlayerCountClick={() => navigate(Routes.clubPlayers(clubId!))}
          additionalInfo={`${ageGroups.length} age groups`}
        />

        {/* Age Groups Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Age Groups</h3>
            <Link
              to={Routes.ageGroupNew(clubId!)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
          
          {ageGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ageGroups.map(ageGroup => {
                const ageGroupStats = getAgeGroupStatistics(ageGroup.id);
                const ageGroupTeams = getTeamsByAgeGroupId(ageGroup.id);
                const { primaryColor, secondaryColor } = getGradientColors(club);
                const textColorClass = getContrastTextColorClass(primaryColor);
                
                return (
                  <div
                    key={ageGroup.id}
                    className={`overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col ${
                      !ageGroup.isArchived ? 'cursor-pointer' : ''
                    } ${
                      ageGroup.isArchived ? 'opacity-75 border-2 border-orange-200 dark:border-orange-800' : ''
                    }`}
                    onClick={ageGroup.isArchived ? undefined : () => navigate(Routes.ageGroup(clubId!, ageGroup.id))}
                  >
                    {/* Gradient Header */}
                    <div 
                      className="p-4 flex-shrink-0"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-lg font-semibold ${textColorClass}`}>
                            {ageGroup.name}
                          </h3>
                          {ageGroup.isArchived && (
                            <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs">
                              🗄️ Archived
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm opacity-90 ${textColorClass} mt-1`}>{ageGroup.description}</p>
                    </div>

                    {/* Card Content */}
                    <div className="bg-white dark:bg-gray-800 p-4 flex-grow">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{ageGroupTeams.length}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Teams</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{ageGroupStats.playerCount}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Players</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{ageGroupStats.winRate}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Win Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No age groups yet in this club</p>
              <Link
                to={Routes.ageGroupNew(clubId!)}
                className="inline-flex px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create First Age Group
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <UpcomingMatchesCard 
            matches={stats.upcomingMatches.slice(0, 3)}
            viewAllLink={Routes.club(clubId!)}
            showTeamInfo={true}
            getTeamInfo={(match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                const ageGroup = getAgeGroupById(team.ageGroupId);
                return {
                  teamName: team.name,
                  ageGroupName: ageGroup?.name || 'Unknown'
                };
              }
              return null;
            }}
            getMatchLink={(matchId) => {
              const match = stats.upcomingMatches.find(m => m.id === matchId);
              if (match) {
                const team = getTeamById(match.teamId);
                if (team) {
                  return Routes.matchReport(clubId!, team.ageGroupId, match.teamId, matchId);
                }
              }
              return '#';
            }}
          />
          <PreviousResultsCard 
            matches={stats.previousResults.slice(0, 3)}
            viewAllLink={Routes.clubMatches(clubId!)}
            showTeamInfo={true}
            getTeamInfo={(match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                const ageGroup = getAgeGroupById(team.ageGroupId);
                return {
                  teamName: team.name,
                  ageGroupName: ageGroup?.name || 'Unknown'
                };
              }
              return null;
            }}
            getMatchLink={(matchId, match) => {
              const team = getTeamById(match.teamId);
              if (team) {
                return Routes.matchReport(clubId!, team.ageGroupId, match.teamId, matchId);
              }
              return '#';
            }}
          />
        </div>
      </main>
    </div>
  );
}
