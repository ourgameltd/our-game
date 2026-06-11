import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '@components/common/PageTitle';
import { Routes, areAllParamsValid } from '@utils/routes';
import { useMyTeams, useCurrentUser, useMyClubs, useMyChildren, usePlayer } from '@/api/hooks';
import { apiClient } from '@/api';
import type { ClubMatchDto, ClubTrainingSessionDto } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import AttendanceResponse from '@components/AttendanceResponse';

// Unified upcoming event type
type UpcomingEvent = {
  type: 'match' | 'training';
  id: string;
  clubId: string;
  clubName: string;
  teamId: string;
  ageGroupId: string;
  teamName: string;
  ageGroupName: string;
  date: string;
  location: string;
} & (
  | { type: 'match'; match: ClubMatchDto }
  | { type: 'training'; session: ClubTrainingSessionDto }
);

// A pending attendance action for the current user on an event
type PendingItem = {
  key: string;
  event: UpcomingEvent;
  currentStatus: string;
  role: 'player' | 'coach' | 'parent';
  playerId?: string;      // set for parent responses
  playerName?: string;    // set for parent display
};

export default function ClubsListPage() {
  usePageTitle(['Dashboard']);
  const navigate = useNavigate();

  const { isLoading: authLoading, isAdmin } = useAuth();
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { data: myChildren, isLoading: myChildrenLoading } = useMyChildren();
  const { data: linkedPlayerProfile, isLoading: linkedPlayerLoading } = usePlayer(currentUser?.playerId);
  const { data: myClubs, isLoading: myClubsLoading, error: myClubsError } = useMyClubs();
  const { data: myTeams, isLoading: myTeamsLoading } = useMyTeams();

  const isCoach = !!currentUser?.coachId;

  // Fetch upcoming + past matches & upcoming training for each club
  const [upcomingMatches, setUpcomingMatches] = useState<Map<string, ClubMatchDto[]>>(new Map());
  const [pastMatches, setPastMatches] = useState<Map<string, ClubMatchDto[]>>(new Map());
  const [upcomingTraining, setUpcomingTraining] = useState<Map<string, ClubTrainingSessionDto[]>>(new Map());
  const [eventsLoading, setEventsLoading] = useState(false);

  // Local overrides for attendance status after user responds (optimistic updates)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [submittingKeys, setSubmittingKeys] = useState<Set<string>>(new Set());

  const myClubsList = myClubs ?? [];
  const myTeamsList = myTeams ?? [];
  const myChildrenList = myChildren ?? [];

  const linkedPlayers = useMemo(() => {
    const linked = new Map<string, {
      id: string;
      displayName: string;
      photo?: string;
      clubId: string;
      ageGroupId?: string;
    }>();

    if (linkedPlayerProfile?.id && linkedPlayerProfile.clubId) {
      linked.set(linkedPlayerProfile.id, {
        id: linkedPlayerProfile.id,
        displayName: `${linkedPlayerProfile.firstName} ${linkedPlayerProfile.lastName}`,
        photo: linkedPlayerProfile.photoUrl,
        clubId: linkedPlayerProfile.clubId,
        ageGroupId: linkedPlayerProfile.ageGroupIds?.[0],
      });
    }

    for (const child of myChildrenList) {
      linked.set(child.id, {
        id: child.id,
        displayName: `${child.firstName} ${child.lastName}`,
        photo: child.photo,
        clubId: child.clubId,
        ageGroupId: child.ageGroups?.[0]?.id,
      });
    }

    return Array.from(linked.values());
  }, [linkedPlayerProfile, myChildrenList]);

  useEffect(() => {
    if (myClubsList.length === 0) return;
    setEventsLoading(true);

    const fetchAll = async () => {
      const upMatchMap = new Map<string, ClubMatchDto[]>();
      const pastMatchMap = new Map<string, ClubMatchDto[]>();
      const trainingMap = new Map<string, ClubTrainingSessionDto[]>();

      await Promise.all(myClubsList.map(async (club) => {
        try {
          const [upMatchRes, pastMatchRes, trainingRes] = await Promise.all([
            apiClient.clubs.getMatches(club.id, { status: 'upcoming' }),
            apiClient.clubs.getMatches(club.id, { status: 'completed' }),
            apiClient.clubs.getTrainingSessions(club.id, { status: 'upcoming' }),
          ]);
          if (upMatchRes.success && upMatchRes.data) {
            upMatchMap.set(club.id, upMatchRes.data.matches);
          }
          if (pastMatchRes.success && pastMatchRes.data) {
            pastMatchMap.set(club.id, pastMatchRes.data.matches);
          }
          if (trainingRes.success && trainingRes.data) {
            trainingMap.set(club.id, trainingRes.data.sessions);
          }
        } catch {
          // silently skip failed clubs
        }
      }));

      setUpcomingMatches(upMatchMap);
      setPastMatches(pastMatchMap);
      setUpcomingTraining(trainingMap);
      setEventsLoading(false);
    };
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myClubs]);

  // Merge and sort all upcoming events (matches + training)
  const upcomingEvents = useMemo<UpcomingEvent[]>(() => {
    const events: UpcomingEvent[] = [];

    for (const club of myClubsList) {
      for (const m of upcomingMatches.get(club.id) ?? []) {
        events.push({
          type: 'match', id: m.id, clubId: club.id,
          clubName: club.shortName || club.name,
          teamId: m.teamId, ageGroupId: m.ageGroupId,
          teamName: m.teamName, ageGroupName: m.ageGroupName,
          date: m.kickOffTime || m.date, location: m.location, match: m,
        });
      }
      for (const s of upcomingTraining.get(club.id) ?? []) {
        events.push({
          type: 'training', id: s.id, clubId: club.id,
          clubName: club.shortName || club.name,
          teamId: s.teamId, ageGroupId: s.ageGroupId,
          teamName: s.teamName, ageGroupName: s.ageGroupName,
          date: s.date, location: s.location, session: s,
        });
      }
    }

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return events;
  }, [myClubsList, upcomingMatches, upcomingTraining]);

  // Determine pending attendance items for the current user
  const pendingItems = useMemo<PendingItem[]>(() => {
    const items: PendingItem[] = [];

    for (const event of upcomingEvents) {
      if (event.type === 'match') {
        const { match } = event;

        // Player
        if (currentUser?.playerId) {
          const rec = match.attendance.find(a => a.playerId === currentUser.playerId);
          if (rec) {
            const key = `match:${match.id}:player`;
            items.push({ key, event, role: 'player', currentStatus: statusOverrides[key] ?? rec.status });
          }
        }

        // Coach
        if (currentUser?.coachId) {
          const rec = match.coaches.find(c => c.coachId === currentUser.coachId);
          if (rec) {
            const key = `match:${match.id}:coach`;
            items.push({ key, event, role: 'coach', currentStatus: statusOverrides[key] ?? rec.status });
          }
        }

        // Parent — one item per linked child in this match
        for (const child of myChildrenList) {
          const rec = match.attendance.find(a => a.playerId === child.id);
          if (rec) {
            const key = `match:${match.id}:child:${child.id}`;
            items.push({
              key, event, role: 'parent',
              playerId: child.id,
              playerName: `${child.firstName} ${child.lastName}`,
              currentStatus: statusOverrides[key] ?? rec.status,
            });
          }
        }
      } else {
        const { session } = event;

        // Player
        if (currentUser?.playerId) {
          const rec = session.attendance.find(a => a.playerId === currentUser.playerId);
          if (rec) {
            const key = `session:${session.id}:player`;
            items.push({ key, event, role: 'player', currentStatus: statusOverrides[key] ?? rec.status });
          }
        }

        // Coach
        if (currentUser?.coachId) {
          const rec = session.coaches.find(c => c.coachId === currentUser.coachId);
          if (rec) {
            const key = `session:${session.id}:coach`;
            items.push({ key, event, role: 'coach', currentStatus: statusOverrides[key] ?? rec.status });
          }
        }

        // Parent
        for (const child of myChildrenList) {
          const rec = session.attendance.find(a => a.playerId === child.id);
          if (rec) {
            const key = `session:${session.id}:child:${child.id}`;
            items.push({
              key, event, role: 'parent',
              playerId: child.id,
              playerName: `${child.firstName} ${child.lastName}`,
              currentStatus: statusOverrides[key] ?? rec.status,
            });
          }
        }
      }
    }

    return items;
  }, [upcomingEvents, currentUser, myChildrenList, statusOverrides]);

  const pendingOnlyItems = useMemo(
    () => pendingItems.filter(i => i.currentStatus === 'pending'),
    [pendingItems]
  );

  const handleRespond = useCallback(async (item: PendingItem, status: 'confirmed' | 'declined') => {
    setSubmittingKeys(prev => new Set(prev).add(item.key));
    try {
      let res;
      if (item.event.type === 'match') {
        res = await apiClient.matches.updateMyAttendance(item.event.id, status, item.playerId);
      } else {
        res = await apiClient.trainingSessions.updateMyAttendance(item.event.id, status, item.playerId);
      }
      if (res.success) {
        setStatusOverrides(prev => ({ ...prev, [item.key]: status }));
      }
    } finally {
      setSubmittingKeys(prev => { const s = new Set(prev); s.delete(item.key); return s; });
    }
  }, []);

  // Previous results (past matches only, most recent first)
  const previousResults = useMemo(() => {
    const results: { clubId: string; clubName: string; match: ClubMatchDto }[] = [];
    for (const club of myClubsList) {
      for (const m of pastMatches.get(club.id) ?? []) {
        results.push({ clubId: club.id, clubName: club.shortName || club.name, match: m });
      }
    }
    results.sort((a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime());
    return results;
  }, [myClubsList, pastMatches]);

  const isLoading = authLoading || currentUserLoading || myChildrenLoading || linkedPlayerLoading || myClubsLoading || myTeamsLoading;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getResultBadge = (match: ClubMatchDto) => {
    if (match.homeScore == null || match.awayScore == null) return null;
    const ourScore = match.isHome ? match.homeScore : match.awayScore;
    const theirScore = match.isHome ? match.awayScore : match.homeScore;
    if (ourScore > theirScore) return { label: 'W', cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
    if (ourScore < theirScore) return { label: 'L', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
    return { label: 'D', cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' };
  };

  // Return a status dot for the current user's attendance on an event (for the Upcoming table)
  const getMyStatusDot = (event: UpcomingEvent): string | null => {
    const key = event.type === 'match'
      ? (currentUser?.playerId ? `match:${event.id}:player` : currentUser?.coachId ? `match:${event.id}:coach` : null)
      : (currentUser?.playerId ? `session:${event.id}:player` : currentUser?.coachId ? `session:${event.id}:coach` : null);

    const item = key ? pendingItems.find(i => i.key === key) : null;
    return item?.currentStatus ?? null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title="Dashboard"
          subtitle="Your upcoming events and results"
        />

        {/* Error State */}
        {myClubsError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load clubs</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{myClubsError.message}</p>
          </div>
        )}

        {/* Awaiting Your Response */}
        {!isLoading && !eventsLoading && pendingOnlyItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Awaiting Your Response
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
              {pendingOnlyItems.map((item) => {
                const isMatch = item.event.type === 'match';
                return (
                  <div key={item.key} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isMatch ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                          {isMatch ? 'Match' : 'Training'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(item.event.date)} · {formatTime(item.event.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isMatch && item.event.type === 'match'
                          ? <>{item.event.match.isHome ? 'vs' : '@'} {item.event.match.opposition} — {item.event.teamName}</>
                          : <>Training — {item.event.teamName}</>
                        }
                        {item.playerName && (
                          <span className="ml-1 text-primary-600 dark:text-primary-400 font-medium">
                            ({item.playerName})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <AttendanceResponse
                        status={item.currentStatus}
                        onConfirm={() => handleRespond(item, 'confirmed')}
                        onDecline={() => handleRespond(item, 'declined')}
                        isSubmitting={submittingKeys.has(item.key)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Matches & Sessions Table */}
        {!isLoading && !eventsLoading && upcomingEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Upcoming
          </h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
                      <th className="px-3 py-3 font-semibold">Type</th>
                      <th className="px-3 py-3 font-semibold">Date</th>
                      <th className="px-3 py-3 font-semibold hidden md:table-cell">Club</th>
                      <th className="px-3 py-3 font-semibold">Details</th>
                      <th className="px-3 py-3 font-semibold hidden lg:table-cell">Team</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {upcomingEvents.slice(0, 15).map((event) => {
                      const isMatch = event.type === 'match';
                      const link = isMatch
                        ? Routes.matchReport(event.clubId, event.ageGroupId, event.teamId, event.id)
                        : Routes.teamTrainingSession(event.clubId, event.ageGroupId, event.teamId, event.id);

                      const myStatus = getMyStatusDot(event);

                      return (
                        <tr key={`${event.type}-${event.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => navigate(link)}>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isMatch ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                              {isMatch ? '⚽' : '🏋️'}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">{formatDate(event.date)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(event.date)}</div>
                          </td>
                          <td className="px-3 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell whitespace-nowrap text-sm">
                            {event.clubName}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <Link to={link} className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm" onClick={e => e.stopPropagation()}>
                                {isMatch && event.type === 'match'
                                  ? <>{event.match.isHome ? 'vs' : '@'} {event.match.opposition}</>
                                  : <>Training{event.type === 'training' && event.session.focusAreas.length > 0 ? ` — ${event.session.focusAreas.slice(0, 2).join(', ')}` : ''}</>
                                }
                              </Link>
                              {myStatus && myStatus !== 'pending' && (
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${myStatus === 'confirmed' ? 'bg-green-500' : 'bg-red-500'}`}
                                  title={myStatus === 'confirmed' ? 'You confirmed' : 'You declined'}
                                />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {event.teamName}
                              {isMatch && event.type === 'match' && event.match.competition && ` · ${event.match.competition}`}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-600 dark:text-gray-300 hidden lg:table-cell whitespace-nowrap text-sm">
                            <div>{event.teamName}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{event.ageGroupName}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
        )}

        {/* Previous Results Table */}
        {!isLoading && !eventsLoading && previousResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Previous Results
          </h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
                      <th className="px-3 py-3 font-semibold">Date</th>
                      <th className="px-3 py-3 font-semibold">Match</th>
                      <th className="px-3 py-3 font-semibold text-center">Score</th>
                      <th className="px-3 py-3 font-semibold text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {previousResults.slice(0, 15).map(({ clubId, match: m }) => {
                      const result = getResultBadge(m);
                      const link = Routes.matchReport(clubId, m.ageGroupId, m.teamId, m.id);

                      return (
                        <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => navigate(link)}>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">{formatDate(m.date)}</div>
                          </td>
                          <td className="px-3 py-3">
                            <Link to={link} className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm" onClick={e => e.stopPropagation()}>
                              {m.isHome ? 'vs' : '@'} {m.opposition}
                            </Link>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {m.teamName}{m.competition && ` · ${m.competition}`}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-gray-900 dark:text-white whitespace-nowrap text-sm">
                            {m.homeScore != null && m.awayScore != null
                              ? `${m.isHome ? m.homeScore : m.awayScore} - ${m.isHome ? m.awayScore : m.homeScore}`
                              : '—'
                            }
                          </td>
                          <td className="px-3 py-3 text-center">
                            {result ? (
                              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${result.cls}`}>
                                {result.label}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
        )}

        {/* Linked player access for parent/player accounts */}
        {!isLoading && linkedPlayers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Players</h2>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {linkedPlayers.map((player) => {
                const hasValidRoute = areAllParamsValid(player.clubId, player.ageGroupId, player.id);
                const to = hasValidRoute
                  ? Routes.player(player.clubId, player.ageGroupId!, player.id)
                  : '#';

                const avatar = (
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 group">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.displayName}
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary-500 transition-colors"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-base font-bold text-white border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary-500 transition-colors bg-gradient-to-br from-primary-500 to-primary-700">
                        {player.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate max-w-[108px] text-center">
                      {player.displayName}
                    </span>
                  </div>
                );

                return hasValidRoute ? (
                  <Link key={player.id} to={to} title={player.displayName}>
                    {avatar}
                  </Link>
                ) : (
                  <div key={player.id} className="opacity-60 cursor-not-allowed" title={`${player.displayName} (route unavailable)`}>
                    {avatar}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Access: Circle avatars for clubs & teams */}
        {!isLoading && isCoach && (myClubsList.length > 0 || myTeamsList.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Clubs Row */}
            {myClubsList.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Clubs</h2>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {myClubsList.map((club) => (
                    <Link
                      key={club.id}
                      to={Routes.club(club.id)}
                      className="flex flex-col items-center gap-1 flex-shrink-0 group"
                      title={club.name}
                    >
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary-500 transition-colors"
                        />
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary-500 transition-colors"
                          style={{ backgroundColor: club.primaryColor || '#3b82f6' }}
                        >
                          {club.shortName?.substring(0, 2) || club.name.substring(0, 2)}
                        </div>
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate max-w-[108px] text-center">
                        {club.shortName || club.name}
                      </span>
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to={Routes.newClub()}
                      className="flex flex-col items-center gap-1 flex-shrink-0 group"
                      title="Create Club"
                    >
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 group-hover:border-primary-500 group-hover:text-primary-500 transition-colors">
                        <span className="text-2xl leading-none">+</span>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-primary-500">New</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Teams Row */}
            {myTeamsList.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Teams</h2>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {myTeamsList.map((team) => {
                    const club = myClubsList.find(c => c.id === team.clubId);
                    const hasValidRoute = areAllParamsValid(team.id, team.clubId, team.ageGroupId);

                    const avatar = (
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 group">
                        <div className="relative">
                          <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-base font-bold text-white border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary-500 transition-colors"
                            style={{ backgroundColor: team.colors?.primary || club?.primaryColor || '#3b82f6' }}
                          >
                            {(team.name || '').substring(0, 2)}
                          </div>
                          {/* Club badge - bottom right corner */}
                          {club && (
                            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden shadow-sm">
                              {club.logo ? (
                                <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white"
                                  style={{ backgroundColor: club.primaryColor || '#6b7280' }}
                                >
                                  {(club.shortName || club.name).substring(0, 2)}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Age group badge - top right corner */}
                          {team.ageGroupName && (
                            <div className="absolute -top-1 -right-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-[8px] font-semibold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                              {team.ageGroupName}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate max-w-[108px] text-center">
                          {team.name}
                        </span>
                      </div>
                    );

                    return hasValidRoute ? (
                      <Link key={team.id} to={Routes.team(team.clubId!, team.ageGroupId!, team.id!)} title={`${team.name} (${team.ageGroupName})`}>
                        {avatar}
                      </Link>
                    ) : (
                      <div key={team.id} className="opacity-60 cursor-not-allowed" title={`${team.name} (${team.ageGroupName})`}>
                        {avatar}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
