import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAgeGroupById } from '../../data/ageGroups';
import { getTeamsByAgeGroupId, getTeamById } from '../../data/teams';
import { getAgeGroupStatistics } from '../../data/statistics';
import { samplePlayers } from '../../data/players';
import StatsGrid from '../../components/stats/StatsGrid';
import UpcomingMatchesCard from '../../components/matches/UpcomingMatchesCard';
import PreviousResultsCard from '../../components/matches/PreviousResultsCard';
import TopPerformersCard from '../../components/players/TopPerformersCard';
import NeedsSupportCard from '../../components/players/NeedsSupportCard';
import TeamCard from '../../components/team/TeamCard';
import PageNavigation from '../../components/navigation/PageNavigation';
import { getAgeGroupNavigationTabs } from '../../utils/navigationHelpers';
import { Routes } from '@utils/routes';

const AgeGroupOverviewPage: React.FC = () => {
  const { clubId, ageGroupId } = useParams<{ clubId: string; ageGroupId: string }>();
  const navigate = useNavigate();
  
  const ageGroup = getAgeGroupById(ageGroupId || '');
  const teams = getTeamsByAgeGroupId(ageGroupId || '');
  const stats = getAgeGroupStatistics(ageGroupId || '');
  
  if (!ageGroup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Age group not found</p>
      </div>
    );
  }
  
  // Get top performers details
  const topPerformersData = stats.topPerformers.map(perf => {
    const player = samplePlayers.find(p => p.id === perf.playerId);
    return { ...perf, player };
  }).filter(p => p.player);
  
  // Get underperforming players details
  const underperformingData = stats.underperforming.map(perf => {
    const player = samplePlayers.find(p => p.id === perf.playerId);
    return { ...perf, player };
  }).filter(p => p.player);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getAgeGroupNavigationTabs(clubId!, ageGroupId!)} />

      <main className="container mx-auto px-4 py-8">
        {/* Header with Settings Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{ageGroup.name}</h2>
              {ageGroup.isArchived && (
                <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                  🗄️ Archived
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{ageGroup.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Season: {ageGroup.season}</p>
          </div>
          <button
            onClick={() => navigate(Routes.ageGroupSettings(clubId!, ageGroupId!))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>⚙️</span>
            Settings
          </button>
        </div>

        {/* Archived Notice */}
        {ageGroup.isArchived && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ This age group is archived. No new teams can be added and modifications are restricted. Go to Settings to unarchive.
            </p>
          </div>
        )}

        {/* Statistics Cards */}
        <StatsGrid stats={stats} />

        {/* Teams Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Teams</h3>
            {!ageGroup.isArchived && (
              <Link
                to={Routes.teamNew(clubId!, ageGroupId!)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <span>+</span>
                Add Team
              </Link>
            )}
          </div>
          
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onClick={team.isArchived ? undefined : () => navigate(Routes.team(clubId!, ageGroupId!, team.id))}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No teams yet in this age group</p>
              {!ageGroup.isArchived && (
                <Link
                  to={Routes.teamNew(clubId!, ageGroupId!)}
                  className="inline-flex px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create First Team
                </Link>
              )}
            </div>
          )}
        </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <UpcomingMatchesCard 
          matches={stats.upcomingMatches} 
          viewAllLink={Routes.ageGroup(clubId!, ageGroupId!)}
          showTeamInfo={true}
          getTeamInfo={(match) => {
            const team = getTeamById(match.teamId);
            if (team) {
              return {
                teamName: team.name,
                ageGroupName: ageGroup.name
              };
            }
            return null;
          }}
          getMatchLink={(matchId) => {
            const match = stats.upcomingMatches.find(m => m.id === matchId);
            if (match) {
              return Routes.matchReport(clubId!, ageGroupId!, match.teamId, matchId);
            }
            return '#';
          }}
        />
        <PreviousResultsCard 
          matches={stats.previousResults}
          showTeamInfo={true}
          getTeamInfo={(match) => {
            const team = getTeamById(match.teamId);
            if (team) {
              return {
                teamName: team.name,
                ageGroupName: ageGroup.name
              };
            }
            return null;
          }}
          getMatchLink={(matchId, match) => {
            return Routes.matchReport(clubId!, ageGroupId!, match.teamId, matchId);
          }}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <TopPerformersCard 
          performers={topPerformersData.map(p => ({
            playerId: p.playerId,
            firstName: p.player?.firstName || '',
            lastName: p.player?.lastName || '',
            averageRating: p.averageRating,
            matchesPlayed: p.matchesPlayed
          }))}
          getPlayerLink={(playerId) => {
            const player = samplePlayers.find(p => p.id === playerId);
            if (player && player.teamIds.length > 0) {
              const team = teams.find(t => player.teamIds.includes(t.id));
              if (team) {
                return Routes.player(clubId!, team.ageGroupId, team.id, playerId);
              }
            }
            return '#';
          }}
        />
        <NeedsSupportCard 
          performers={underperformingData.map(p => ({
            playerId: p.playerId,
            firstName: p.player?.firstName || '',
            lastName: p.player?.lastName || '',
            averageRating: p.averageRating,
            matchesPlayed: p.matchesPlayed
          }))}
          getPlayerLink={(playerId) => {
            const player = samplePlayers.find(p => p.id === playerId);
            if (player && player.teamIds.length > 0) {
              const team = teams.find(t => player.teamIds.includes(t.id));
              if (team) {
                return Routes.player(clubId!, team.ageGroupId, team.id, playerId);
              }
            }
            return '#';
          }}
        />
      </div>
      </main>
    </div>
  );
};

export default AgeGroupOverviewPage;
