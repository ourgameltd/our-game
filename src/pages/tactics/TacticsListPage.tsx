import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { getClubById } from '@/data/clubs';
import { getAgeGroupById } from '@/data/ageGroups';
import { getTeamById } from '@/data/teams';
import { sampleTactics } from '@/data/tactics';
import { TacticScope, SquadSize } from '@/types';
import { Routes } from '@/utils/routes';
import PageTitle from '@/components/common/PageTitle';
import TacticCard from '@/components/tactics/TacticCard';

export default function TacticsListPage() {
  const { clubId, ageGroupId, teamId } = useParams();
  const navigate = useNavigate();

  // Determine scope from route
  const scope: TacticScope = teamId ? 'team' : ageGroupId ? 'ageGroup' : 'club';

  // Get context data
  const club = getClubById(clubId!);
  const ageGroup = ageGroupId ? getAgeGroupById(ageGroupId) : null;
  const team = teamId ? getTeamById(teamId) : null;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [squadSizeFilter, setSquadSizeFilter] = useState<SquadSize | 'all'>('all');

  if (!club) {
    return <div>Club not found</div>;
  }

  // Filter tactics based on context and filters
  const filteredTactics = useMemo(() => {
    let tactics = sampleTactics.filter(tactic => {
      // Filter by club
      if (tactic.clubId !== clubId) return false;

      // Filter by age group if in age group context
      if (ageGroupId && scope === 'ageGroup' && tactic.ageGroupId !== ageGroupId) return false;

      // Filter by team if in team context
      if (teamId && scope === 'team' && tactic.teamId !== teamId) return false;

      // Filter by search query
      if (searchQuery && !tactic.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by squad size
      if (squadSizeFilter !== 'all' && tactic.squadSize !== squadSizeFilter) {
        return false;
      }

      return true;
    });

    return tactics;
  }, [clubId, ageGroupId, teamId, scope, searchQuery, squadSizeFilter]);

  // Group tactics by scope
  const groupedTactics = useMemo(() => {
    const clubTactics = filteredTactics.filter(t => t.scope === 'club');
    const ageGroupTactics = filteredTactics.filter(t => t.scope === 'ageGroup');
    const teamTactics = filteredTactics.filter(t => t.scope === 'team');

    return {
      club: clubTactics,
      ageGroup: ageGroupTactics,
      team: teamTactics
    };
  }, [filteredTactics]);

  // Determine available parent tactics
  const hasParentTactics = useMemo(() => {
    if (scope === 'team') {
      // Team can inherit from age group or club
      return groupedTactics.club.length > 0 || groupedTactics.ageGroup.length > 0;
    } else if (scope === 'ageGroup') {
      // Age group can inherit from club
      return groupedTactics.club.length > 0;
    }
    return false;
  }, [scope, groupedTactics]);

  // Navigation helpers
  const getNewTacticRoute = () => {
    if (teamId) return Routes.teamTacticNew(clubId!, ageGroupId!, teamId);
    if (ageGroupId) return Routes.ageGroupTacticNew(clubId!, ageGroupId);
    return Routes.clubTacticNew(clubId!);
  };

  const getTacticDetailRoute = (tacticId: string) => {
    if (teamId) return Routes.teamTacticDetail(clubId!, ageGroupId!, teamId, tacticId);
    if (ageGroupId) return Routes.ageGroupTacticDetail(clubId!, ageGroupId, tacticId);
    return Routes.clubTacticDetail(clubId!, tacticId);
  };

  // Page title
  const pageTitle = team ? `${team.name} Tactics` : ageGroup ? `${ageGroup.name} Tactics` : `${club.name} Tactics`;
  const pageSubtitle = 'Manage tactical setups and formations for matches and training';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle title={pageTitle} subtitle={pageSubtitle} />

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tactics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Squad Size Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={squadSizeFilter}
                onChange={(e) => setSquadSizeFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as SquadSize)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Squad Sizes</option>
                <option value="4">4-a-side</option>
                <option value="5">5-a-side</option>
                <option value="7">7-a-side</option>
                <option value="9">9-a-side</option>
                <option value="11">11-a-side</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => navigate(getNewTacticRoute())}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            Create from Base Formation
          </button>

          {hasParentTactics && (
            <button
              onClick={() => navigate(getNewTacticRoute() + '?fromParent=true')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create from Parent Tactic
            </button>
          )}
        </div>

        {/* Tactics grouped by scope */}
        {groupedTactics.club.length === 0 && groupedTactics.ageGroup.length === 0 && groupedTactics.team.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No tactics found. Create your first tactic to get started.
            </p>
            <button
              onClick={() => navigate(getNewTacticRoute())}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Create Tactic
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Club Tactics */}
            {groupedTactics.club.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Club Tactics
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedTactics.club.map((tactic) => (
                    <TacticCard
                      key={tactic.id}
                      tactic={tactic}
                      onClick={() => navigate(getTacticDetailRoute(tactic.id))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Age Group Tactics */}
            {groupedTactics.ageGroup.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Age Group Tactics
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedTactics.ageGroup.map((tactic) => (
                    <TacticCard
                      key={tactic.id}
                      tactic={tactic}
                      onClick={() => navigate(getTacticDetailRoute(tactic.id))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Team Tactics */}
            {groupedTactics.team.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Team Tactics
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedTactics.team.map((tactic) => (
                    <TacticCard
                      key={tactic.id}
                      tactic={tactic}
                      onClick={() => navigate(getTacticDetailRoute(tactic.id))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
