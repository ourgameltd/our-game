import { GroupStatistics, Team } from '../types';
import { sampleMatches } from './matches';
import { samplePlayers } from './players';
import { getTeamsByAgeGroupId, getTeamsByClubId, sampleTeams } from './teams';

/**
 * Calculate statistics for a group of teams (Age Group or single Team)
 */
export const calculateGroupStatistics = (
  teamIds: string[],
  limit: number = 5
): GroupStatistics => {
  // Get all matches for these teams
  const matches = sampleMatches.filter(match => teamIds.includes(match.teamId));
  
  // Separate upcoming and completed matches
  const now = new Date();
  const upcomingMatches = matches
    .filter(m => m.status === 'scheduled' && new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
  
  const completedMatches = matches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const previousResults = completedMatches.slice(0, limit);
  
  // Calculate statistics from completed matches
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  
  completedMatches.forEach(match => {
    if (match.score) {
      const ourScore = match.isHome ? match.score.home : match.score.away;
      const theirScore = match.isHome ? match.score.away : match.score.home;
      
      goalsFor += ourScore;
      goalsAgainst += theirScore;
      
      if (ourScore > theirScore) wins++;
      else if (ourScore === theirScore) draws++;
      else losses++;
    }
  });
  
  const matchesPlayed = wins + draws + losses;
  const winRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;
  const goalDifference = goalsFor - goalsAgainst;
  
  // Calculate player performance ratings
  const playerRatings = new Map<string, { total: number; count: number }>();
  
  completedMatches.forEach(match => {
    if (match.report?.performanceRatings) {
      match.report.performanceRatings.forEach(rating => {
        const current = playerRatings.get(rating.playerId) || { total: 0, count: 0 };
        playerRatings.set(rating.playerId, {
          total: current.total + rating.rating,
          count: current.count + 1
        });
      });
    }
  });
  
  // Calculate averages and sort
  const playerPerformances = Array.from(playerRatings.entries())
    .map(([playerId, stats]) => ({
      playerId,
      averageRating: stats.total / stats.count,
      matchesPlayed: stats.count
    }))
    .filter(p => p.matchesPlayed >= 3); // Only players with 3+ matches
  
  playerPerformances.sort((a, b) => b.averageRating - a.averageRating);
  
  const topPerformers = playerPerformances.slice(0, limit);
  const underperforming = playerPerformances
    .filter(p => p.averageRating < 6.0) // Below 6.0 average
    .slice(0, limit);
  
  // Count unique players across teams (now using age groups)
  const playerIds = new Set<string>();
  teamIds.forEach(teamId => {
    const team = sampleTeams.find(t => t.id === teamId);
    if (team) {
      const teamPlayers = samplePlayers.filter(p => p.ageGroupIds.includes(team.ageGroupId) && !p.isArchived);
      teamPlayers.forEach(p => playerIds.add(p.id));
    }
  });
  
  return {
    goalDifference,
    playerCount: playerIds.size,
    matchesPlayed,
    wins,
    draws,
    losses,
    winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
    upcomingMatches,
    previousResults,
    topPerformers,
    underperforming
  };
};

/**
 * Get statistics for a specific age group
 */
export const getAgeGroupStatistics = (ageGroupId: string): GroupStatistics => {
  const teams = getTeamsByAgeGroupId(ageGroupId);
  const teamIds = teams.map((t: Team) => t.id);
  return calculateGroupStatistics(teamIds);
};

/**
 * Get statistics for a specific team
 */
export const getTeamStatistics = (teamId: string): GroupStatistics => {
  return calculateGroupStatistics([teamId]);
};

/**
 * Get statistics for a club (all teams)
 */
export const getClubStatistics = (clubId: string): GroupStatistics => {
  const teams = getTeamsByClubId(clubId);
  const teamIds = teams.map((t: Team) => t.id);
  return calculateGroupStatistics(teamIds);
};
