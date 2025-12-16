import { Match, Kit } from '@/types';

interface MatchPreviewCardProps {
  match: Match;
  homeTeamName?: string;
  awayTeamName?: string;
  getKitDetails?: (kitId: string) => Kit | undefined;
  showFullDetails?: boolean; // When true, shows more comprehensive details
  getPlayerName?: (playerId: string) => string; // Function to get player names
}

export default function MatchPreviewCard({ 
  match, 
  homeTeamName = 'Vale FC',
  awayTeamName,
  getKitDetails,
  showFullDetails = true,
  getPlayerName = (id) => id // Default fallback
}: MatchPreviewCardProps) {
  const isUpcoming = !match.score;
  const displayAwayTeam = awayTeamName || match.opposition;
  
  // Group goal scorers by player name for our team
  const ourTeamGoalScorers = match.report?.goalScorers?.reduce((acc, goal) => {
    const playerName = getPlayerName(goal.playerId);
    if (!acc[playerName]) {
      acc[playerName] = 0;
    }
    acc[playerName]++;
    return acc;
  }, {} as Record<string, number>) || {};
  
  // Determine the title based on match state
  const getTitle = () => {
    if (match.status === 'cancelled') return 'Match Cancelled';
    if (match.status === 'in-progress') return 'Match In Progress';
    if (isUpcoming) return 'Upcoming Match';
    return 'Match Details';
  };
  
  // Get kit details if available
  const primaryKit = match.kit?.primary && getKitDetails 
    ? getKitDetails(match.kit.primary) 
    : undefined;
  const goalkeeperKit = match.kit?.goalkeeper && getKitDetails 
    ? getKitDetails(match.kit.goalkeeper) 
    : undefined;

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {getTitle()}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {match.competition}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            match.isHome 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
          }`}>
            {match.isHome ? 'Home' : 'Away'}
          </span>
        </div>
      </div>
      
      {/* Teams Display */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        {/* Team Names and Score - Always Aligned */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {homeTeamName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Home
            </div>
          </div>

          <div className="px-6">
            {match.score ? (
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {match.isHome ? match.score.home : match.score.away}
                {' - '}
                {match.isHome ? match.score.away : match.score.home}
              </div>
            ) : (
              <div className="text-3xl font-bold text-gray-400 dark:text-gray-500">
                vs
              </div>
            )}
          </div>

          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {displayAwayTeam}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Away
            </div>
          </div>
        </div>

        {/* Goal Scorers, Cards, and Injuries - Below Team Names */}
        {!isUpcoming && match.report && (
          <div className="flex justify-between">
            {/* Home Team Stats (when it's our team) */}
            <div className="text-center flex-1">
              {match.isHome && (
                <div className="space-y-1">
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
                    <>
                      {match.report.cards.map((card, index) => (
                        <div key={index} className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{getPlayerName(card.playerId)}</span>
                          <span className={card.type === 'yellow' ? 'text-yellow-500' : 'text-red-500'}>
                            {card.type === 'yellow' ? '🟨' : '🟥'}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                  {/* Injuries */}
                  {match.report.injuries && match.report.injuries.length > 0 && (
                    <>
                      {match.report.injuries.map((injury, index) => (
                        <div key={index} className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{getPlayerName(injury.playerId)}</span>
                          <span className="text-red-600" title={injury.description}>🏥</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Spacer for score */}
            <div className="px-6"></div>

            {/* Away Team Stats (when it's our team) */}
            <div className="text-center flex-1">
              {!match.isHome && (
                <div className="space-y-1">
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
                    <>
                      {match.report.cards.map((card, index) => (
                        <div key={index} className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{getPlayerName(card.playerId)}</span>
                          <span className={card.type === 'yellow' ? 'text-yellow-500' : 'text-red-500'}>
                            {card.type === 'yellow' ? '🟨' : '🟥'}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                  {/* Injuries */}
                  {match.report.injuries && match.report.injuries.length > 0 && (
                    <>
                      {match.report.injuries.map((injury, index) => (
                        <div key={index} className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{getPlayerName(injury.playerId)}</span>
                          <span className="text-red-600" title={injury.description}>🏥</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Kit Display */}
      {primaryKit && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Kit to Wear</h3>
          <div className="flex flex-row items-start gap-6">
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {primaryKit.name}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: primaryKit.shirtColor }}
                    title={`Shirt: ${primaryKit.shirtColor}`}
                  />
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: primaryKit.shortsColor }}
                    title={`Shorts: ${primaryKit.shortsColor}`}
                  />
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: primaryKit.socksColor }}
                    title={`Socks: ${primaryKit.socksColor}`}
                  />
                </div>
              </div>
            </div>
            
            {goalkeeperKit && (
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {goalkeeperKit.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: goalkeeperKit.shirtColor }}
                      title={`Shirt: ${goalkeeperKit.shirtColor}`}
                    />
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: goalkeeperKit.shortsColor }}
                      title={`Shorts: ${goalkeeperKit.shortsColor}`}
                    />
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: goalkeeperKit.socksColor }}
                      title={`Socks: ${goalkeeperKit.socksColor}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {isUpcoming ? 'Kick Off' : 'Date & Time'}
          </h3>
          <p className="text-gray-900 dark:text-white font-medium">
            {match.date.toLocaleDateString('en-GB', { 
              weekday: showFullDetails ? 'long' : 'short', 
              year: 'numeric', 
              month: showFullDetails ? 'long' : 'short', 
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
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Venue</h3>
          <p className="text-gray-900 dark:text-white">
            📍 {match.location}
          </p>
          {showFullDetails && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {match.isHome ? 'Home' : 'Away'}
            </p>
          )}
        </div>
        
        {showFullDetails && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Competition</h3>
            <p className="text-gray-900 dark:text-white">
              {match.competition}
            </p>
          </div>
        )}

        {match.weather && showFullDetails && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Weather</h3>
            <p className="text-gray-900 dark:text-white">
              {match.weather.condition}, {match.weather.temperature}°C
            </p>
          </div>
        )}
      </div>
      
      {isUpcoming && showFullDetails && (
        <p className="text-gray-600 dark:text-gray-400 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center italic">
          Match report will be available after the game.
        </p>
      )}
    </div>
  );
}
