import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Archive, RotateCcw, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { usePlayer, usePlayerAbilities, useArchivePlayerAbilityEvaluation } from '@api/hooks';
import { Routes } from '@utils/routes';
import { useNavigation } from '@/contexts/NavigationContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessProfile } from '@/hooks/useAccessProfile';
import { canViewPlayerAbilities } from '@/utils/accessControl';
import PlayerSubNav from '@components/player/PlayerSubNav';
import PageTitle from '@components/common/PageTitle';
import AccessDeniedPage from '@components/common/AccessDeniedPage';
import PlayerEvaluationFormModal from '@components/player/PlayerEvaluationFormModal';

export default function PlayerReviewsPage() {
  const { clubId, playerId, ageGroupId, teamId } = useParams();
  const { data: player, isLoading: playerLoading } = usePlayer(playerId);

  usePageTitle(
    [
      player?.clubName ?? 'Club',
      ageGroupId ? (player?.ageGroupName ?? 'Age Group') : undefined,
      teamId ? (player?.teamName ?? 'Team') : undefined,
      player ? `${player.firstName} ${player.lastName}` : 'Player',
      'Reviews',
    ],
    !!player,
  );

  const { isAdmin } = useAuth();
  const { profile } = useAccessProfile(isAdmin);
  const { data: abilities, isLoading: loading, error, refetch } = usePlayerAbilities(playerId);
  const { mutate: archiveEvaluation, isSubmitting: isArchiving } = useArchivePlayerAbilityEvaluation(playerId ?? '');
  const { setEntityName } = useNavigation();

  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCoach, setFilterCoach] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setEntityName('player', player.id, `${player.firstName} ${player.lastName}`);
      if (player.clubId && player.clubName) {
        setEntityName('club', player.clubId, player.clubName);
      }
      if (player.teamId && player.teamName) {
        setEntityName('team', player.teamId, player.teamName);
      }
      if (player.ageGroupId && player.ageGroupName) {
        setEntityName('ageGroup', player.ageGroupId, player.ageGroupName);
      }
    }
  }, [player?.id, player?.firstName, player?.lastName, player?.clubId, player?.clubName, player?.teamId, player?.teamName, player?.ageGroupId, player?.ageGroupName, setEntityName]);

  let backLink: string;
  let subtitle: string;
  if (teamId && ageGroupId) {
    backLink = Routes.teamSquad(clubId!, ageGroupId, teamId);
    subtitle = player ? `${player.ageGroupName || 'Age Group'} • ${player.teamName || 'Team'}` : 'Loading...';
  } else if (ageGroupId) {
    backLink = Routes.ageGroupPlayers(clubId!, ageGroupId);
    subtitle = player?.ageGroupName || 'Age Group';
  } else {
    backLink = Routes.clubPlayers(clubId!);
    subtitle = 'Club Players';
  }

  let settingsLink: string;
  if (teamId && ageGroupId) {
    settingsLink = Routes.teamPlayerSettings(clubId!, ageGroupId, teamId, playerId!);
  } else if (ageGroupId) {
    settingsLink = Routes.playerSettings(clubId!, ageGroupId, playerId!);
  } else {
    settingsLink = Routes.clubPlayerSettings(clubId!, playerId!);
  }

  const allEvaluations = useMemo(
    () => (abilities?.evaluations ?? []).slice().sort(
      (a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
    ),
    [abilities?.evaluations]
  );

  const coachOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    allEvaluations.forEach((e) => {
      const id = e.evaluatedBy ?? e.coachName ?? '';
      if (!id || seen.has(id)) return;
      seen.add(id);
      options.push({ value: id, label: e.coachName || 'Unknown Coach' });
    });
    return options;
  }, [allEvaluations]);

  const filteredEvaluations = useMemo(() => {
    return allEvaluations.filter((e) => {
      if (!showArchived && e.isArchived) return false;
      if (filterCoach) {
        const id = e.evaluatedBy ?? e.coachName ?? '';
        if (id !== filterCoach) return false;
      }
      return true;
    });
  }, [allEvaluations, filterCoach, showArchived]);

  const activeFilterCount = (filterCoach ? 1 : 0) + (showArchived ? 1 : 0);

  const handleToggleArchive = async (evaluationId: string, isCurrentlyArchived: boolean) => {
    if (!playerId) return;
    setBusyId(evaluationId);
    try {
      await archiveEvaluation(evaluationId, !isCurrentlyArchived);
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  if (!playerId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Player ID is required</h2>
          </div>
        </main>
      </div>
    );
  }

  if (!canViewPlayerAbilities(profile)) {
    return <AccessDeniedPage description="Player reviews are not visible for linked parent accounts." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {playerLoading ? (
          <div className="mb-4 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : player ? (
          <PageTitle
            title={`${player.firstName} ${player.lastName}`}
            subtitle={subtitle}
            backLink={backLink}
            image={{
              src: player.photoUrl,
              alt: `${player.firstName} ${player.lastName}`,
              initials: `${player.firstName[0]}${player.lastName[0]}`,
              colorClass: 'from-primary-500 to-primary-600',
            }}
            action={{
              label: 'Settings',
              href: settingsLink,
              icon: 'settings',
              title: 'Player Settings',
            }}
          />
        ) : null}

        {!playerLoading && player && <PlayerSubNav />}

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error.message || 'Failed to load player reviews'}
            </p>
            <button onClick={refetch} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
              Try again
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reviews</h2>
            {!loading && abilities && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredEvaluations.length} review{filteredEvaluations.length !== 1 ? 's' : ''}
                {activeFilterCount > 0 && ' (filtered)'}
              </p>
            )}
          </div>
          {!loading && abilities && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              title="Add New Review"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            {showFilters ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coach
                  </label>
                  <select
                    value={filterCoach}
                    onChange={(e) => setFilterCoach(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All coaches</option>
                    {coachOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show archived reviews
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="card">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {allEvaluations.length === 0
                ? 'No reviews yet. Click "New Review" to add one.'
                : 'No reviews match the current filters.'}
            </p>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Coach</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvaluations.map((evaluation) => {
                    const evalId = evaluation.id || evaluation.evaluationId;
                    const isBusy = isArchiving && busyId === evalId;
                    return (
                      <tr
                        key={evalId}
                        className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          evaluation.isArchived ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {new Date(evaluation.evaluatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {evaluation.coachName || 'Unknown Coach'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="font-bold text-primary-600">{evaluation.overallRating}/99</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {evaluation.coachNotes || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {evaluation.isArchived ? (
                            <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                              Archived
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(evalId, evaluation.isArchived)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50"
                            title={evaluation.isArchived ? 'Unarchive review' : 'Archive review'}
                          >
                            {evaluation.isArchived ? (
                              <>
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden sm:inline">Unarchive</span>
                              </>
                            ) : (
                              <>
                                <Archive className="w-4 h-4" />
                                <span className="hidden sm:inline">Archive</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showForm && abilities && (
          <PlayerEvaluationFormModal
            abilities={abilities}
            playerId={playerId}
            onClose={() => setShowForm(false)}
            onSuccess={refetch}
          />
        )}
      </main>
    </div>
  );
}
