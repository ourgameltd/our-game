import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '@components/common/PageTitle';
import { Routes, areAllParamsValid } from '@utils/routes';
import { useMyTeams, useCurrentUser, useMyClubs } from '@/api/hooks';
import { apiClient } from '@/api';
import type { ClubMatchDto, ClubTrainingSessionDto } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';

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

export default function ClubsListPage() {
  usePageTitle(['Dashboard']);
  const navigate = useNavigate();

  const { isLoading: authLoading, isAdmin } = useAuth();
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { data: myClubs, isLoading: myClubsLoading, error: myClubsError } = useMyClubs();
  const { data: myTeams, isLoading: myTeamsLoading } = useMyTeams();

  const isCoach = !!currentUser?.coachId;

  // Fetch upcoming + past matches & upcoming training for each club
  const [upcomingMatches, setUpcomingMatches] = useState<Map<string, ClubMatchDto[]>>(new Map());
  const [pastMatches, setPastMatches] = useState<Map<string, ClubMatchDto[]>>(new Map());
  const [upcomingTraining, setUpcomingTraining] = useState<Map<string, ClubTrainingSessionDto[]>>(new Map());
  const [eventsLoading, setEventsLoading] = useState(false);

  const myClubsList = myClubs ?? [];
  const myTeamsList = myTeams ?? [];

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

  const isLoading = authLoading || currentUserLoading || myClubsLoading || myTeamsLoading;

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
                        : Routes.teamTrainingSessionEdit(event.clubId, event.ageGroupId, event.teamId, event.id);

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
                            <Link to={link} className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm">
                              {isMatch && event.type === 'match'
                                ? <>{event.match.isHome ? 'vs' : '@'} {event.match.opposition}</>
                                : <>Training{event.type === 'training' && event.session.focusAreas.length > 0 ? ` — ${event.session.focusAreas.slice(0, 2).join(', ')}` : ''}</>
                              }
                            </Link>
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
                            <Link to={link} className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm">
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
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary-500 transition-colors"
                        />
                      ) : (
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary-500 transition-colors"
                          style={{ backgroundColor: club.primaryColor || '#3b82f6' }}
                        >
                          {club.shortName?.substring(0, 2) || club.name.substring(0, 2)}
                        </div>
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate max-w-[80px] text-center">
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
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 group-hover:border-primary-500 group-hover:text-primary-500 transition-colors">
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
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center text-base font-bold text-white border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary-500 transition-colors"
                          style={{ backgroundColor: team.colors?.primary || club?.primaryColor || '#3b82f6' }}
                        >
                          {(team.name || '').substring(0, 2)}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate max-w-[80px] text-center">
                          {team.name}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[80px] text-center -mt-0.5">
                          {team.ageGroupName}
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
