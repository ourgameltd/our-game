import { useParams } from 'react-router-dom';
import { sampleMatches } from '@/data/matches';
import { samplePlayers } from '@/data/players';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { getTeamNavigationTabs } from '@/utils/navigationHelpers';
import PageNavigation from '@/components/navigation/PageNavigation';

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
  
  const getKitName = (kitId: string) => {
    // Check team kits first
    const teamKit = team.kits?.find(k => k.id === kitId);
    if (teamKit) return teamKit.name;
    
    // Then check club kits
    const clubKit = club.kits?.find(k => k.id === kitId);
    if (clubKit) return clubKit.name;
    
    // Fallback to ID if not found
    return kitId;
  };
  
  const isUpcoming = match.date > new Date();
  const homeTeam = match.isHome ? team.name : match.opposition;
  const awayTeam = match.isHome ? match.opposition : team.name;
  const homeScore = match.isHome ? match.score?.home : match.score?.away;
  const awayScore = match.isHome ? match.score?.away : match.score?.home;
  
  const playerOfTheMatchId = match.report?.playerOfTheMatch;
  const playerOfTheMatch = playerOfTheMatchId 
    ? samplePlayers.find(p => p.id === playerOfTheMatchId) 
    : null;
  
  // Group goal scorers by team (our team's goals)
  const ourTeamGoalScorers = match.report?.goalScorers
    ?.reduce((acc, goal) => {
      const playerName = getPlayerName(goal.playerId);
      if (!acc[playerName]) {
        acc[playerName] = 0;
      }
      acc[playerName]++;
      return acc;
    }, {} as Record<string, number>) || {};

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
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <PageNavigation tabs={getTeamNavigationTabs(clubId!, ageGroupId!, teamId!)} />

      <main className="container mx-auto px-4 py-8">     
        {/* Match Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {isUpcoming ? 'Upcoming Match' : 'Match Report'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {match.competition}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {match.isHome ? 'Home' : 'Away'}
              </span>
            </div>
          </div>
          
          {/* Score Display */}
          <div className="grid grid-cols-3 gap-4 items-start text-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{homeTeam}</h3>
              {!isUpcoming && match.report && match.isHome && (
                <div className="space-y-1 mt-3">
                  {/* Goal Scorers */}
                  {Object.keys(ourTeamGoalScorers).length > 0 && Object.entries(ourTeamGoalScorers).map(([playerName, goals]) => (
                    <div key={playerName} className="flex items-center justify-center gap-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{playerName}</span>
                      <span className="flex gap-0.5">
                        {Array.from({ length: goals as number }).map((_, i) => (
                          <span key={i} className="text-base">⚽</span>
                        ))}
                      </span>
                    </div>
                  ))}
                  {/* Cards */}
                  {match.report.cards && match.report.cards.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {match.report.cards.map((card, index) => (
                        <div key={index} className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{getPlayerName(card.playerId)}</span>
                          <span className={card.type === 'yellow' ? 'text-yellow-500' : 'text-red-500'}>
                            {card.type === 'yellow' ? '🟨' : '🟥'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-4">
              {!isUpcoming && match.score ? (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {homeScore} - {awayScore}
                </div>
              ) : (
                <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                  VS
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{awayTeam}</h3>
              {!isUpcoming && match.report && !match.isHome && (
                <div className="space-y-1 mt-3">
                  {/* Goal Scorers */}
                  {Object.keys(ourTeamGoalScorers).length > 0 && Object.entries(ourTeamGoalScorers).map(([playerName, goals]) => (
                    <div key={playerName} className="flex items-center justify-center gap-1 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{playerName}</span>
                      <span className="flex gap-0.5">
                        {Array.from({ length: goals as number }).map((_, i) => (
                          <span key={i} className="text-base">⚽</span>
                        ))}
                      </span>
                    </div>
                  ))}
                  {/* Cards */}
                  {match.report.cards && match.report.cards.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {match.report.cards.map((card, index) => (
                        <div key={index} className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{getPlayerName(card.playerId)}</span>
                          <span className={card.type === 'yellow' ? 'text-yellow-500' : 'text-red-500'}>
                            {card.type === 'yellow' ? '🟨' : '🟥'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Match Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</h3>
              <p className="text-sm text-gray-900 dark:text-white">
                {match.date.toLocaleDateString('en-GB', { 
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Kick Off</h3>
              <p className="text-sm text-gray-900 dark:text-white">
                {match.date.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
              <p className="text-sm text-gray-900 dark:text-white">
                📍 {match.location}
              </p>
            </div>
            {match.kit && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Kit</h3>
                <p className="text-sm text-gray-900 dark:text-white">
                  👕 {getKitName(match.kit.primary)}
                </p>
                {match.kit.goalkeeper && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    🧤 GK: {getKitName(match.kit.goalkeeper)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Match Report Content (only for past matches) */}
        {!isUpcoming && match.report && (
          <>
            {/* Player of the Match */}
            {playerOfTheMatch && (
              <div className="card mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
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
              <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                      <div className="grid grid-cols-1gap-3">
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
          </>
        )}
        
        {/* Upcoming Match Info */}
        {isUpcoming && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Match Preview</h2>
            
            {/* Match Details Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Kick Off</h3>
                <p className="text-gray-900 dark:text-white font-medium">
                  {match.date.toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {match.date.toLocaleTimeString('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              {match.meetTime && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Meet Time</h3>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {match.meetTime.toLocaleTimeString('en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Team assembles before kick off
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
                <p className="text-gray-900 dark:text-white">
                  📍 {match.location}
                </p>
              </div>
              
              {match.kit && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Kit</h3>
                  <p className="text-gray-900 dark:text-white">
                    👕 {getKitName(match.kit.primary)}
                  </p>
                  {match.kit.goalkeeper && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      🧤 GK: {getKitName(match.kit.goalkeeper)}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              Match report will be available after the game.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
