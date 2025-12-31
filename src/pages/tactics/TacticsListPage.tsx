import { Link, useParams } from 'react-router-dom';
import { Settings2, Users } from 'lucide-react';
import { sampleTactics, getResolvedPositions } from '@/data/tactics';
import { getFormationById } from '@/data/formations';
import { Routes } from '@/utils/routes';
import TacticDisplay from '@/components/tactics/TacticDisplay';
import PageTitle from '@/components/common/PageTitle';

export default function TacticsListPage() {
  const { clubId, ageGroupId, teamId } = useParams();

  // Determine the scope type
  const scopeType = teamId ? 'team' : ageGroupId ? 'ageGroup' : 'club';

  // Filter tactics by scope
  const tactics = sampleTactics.filter(tactic => {
    const scope = tactic.scope;
    
    // Club level - show club tactics
    if (scopeType === 'club' && scope.type === 'club' && scope.clubId === clubId) {
      return true;
    }
    
    // Age group level - show age group tactics
    if (scopeType === 'ageGroup' && scope.type === 'ageGroup' && 
        scope.clubId === clubId && scope.ageGroupId === ageGroupId) {
      return true;
    }
    
    // Team level - show team tactics
    if (scopeType === 'team' && scope.type === 'team' && 
        scope.clubId === clubId && scope.ageGroupId === ageGroupId && scope.teamId === teamId) {
      return true;
    }
    
    return false;
  });

  // Get inherited tactics (parent scope tactics)
  const inheritedTactics = sampleTactics.filter(tactic => {
    const scope = tactic.scope;
    
    // For team scope, include club and age group tactics
    if (scopeType === 'team') {
      if (scope.type === 'club' && scope.clubId === clubId) return true;
      if (scope.type === 'ageGroup' && scope.clubId === clubId && scope.ageGroupId === ageGroupId) return true;
    }
    
    // For age group scope, include club tactics
    if (scopeType === 'ageGroup') {
      if (scope.type === 'club' && scope.clubId === clubId) return true;
    }
    
    return false;
  });

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

  const getScopeLabel = () => {
    if (teamId) return 'Team';
    if (ageGroupId) return 'Age Group';
    return 'Club';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-4">
        <PageTitle
          title="Tactics"
          subtitle={`Manage tactical setups for your ${getScopeLabel().toLowerCase()}`}
          action={{
            label: 'New Tactic',
            href: getNewTacticUrl(),
            icon: 'plus',
            variant: 'success'
          }}
        />

        <div className="space-y-6">
          {/* Current Scope Tactics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              {getScopeLabel()} Tactics ({tactics.length})
            </h2>
          
          {tactics.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No tactics created yet. Create your first tactic to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tactics.map(tactic => {
              const formation = getFormationById(tactic.parentFormationId || '');
              const resolvedPositions = getResolvedPositions(tactic);
              
              return (
                <Link
                  key={tactic.id}
                  to={getTacticDetailUrl(tactic.id)}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow h-28"
                >
                  <div className="flex h-full">
                    {/* Small pitch on left */}
                    <div className="w-20 flex-shrink-0 h-full">
                      <TacticDisplay
                        tactic={tactic}
                        resolvedPositions={resolvedPositions}
                        showDirections={false}
                        showInheritance={false}
                        compact={true}
                      />
                    </div>
                    {/* Content on right */}
                    <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{tactic.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {formation?.name || 'Unknown Formation'}
                      </p>
                      {tactic.summary && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                          {tactic.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        </div>

        {/* Inherited Tactics */}
        {inheritedTactics.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Inherited Tactics ({inheritedTactics.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inheritedTactics.map(tactic => {
                const formation = getFormationById(tactic.parentFormationId || '');
                const resolvedPositions = getResolvedPositions(tactic);
                const scopeLabel = tactic.scope.type === 'club' ? 'Club' : 'Age Group';
                
                return (
                  <div
                    key={tactic.id}
                    className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden opacity-75 h-28"
                  >
                    <div className="flex h-full">
                      {/* Small pitch on left */}
                      <div className="w-20 flex-shrink-0 h-full">
                        <TacticDisplay
                          tactic={tactic}
                          resolvedPositions={resolvedPositions}
                          showDirections={false}
                          showInheritance={false}
                          compact={true}
                        />
                      </div>
                      {/* Content on right */}
                      <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{tactic.name}</h3>
                          <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded flex-shrink-0">
                            {scopeLabel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {formation?.name || 'Unknown Formation'}
                        </p>
                        {tactic.summary && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                            {tactic.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
