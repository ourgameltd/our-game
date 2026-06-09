import { useParams } from 'react-router-dom';
import { AlertCircle, LayoutGrid } from 'lucide-react';
import { useTacticsByScope } from '@/api/hooks';
import { Routes } from '@/utils/routes';
import PageTitle from '@/components/common/PageTitle';
import EmptyState from '@/components/common/EmptyState';
import { usePageTitle } from '@/hooks/usePageTitle';
import TacticCard, { TacticCardSkeleton } from '@/components/tactics/TacticCard';

export default function TacticsListPage() {
  usePageTitle(['Tactics List']);

  const { clubId, ageGroupId, teamId } = useParams();

  const { data: tacticsData, isLoading, error } = useTacticsByScope(clubId, ageGroupId, teamId);

  const getNewTacticUrl = () => {
    if (!clubId) return '#';
    if (teamId && ageGroupId) {
      return Routes.teamTacticNew(clubId, ageGroupId, teamId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTacticNew(clubId, ageGroupId);
    }
    return Routes.clubTacticNew(clubId);
  };

  const getTacticDetailUrl = (tacticId: string) => {
    if (!clubId) return '#';
    if (teamId && ageGroupId) {
      return Routes.teamTacticDetail(clubId, ageGroupId, teamId, tacticId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTacticDetail(clubId, ageGroupId, tacticId);
    }
    return Routes.clubTacticDetail(clubId, tacticId);
  };

  const getTacticEditUrl = (tacticId: string) => {
    if (!clubId) return '#';
    if (teamId && ageGroupId) {
      return Routes.teamTacticEdit(clubId, ageGroupId, teamId, tacticId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTacticEdit(clubId, ageGroupId, tacticId);
    }
    return Routes.clubTacticEdit(clubId, tacticId);
  };

  const getScopeLabel = () => {
    if (teamId) return 'Team';
    if (ageGroupId) return 'Age Group';
    return 'Club';
  };

  const tactics = tacticsData?.scopeTactics || [];
  const inheritedTactics = tacticsData?.inheritedTactics || [];
  const allTactics = [
    ...tactics.map(t => ({ tactic: t, inheritedFrom: undefined as string | undefined })),
    ...inheritedTactics.map(t => ({ tactic: t, inheritedFrom: t.scope.type === 'club' ? 'Club' : 'Age Group' })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title="Formations"
          subtitle={`Manage tactical setups for your ${getScopeLabel().toLowerCase()}`}
          action={{
            label: 'New Tactic',
            href: getNewTacticUrl(),
            icon: 'plus',
            variant: 'success'
          }}
        />

        <div className="space-y-6">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
              <p className="text-red-700 dark:text-red-300">
                Failed to load tactics: {error.message}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <TacticCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Combined tactics grid */}
          {!isLoading && !error && (
            allTactics.length === 0 ? (
              <EmptyState
                icon={LayoutGrid}
                title="No tactics yet"
                description="Create your first tactic to get started."
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {allTactics.map(({ tactic, inheritedFrom }) => (
                  <TacticCard
                    key={tactic.id}
                    tactic={tactic}
                    href={getTacticDetailUrl(tactic.id)}
                    editHref={getTacticEditUrl(tactic.id)}
                    inheritedFrom={inheritedFrom}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
