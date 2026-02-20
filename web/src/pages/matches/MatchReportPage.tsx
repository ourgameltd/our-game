import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useMatchReport } from '@/api/hooks';
import { useNavigation } from '@/contexts/NavigationContext';
import { coachRoleDisplay } from '@/constants/coachRoleDisplay';
import { Routes } from '@/utils/routes';

export default function MatchReportPage() {
  const { matchId, clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();
  const { data: match, isLoading, error } = useMatchReport(matchId);
  const { setEntityName } = useNavigation();

  // Populate navigation context once data loads
  useEffect(() => {
    if (match) {
      setEntityName('team', match.teamId, match.teamName);
      setEntityName('club', match.clubId, match.clubName);
      if (match.ageGroupId) {
        setEntityName('ageGroup', match.ageGroupId, match.ageGroupName);
      }
    }
  }, [match?.teamId, match?.teamName, match?.clubId, match?.clubName, match?.ageGroupId, match?.ageGroupName, setEntityName]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Error Loading Match</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {(error as any).statusCode === 404 
                ? 'Match not found. It may have been deleted or you do not have permission to view it.'
                : error.message || 'An error occurred while loading the match report.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Loading state with skeletons
  if (isLoading || !match) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          {/* Action Button Skeleton */}
          <div className="flex justify-end gap-3 mb-4">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Match Header Skeleton */}
          <div className="card mb-4">
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="flex gap-4 mb-4">
              <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-20 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Coaching Staff Skeleton */}
          <div className="card mb-4">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Skeleton */}
          <div className="card mb-4">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isUpcoming = new Date(match.matchDate) > new Date();
  const homeTeam = match.isHome ? match.teamName : match.opposition;
  const awayTeam = match.isHome ? match.opposition : match.teamName;
  const isLocked = match.isLocked;

  // Group cards by player
  const playerCards = match.report?.cards?.reduce((acc, card) => {
    const playerId = card.playerId;
    if (!acc[playerId]) {
      acc[playerId] = [];
    }
    acc[playerId].push(card.type);
    return acc;
  }, {} as Record<string, string[]>) || {};

  // Group goals by player
  const playerGoals = match.report?.goals?.reduce((acc, goal) => {
    const playerId = goal.playerId;
    if (!acc[playerId]) {
      acc[playerId] = 0;
    }
    acc[playerId]++;
    return acc;
  }, {} as Record<string, number>) || {};

  // Group injuries by player
  const playerInjuries = match.report?.injuries?.reduce((acc, injury) => {
    const playerId = injury.playerId;
    if (!acc[playerId]) {
      acc[playerId] = [];
    }
    acc[playerId].push(injury);
    return acc;
  }, {} as Record<string, typeof match.report.injuries>) || {};

  // Separate starting XI and substitutes from lineup players
  const startingEleven = match.lineup?.players.filter(p => p.isStarting) || [];
  const substitutes = match.lineup?.players.filter(p => !p.isStarting) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">     
        {/* Action Button */}
        <div className="flex justify-end gap-3 mb-4">
          <button
            onClick={() => navigate(Routes.matchEdit(clubId!, ageGroupId!, teamId!, matchId!))}
            className="btn-md btn-primary whitespace-nowrap flex items-center gap-2"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
            {isLocked && <span>🔒</span>}
          </button>
        </div>

        {/* Match Header */}
        <div className="card mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {homeTeam} vs {awayTeam}
              </h1>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>📍 {match.location}</span>
                <span>•</span>
                <span>📅 {new Date(match.matchDate).toLocaleDateString()}</span>
                {match.kickOffTime && (
                  <>
                    <span>•</span>
                    <span>⏰ {new Date(match.kickOffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
                <span>•</span>
                <span>🏆 {match.competition}</span>
              </div>
            </div>
            {match.homeScore !== undefined && match.awayScore !== undefined && (
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {match.homeScore} - {match.awayScore}
                </span>
              </div>
            )}
          </div>
          
          {match.weatherCondition && (
            <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>🌤️ {match.weatherCondition}</span>
              {match.weatherTemperature && (
                <>
                  <span>•</span>
                  <span>🌡️ {match.weatherTemperature}°C</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Coaching Staff */}
        {match.coaches.length > 0 && (
          <div className="card mt-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span>👨‍🏫</span> Coaching Staff
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {match.coaches.map((coach) => (
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
                      {coachRoleDisplay[coach.role] || coach.role}
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
            {match.report.playerOfMatchId && match.report.playerOfMatchName && (
              <div className="card mt-4 mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⭐</span>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Player of the Match</h2>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  {match.report.playerOfMatchPhoto ? (
                    <img 
                      src={match.report.playerOfMatchPhoto} 
                      alt={match.report.playerOfMatchName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-amber-400">
                      {match.report.playerOfMatchName.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {match.report.playerOfMatchName}
                    </p>
                    {match.report.performanceRatings?.find(r => r.playerId === match.report!.playerOfMatchId) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Rating: {match.report.performanceRatings.find(r => r.playerId === match.report!.playerOfMatchId)?.rating?.toFixed(1)}/10
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lineup with Ratings */}
            {match.lineup && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card mb-4">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Team Sheet & Player Ratings</h2>
                  
                  {/* Captain Display */}
                  {match.report.captainId && match.report.captainName && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 text-lg">©</span>
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          Captain: {match.report.captainName}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Starting XI */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Starting XI</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {startingEleven.map((player, index) => {
                        const rating = match.report?.performanceRatings?.find(r => r.playerId === player.playerId);
                        const isMotM = player.playerId === match.report?.playerOfMatchId;
                        const isCaptain = player.playerId === match.report?.captainId;
                        const cards = playerCards[player.playerId] || [];
                        const goals = playerGoals[player.playerId] || 0;
                        const injuries = playerInjuries[player.playerId] || [];
                        
                        return (
                          <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isCaptain ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700' : 'bg-green-50 dark:bg-green-900/20'}`}>
                            <div className="flex items-center gap-3 flex-1">
                              {player.squadNumber !== undefined && (
                                <span className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold">
                                  {player.squadNumber}
                                </span>
                              )}
                              {player.position && (
                                <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold min-w-[3rem] text-center">
                                  {player.position}
                                </span>
                              )}
                              {player.photo ? (
                                <img 
                                  src={player.photo} 
                                  alt={`${player.firstName} ${player.lastName}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {player.firstName[0]}{player.lastName[0]}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {player.firstName} {player.lastName}
                                </span>
                                {isCaptain && (
                                  <span className="text-amber-500" title="Captain">©</span>
                                )}
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
                                        title={`Injury: ${injury.description || 'Unknown'}`}
                                      >
                                        🏥
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </div>
                            {rating && rating.rating !== null && rating.rating !== undefined && (
                              <div className="flex items-center gap-2 ml-2">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      rating.rating >= 8 ? 'bg-green-500' : 
                                      rating.rating >= 6 ? 'bg-blue-500' : 
                                      'bg-amber-500'
                                    }`}
                                    style={{ width: `${Number(rating.rating) * 10}%` }}
                                  />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white min-w-[2.5rem] text-right text-sm">
                                  {Number(rating.rating).toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Substitutes */}
                  {substitutes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Substitutes</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {substitutes.map((player, index) => {
                          const rating = match.report?.performanceRatings?.find(r => r.playerId === player.playerId);
                          const isMotM = player.playerId === match.report?.playerOfMatchId;
                          const cards = playerCards[player.playerId] || [];
                          const goals = playerGoals[player.playerId] || 0;
                          const injuries = playerInjuries[player.playerId] || [];
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-3 flex-1">
                                {player.squadNumber !== undefined && (
                                  <span className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold">
                                    {player.squadNumber}
                                  </span>
                                )}
                                {player.photo ? (
                                  <img 
                                    src={player.photo} 
                                    alt={`${player.firstName} ${player.lastName}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {player.firstName[0]}{player.lastName[0]}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {player.firstName} {player.lastName}
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
                                          title={`Injury: ${injury.description || 'Unknown'}`}
                                        >
                                          🏥
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {rating && rating.rating !== null && rating.rating !== undefined && (
                                <div className="flex items-center gap-2 ml-2">
                                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        rating.rating >= 8 ? 'bg-green-500' : 
                                        rating.rating >= 6 ? 'bg-blue-500' : 
                                        'bg-amber-500'
                                      }`}
                                      style={{ width: `${Number(rating.rating) * 10}%` }}
                                    />
                                  </div>
                                  <span className="font-bold text-gray-900 dark:text-white min-w-[2.5rem] text-right text-sm">
                                    {Number(rating.rating).toFixed(1)}
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
                <div className="card mb-4">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Match Summary</h2>
                  {match.report.summary ? (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {match.report.summary}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No match summary available yet.
                    </p>
                  )}
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

        {/* Upcoming match - no report yet */}
        {isUpcoming && (
          <div className="card mt-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Match Report Not Available
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This match hasn't been played yet. The match report will be available after the match is completed.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
