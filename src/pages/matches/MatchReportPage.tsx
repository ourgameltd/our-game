import { useParams } from 'react-router-dom';
import { sampleMatches } from '@/data/matches';
import { samplePlayers } from '@/data/players';
import { sampleCoaches } from '@/data/coaches';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { getTeamNavigationTabs } from '@/utils/navigationHelpers';
import PageNavigation from '@/components/navigation/PageNavigation';
import MatchPreviewCard from '@/components/match/MatchPreviewCard';
import { Kit } from '@/types';

export default function MatchReportPage() {
  const { matchId, clubId, ageGroupId, teamId } = useParams();
  
  const match = sampleMatches.find(m => m.id === matchId);
  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  
  if (!match || !team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Match not found</h2>
          </div>
        </main>
      </div>
    );
  }
  
  const getPlayerName = (playerId: string) => {
    const player = samplePlayers.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown';
  };
  
  const getKitDetails = (kitId: string): Kit | undefined => {
    // Check team kits first
    const teamKit = team.kits?.find(k => k.id === kitId);
    if (teamKit) return teamKit;
    
    // Then check club kits
    const clubKit = club.kits?.find(k => k.id === kitId);
    if (clubKit) return clubKit;
    
    return undefined;
  };
  
  const isUpcoming = match.date > new Date();
  const homeTeam = match.isHome ? team.name : match.opposition;
  const awayTeam = match.isHome ? match.opposition : team.name;
  const isLocked = match.isLocked || false;
  
  const playerOfTheMatchId = match.report?.playerOfTheMatch;
  const playerOfTheMatch = playerOfTheMatchId 
    ? samplePlayers.find(p => p.id === playerOfTheMatchId) 
    : null;

  // Group cards by player
  const playerCards = match.report?.cards
    ?.reduce((acc, card) => {
      const playerId = card.playerId;
      if (!acc[playerId]) {
        acc[playerId] = [];
      }
      acc[playerId].push(card.type);
      return acc;
    }, {} as Record<string, ('yellow' | 'red')[]>) || {};

  // Group goals by player
  const playerGoals = match.report?.goalScorers
    ?.reduce((acc, goal) => {
      const playerId = goal.playerId;
      if (!acc[playerId]) {
        acc[playerId] = 0;
      }
      acc[playerId]++;
      return acc;
    }, {} as Record<string, number>) || {};

  // Group injuries by player
  const playerInjuries = match.report?.injuries
    ?.reduce((acc, injury) => {
      const playerId = injury.playerId;
      if (!acc[playerId]) {
        acc[playerId] = [];
      }
      acc[playerId].push(injury);
      return acc;
    }, {} as Record<string, any[]>) || {};

  const getPlayerById = (playerId: string) => {
    return samplePlayers.find(p => p.id === playerId);
  };

  const getRatingForPlayer = (playerId: string) => {
    return match.report?.performanceRatings?.find(r => r.playerId === playerId);
  };

  const getCardsForPlayer = (playerId: string) => {
    return playerCards[playerId] || [];
  };

  const getGoalsForPlayer = (playerId: string) => {
    return playerGoals[playerId] || 0;
  };

  const getInjuriesForPlayer = (playerId: string) => {
    return playerInjuries[playerId] || [];
  };

  // Get coaches for this match
  const matchCoaches = match.coachIds 
    ? sampleCoaches.filter(c => match.coachIds?.includes(c.id))
    : [];

  const roleDisplay: Record<string, string> = {
    'head-coach': 'Head Coach',
    'assistant-coach': 'Assistant Coach',
    'goalkeeper-coach': 'Goalkeeper Coach',
    'fitness-coach': 'Fitness Coach',
    'technical-coach': 'Technical Coach',
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getTeamNavigationTabs(clubId!, ageGroupId!, teamId!)} />

      <main className="container mx-auto px-4 py-8">     
        {/* Match Header - Using unified component */}
        <MatchPreviewCard 
          match={match}
          homeTeamName={homeTeam}
          awayTeamName={awayTeam}
          getKitDetails={getKitDetails}
          getPlayerName={getPlayerName}
          showFullDetails={false}
        />

        {/* Coaching Staff */}
        {matchCoaches.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span>👨‍🏫</span> Coaching Staff
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {matchCoaches.map((coach) => (
                <div key={coach.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {coach.photo ? (
                    <img 
                      src={coach.photo} 
                      alt={`${coach.firstName} ${coach.lastName}`}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {coach.firstName[0]}{coach.lastName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {coach.firstName} {coach.lastName}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {roleDisplay[coach.role]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Match Report Content (only for past matches) */}
        {!isUpcoming && match.report && (
          <>
            {/* Player of the Match */}
            {playerOfTheMatch && (
              <div className="card mt-6 mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⭐</span>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Player of the Match</h2>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  {playerOfTheMatch.photo && (
                    <img 
                      src={playerOfTheMatch.photo} 
                      alt={`${playerOfTheMatch.firstName} ${playerOfTheMatch.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                    />
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {playerOfTheMatch.firstName} {playerOfTheMatch.lastName}
                    </p>
                    {match.report?.performanceRatings?.find(r => r.playerId === playerOfTheMatchId) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Rating: {match.report?.performanceRatings?.find(r => r.playerId === playerOfTheMatchId)?.rating.toFixed(1)}/10
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lineup with Ratings */}
            {match.lineup && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Team Sheet & Player Ratings</h2>
                  
                  {/* Starting XI */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Starting XI</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {match.lineup.starting.map((player, index) => {
                        const playerData = getPlayerById(player.playerId);
                        const rating = getRatingForPlayer(player.playerId);
                        const isMotM = player.playerId === playerOfTheMatchId;
                        const cards = getCardsForPlayer(player.playerId);
                        const goals = getGoalsForPlayer(player.playerId);
                        const injuries = getInjuriesForPlayer(player.playerId);
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold min-w-[3rem] text-center">
                                {player.position}
                              </span>
                              {playerData?.photo && (
                                <img 
                                  src={playerData.photo} 
                                  alt={getPlayerName(player.playerId)}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {getPlayerName(player.playerId)}
                                </span>
                                {isMotM && (
                                  <span className="text-yellow-500" title="Player of the Match">⭐</span>
                                )}
                                {goals > 0 && (
                                  <span className="flex gap-0.5">
                                    {Array.from({ length: goals }).map((_, goalIndex) => (
                                      <span key={goalIndex} className="text-base" title={`${goals} Goal${goals > 1 ? 's' : ''}`}>
                                        ⚽
                                      </span>
                                    ))}
                                  </span>
                                )}
                                {cards.length > 0 && (
                                  <span className="flex gap-0.5">
                                    {cards.map((cardType, cardIndex) => (
                                      <span 
                                        key={cardIndex} 
                                        className={cardType === 'yellow' ? 'text-yellow-500' : 'text-red-500'}
                                        title={cardType === 'yellow' ? 'Yellow Card' : 'Red Card'}
                                      >
                                        {cardType === 'yellow' ? '🟨' : '🟥'}
                                      </span>
                                    ))}
                                  </span>
                                )}
                                {injuries.length > 0 && (
                                  <span className="flex gap-0.5">
                                    {injuries.map((injury, injuryIndex) => (
                                      <span 
                                        key={injuryIndex} 
                                        className="text-red-600"
                                        title={`Injury: ${injury.description}`}
                                      >
                                        🏥
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </div>
                            {rating && (
                              <div className="flex items-center gap-2 ml-2">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      rating.rating >= 8 ? 'bg-green-500' : 
                                      rating.rating >= 6 ? 'bg-blue-500' : 
                                      'bg-amber-500'
                                    }`}
                                    style={{ width: `${rating.rating * 10}%` }}
                                  />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white min-w-[2.5rem] text-right text-sm">
                                  {rating.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Substitutes */}
                  {match.lineup.substitutes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Substitutes</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {match.lineup.substitutes.map((playerId, index) => {
                          const playerData = getPlayerById(playerId);
                          const rating = getRatingForPlayer(playerId);
                          const isMotM = playerId === playerOfTheMatchId;
                          const cards = getCardsForPlayer(playerId);
                          const goals = getGoalsForPlayer(playerId);
                          const injuries = getInjuriesForPlayer(playerId);
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-3 flex-1">
                                {playerData?.photo && (
                                  <img 
                                    src={playerData.photo} 
                                    alt={getPlayerName(playerId)}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {getPlayerName(playerId)}
                                  </span>
                                  {isMotM && (
                                    <span className="text-yellow-500" title="Player of the Match">⭐</span>
                                  )}
                                  {goals > 0 && (
                                    <span className="flex gap-0.5">
                                      {Array.from({ length: goals }).map((_, goalIndex) => (
                                        <span key={goalIndex} className="text-base" title={`${goals} Goal${goals > 1 ? 's' : ''}`}>
                                          ⚽
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                  {cards.length > 0 && (
                                    <span className="flex gap-0.5">
                                      {cards.map((cardType, cardIndex) => (
                                        <span 
                                          key={cardIndex} 
                                          className={cardType === 'yellow' ? 'text-yellow-500' : 'text-red-500'}
                                          title={cardType === 'yellow' ? 'Yellow Card' : 'Red Card'}
                                        >
                                          {cardType === 'yellow' ? '🟨' : '🟥'}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                  {injuries.length > 0 && (
                                    <span className="flex gap-0.5">
                                      {injuries.map((injury, injuryIndex) => (
                                        <span 
                                          key={injuryIndex} 
                                          className="text-red-600"
                                          title={`Injury: ${injury.description}`}
                                        >
                                          🏥
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {rating && (
                                <div className="flex items-center gap-2 ml-2">
                                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        rating.rating >= 8 ? 'bg-green-500' : 
                                        rating.rating >= 6 ? 'bg-blue-500' : 
                                        'bg-amber-500'
                                      }`}
                                      style={{ width: `${rating.rating * 10}%` }}
                                    />
                                  </div>
                                  <span className="font-bold text-gray-900 dark:text-white min-w-[2.5rem] text-right text-sm">
                                    {rating.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="card mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Match Summary</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {match.report.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Lock Status Indicator */}
            {isLocked && (
              <div className="card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="text-amber-800 dark:text-amber-300 font-medium">
                      This match is locked
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Match data is locked and cannot be edited. Contact an administrator to unlock this match if changes are needed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
