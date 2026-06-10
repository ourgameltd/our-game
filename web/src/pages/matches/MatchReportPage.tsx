import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FileText, CalendarPlus, Map } from 'lucide-react';
import Markdown from 'react-markdown';
import { useMatchReport, useCurrentUser, useMyChildren, useUpdateMyMatchAttendance } from '@/api/hooks';
import { useNavigation } from '@/contexts/NavigationContext';
import { coachRoleDisplay } from '@/constants/coachRoleDisplay';
import { Routes } from '@/utils/routes';
import { usePageTitle } from '@/hooks/usePageTitle';
import PageTitle from '@components/common/PageTitle';
import AttendanceResponse from '@components/AttendanceResponse';

export default function MatchReportPage() {
  const { matchId, clubId, ageGroupId, teamId } = useParams();
  const { data: match, isLoading, error } = useMatchReport(matchId);
  const { setEntityName } = useNavigation();
  const { data: currentUser } = useCurrentUser();
  const { data: myChildren } = useMyChildren();
  const { submit: submitAttendance, isSubmitting: attendanceSubmitting } = useUpdateMyMatchAttendance(matchId || '');
  const [isPublished, setIsPublished] = useState(false);
  // Track attendance status overrides after user responds
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>({});

  const handleAttendanceRespond = async (status: 'confirmed' | 'declined', playerId?: string) => {
    const key = playerId ?? (currentUser?.coachId ? 'coach' : 'player');
    const res = await submitAttendance(status, playerId);
    if (res.success) {
      setAttendanceOverrides(prev => ({ ...prev, [key]: status }));
    }
  };

  usePageTitle(
    [
      match?.clubName ?? 'Club',
      ageGroupId ? (match?.ageGroupName ?? 'Age Group') : undefined,
      match?.teamName ?? 'Team',
      'Match Report',
    ],
    !!match,
  );

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

  const socialShareUrl = useMemo(
    () => match ? `${window.location.origin}${Routes.socialMatchReport(match.id)}` : '',
    [match?.id]
  );

  useEffect(() => {
    if (match) {
      setIsPublished(match.isPublished);
    }
  }, [match?.isPublished]);

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
          {/* PageTitle Skeleton */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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

  // Dapper serializes DateTime with Kind=Unspecified (no Z suffix), so append Z to force UTC parsing.
  const asUtc = (iso: string) => (/Z$|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z');

  const isUpcoming = new Date(asUtc(match.matchDate)) > new Date();
  const homeTeam = match.isHome ? match.teamName : match.opposition;
  const awayTeam = match.isHome ? match.opposition : match.teamName;
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

  const handleAddToCalendar = () => {
    const meet = new Date(asUtc(match.meetTime!));
    const end = new Date(meet.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(meet)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${homeTeam} vs ${awayTeam}`,
      `LOCATION:${match.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'match.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={`${homeTeam} vs ${awayTeam}`}
          backLink={Routes.matches(clubId!, ageGroupId!, teamId!)}
          action={{
            label: 'Settings',
            href: Routes.matchEdit(clubId!, ageGroupId!, teamId!, matchId!),
            icon: 'settings',
          }}
        />
        {/* Game Details */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Game Details</h2>
            {isPublished && (
              <a
                href={socialShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Published Report"
                title="View Published Report"
                className="btn-sm btn-secondary btn-icon"
              >
                <FileText className="w-4 h-4" />
              </a>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>📅 {new Date(asUtc(match.matchDate)).toLocaleDateString()}</span>
                {match.kickOffTime && (
                  <>
                    <span>•</span>
                    <span>⚽ {new Date(asUtc(match.kickOffTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
                <span>•</span>
                <span>🏆 {match.competition}</span>
                {match.weatherCondition && (
                  <>
                    <span>•</span>
                    <span>🌤️ {match.weatherCondition}</span>
                    {match.weatherTemperature && (
                      <>
                        <span>•</span>
                        <span>🌡️ {match.weatherTemperature}°C</span>
                      </>
                    )}
                  </>
                )}
                {match.pitchType && (
                  <>
                    <span>•</span>
                    <span>🏟️ {match.pitchType === 'astro' ? 'Astro (3G)' : match.pitchType === 'indoor' ? 'Indoor' : 'Grass'}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>📍 {match.location}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in Google Maps"
                  title="Open in Google Maps"
                  className="btn-sm btn-secondary btn-icon"
                >
                  <Map className="w-4 h-4" />
                </a>
                {match.meetTime && (
                  <>
                    <span>•</span>
                    <span>🕐 Meet: {new Date(asUtc(match.meetTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      type="button"
                      onClick={handleAddToCalendar}
                      aria-label="Add to calendar"
                      title="Add to calendar"
                      className="btn-sm btn-secondary btn-icon"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {match.homeScore != null && match.awayScore != null && (
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {match.homeScore} - {match.awayScore}
                </span>
              </div>
            )}
          </div>

          {(match.primaryKit || match.goalkeeperKit) && (
            <div className="mt-3 flex flex-wrap gap-4">
              {match.primaryKit && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kit:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: match.primaryKit.shirtColor }} title="Shirt" />
                    <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: match.primaryKit.shortsColor }} title="Shorts" />
                    <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: match.primaryKit.socksColor }} title="Socks" />
                  </div>
                </div>
              )}
              {match.goalkeeperKit && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GK Kit:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: match.goalkeeperKit.shirtColor }} title="Shirt" />
                    <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: match.goalkeeperKit.shortsColor }} title="Shorts" />
                    <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: match.goalkeeperKit.socksColor }} title="Socks" />
                  </div>
                </div>
              )}
            </div>
          )}

          {match.notes && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-600 dark:border-blue-400">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Additional Info</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{match.notes}</p>
            </div>
          )}
        </div>

        {/* Match Report Content (only for past matches) */}
        {!isUpcoming && match.report && (
          <>
            {/* Lineup with Ratings */}
            {match.lineup && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card mb-4">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Team Sheet</h2>
  
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
                              {player.position && (
                                <span className="px-1.5 py-0.5 bg-green-600 text-white rounded text-[11px] font-semibold min-w-[2.25rem] text-center leading-none">
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
                              <div className="ml-2">
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
                                <div className="ml-2">
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

                  {match.coaches.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                        <span>👨‍🏫</span> Coaching Staff
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {match.coaches.map((coach) => (
                          <div key={coach.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {coach.photo ? (
                              <img
                                src={coach.photo}
                                alt={`${coach.firstName} ${coach.lastName}`}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-600 dark:to-secondary-800 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
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
                </div>

                {/* Summary */}
                <div className="card mb-4">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Match Summary</h2>
                  {match.report.summary ? (
                    <div className="markdown-content">
                      <Markdown>{match.report.summary}</Markdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No match summary available yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Upcoming match — attendance response + "no report yet" notice */}
        {isUpcoming && (
          <>
            {/* Your Attendance */}
            {(() => {
              const children = myChildren ?? [];
              const rows: { label?: string; photo?: string; initials?: string; status: string; playerId?: string }[] = [];

              if (currentUser?.playerId) {
                const rec = match.attendance.find(a => a.playerId === currentUser.playerId);
                if (rec) rows.push({ status: attendanceOverrides['player'] ?? rec.status });
              }

              if (currentUser?.coachId) {
                const rec = match.coaches.find(c => c.coachId === currentUser.coachId);
                if (rec) rows.push({
                  photo: currentUser.photo || undefined,
                  initials: `${currentUser.firstName[0]}${currentUser.lastName[0]}`,
                  status: attendanceOverrides['coach'] ?? rec.status,
                });
              }

              for (const child of children) {
                const rec = match.attendance.find(a => a.playerId === child.id);
                if (rec) {
                  rows.push({
                    photo: child.photo,
                    initials: `${child.firstName[0]}${child.lastName[0]}`,
                    status: attendanceOverrides[child.id] ?? rec.status,
                    playerId: child.id,
                  });
                }
              }

              if (rows.length === 0) return null;

              return (
                <div className="card mt-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Attendance</h2>
                  <div className="space-y-3">
                    {rows.map((row, i) => (
                      <AttendanceResponse
                        key={i}
                        status={row.status}
                        onConfirm={() => handleAttendanceRespond('confirmed', row.playerId)}
                        onDecline={() => handleAttendanceRespond('declined', row.playerId)}
                        isSubmitting={attendanceSubmitting}
                        label={row.label}
                        photo={row.photo}
                        initials={row.initials}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

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
          </>
        )}
      </main>
    </div>
  );
}
