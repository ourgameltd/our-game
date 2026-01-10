import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { sampleTrainingSessions } from '@/data/training';
import { getClubById } from '@/data/clubs';
import { getTeamsByClubId } from '@/data/teams';
import { getAgeGroupById } from '@/data/ageGroups';
import PageTitle from '@components/common/PageTitle';
import { Routes } from '@utils/routes';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function ClubTrainingSessionsPage() {
  const { clubId } = useParams();
  const club = getClubById(clubId!);
  const teams = getTeamsByClubId(clubId!);
  
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStatus, setFilterStatus] = useState<'upcoming' | 'past' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Club not found</h2>
          </div>
        </main>
      </div>
    );
  }

  // Get all team IDs for this club
  const clubTeamIds = teams.map(t => t.id);

  // Get all training sessions for this club
  const allSessions = sampleTrainingSessions.filter(s => clubTeamIds.includes(s.teamId));

  // Get unique age groups from teams
  const allAgeGroups = useMemo(() => {
    const ageGroupIds = new Set<string>();
    teams.forEach(team => {
      ageGroupIds.add(team.ageGroupId);
    });
    return Array.from(ageGroupIds)
      .map(id => {
        const ageGroup = getAgeGroupById(id);
        return ageGroup ? { id, name: ageGroup.name } : null;
      })
      .filter((ag): ag is { id: string; name: string } => ag !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teams]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const now = new Date();
    
    return allSessions.filter(session => {
      // Status filter
      if (filterStatus === 'upcoming' && new Date(session.date) < now) {
        return false;
      }
      if (filterStatus === 'past' && new Date(session.date) >= now) {
        return false;
      }

      // Team filter
      if (filterTeam) {
        if (session.teamId !== filterTeam) {
          return false;
        }
      }

      // Age group filter
      if (filterAgeGroup) {
        const team = teams.find(t => t.id === session.teamId);
        if (!team || team.ageGroupId !== filterAgeGroup) {
          return false;
        }
      }

      return true;
    });
  }, [allSessions, filterAgeGroup, filterTeam, filterStatus, teams]);

  // Sort sessions - upcoming first (soonest first), then past (most recent first)
  const sortedSessions = useMemo(() => {
    const now = new Date();
    const upcoming = filteredSessions
      .filter(s => new Date(s.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = filteredSessions
      .filter(s => new Date(s.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return [...upcoming, ...past];
  }, [filteredSessions]);

  // Get teams filtered by age group if selected
  const filteredTeams = useMemo(() => {
    if (filterAgeGroup) {
      return teams.filter(t => t.ageGroupId === filterAgeGroup);
    }
    return teams;
  }, [teams, filterAgeGroup]);

  const SessionRow = ({ session }: { session: any }) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const isPast = sessionDate < now;
    const team = teams.find(t => t.id === session.teamId);
    const ageGroup = team ? getAgeGroupById(team.ageGroupId) : null;

    return (
      <Link
        to={Routes.teamTrainingSessionEdit(clubId!, team!.ageGroupId, session.teamId, session.id)}
        className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 md:border-0 md:border-b"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-4">
          {/* Date & Time */}
          <div className="flex items-center gap-3 md:flex-shrink-0 md:w-[130px] md:order-1">
            <div className="flex-shrink-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {sessionDate.toLocaleDateString('en-GB', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {sessionDate.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            <span className="md:hidden text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              {session.duration} mins
            </span>
          </div>

          {/* Team Info */}
          <div className="md:w-[180px] md:flex-shrink-0 md:order-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {ageGroup?.name} - {team?.name}
            </div>
          </div>

          {/* Session Details */}
          <div className="flex-grow md:order-3">
            {/* Focus Areas */}
            {session.focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {session.focusAreas.map((area: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
            
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{session.location}</span>
            </div>
          </div>

          {/* Duration - desktop only */}
          <div className="hidden md:flex md:flex-shrink-0 md:w-[80px] md:order-4 justify-end">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session.duration}m
            </span>
          </div>

          {/* Status */}
          <div className="md:flex-shrink-0 md:w-[90px] md:order-5 flex justify-end">
            <span className={`text-xs px-2 py-1 rounded-full ${
              isPast 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            }`}>
              {isPast ? 'Completed' : 'Upcoming'}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title="All Training Sessions"
          badge={allSessions.length}
          subtitle={
            filteredSessions.length !== allSessions.length 
              ? `Showing ${filteredSessions.length} of ${allSessions.length} training sessions`
              : `View and manage training sessions across all teams`
          }
          backLink={Routes.club(clubId!)}
        />

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={filterStatus === 'all'}
                  onChange={() => setFilterStatus('all')}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  All Sessions
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={filterStatus === 'upcoming'}
                  onChange={() => setFilterStatus('upcoming')}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upcoming
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={filterStatus === 'past'}
                  onChange={() => setFilterStatus('past')}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Past
                </span>
              </label>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              {showFilters ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Filters
                </>
              )}
            </button>
          </div>
          
          {showFilters && (
            <>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Group</label>
                    <select 
                      value={filterAgeGroup}
                      onChange={(e) => {
                        setFilterAgeGroup(e.target.value);
                        // Reset team filter if age group changes
                        if (e.target.value) {
                          const availableTeams = teams.filter(t => t.ageGroupId === e.target.value);
                          if (filterTeam && !availableTeams.find(t => t.id === filterTeam)) {
                            setFilterTeam('');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Age Groups</option>
                      {allAgeGroups.map(ageGroup => (
                        <option key={ageGroup.id} value={ageGroup.id}>{ageGroup.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                    <select 
                      value={filterTeam}
                      onChange={(e) => setFilterTeam(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Teams</option>
                      {filteredTeams.map(team => {
                        const ageGroup = getAgeGroupById(team.ageGroupId);
                        return (
                          <option key={team.id} value={team.id}>
                            {ageGroup?.name || ''} - {team.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
          
              {/* Active filters display and clear */}
              {(filterAgeGroup || filterTeam) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                  {filterAgeGroup && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Age: {allAgeGroups.find(ag => ag.id === filterAgeGroup)?.name || filterAgeGroup}
                      <button onClick={() => setFilterAgeGroup('')} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                    </span>
                  )}
                  {filterTeam && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                      Team: {teams.find(t => t.id === filterTeam)?.name}
                      <button onClick={() => setFilterTeam('')} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setFilterAgeGroup('');
                      setFilterTeam('');
                    }}
                    className="ml-auto text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sessions List */}
        {sortedSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {sortedSessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {allSessions.length === 0 ? 'No training sessions yet' : 'No sessions found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {allSessions.length === 0 
                ? 'Training sessions will appear here once they are scheduled'
                : 'Try adjusting your filters to see more results'}
            </p>
            {allSessions.length > 0 && (
              <button 
                onClick={() => {
                  setFilterAgeGroup('');
                  setFilterTeam('');
                  setFilterStatus('all');
                }}
                className="btn-secondary btn-md"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
