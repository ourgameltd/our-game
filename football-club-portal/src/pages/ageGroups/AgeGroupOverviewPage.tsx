import React from 'react';
import { useParams } from 'react-router-dom';
import { getAgeGroupById } from '../../data/ageGroups';
import { getTeamsByAgeGroupId, getTeamById } from '../../data/teams';
import { getAgeGroupStatistics } from '../../data/statistics';
import { samplePlayers } from '../../data/players';
import StatsGrid from '../../components/stats/StatsGrid';
import UpcomingMatchesCard from '../../components/matches/UpcomingMatchesCard';
import PreviousResultsCard from '../../components/matches/PreviousResultsCard';
import TopPerformersCard from '../../components/players/TopPerformersCard';
import NeedsSupportCard from '../../components/players/NeedsSupportCard';
import PageNavigation from '../../components/navigation/PageNavigation';
import { getAgeGroupNavigationTabs } from '../../utils/navigationHelpers';
import { Routes } from '@utils/routes';

const AgeGroupOverviewPage: React.FC = () => {
  const { clubId, ageGroupId } = useParams<{ clubId: string; ageGroupId: string }>();
  
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
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{ageGroup.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">{ageGroup.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Season: {ageGroup.season}</p>
        </div>

        {/* Statistics Cards */}
        <StatsGrid stats={stats} />

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
