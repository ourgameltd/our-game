import { Link, useParams } from 'react-router-dom';
import { Plus, Settings2, Users } from 'lucide-react';
import { sampleTactics, getResolvedPositions } from '@/data/tactics';
import { getFormationById } from '@/data/formations';
import { Routes } from '@/utils/routes';
import TacticDisplay from '@/components/tactics/TacticDisplay';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tactics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage tactical setups for your {getScopeLabel().toLowerCase()}
          </p>
        </div>
        <Link
          to={getNewTacticUrl()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Tactic
        </Link>
      </div>

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
              const formation = getFormationById(tactic.parentFormationId);
              const resolvedPositions = getResolvedPositions(tactic);
              
              return (
                <Link
                  key={tactic.id}
                  to={getTacticDetailUrl(tactic.id)}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[3/4] relative">
                    <TacticDisplay
                      tactic={tactic}
                      resolvedPositions={resolvedPositions}
                      showRelationships={true}
                      showDirections={false}
                      showInheritance={false}
                    />
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tactic.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formation?.name || 'Unknown Formation'} • {tactic.style || 'No style'}
                    </p>
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
              const formation = getFormationById(tactic.parentFormationId);
              const resolvedPositions = getResolvedPositions(tactic);
              const scopeLabel = tactic.scope.type === 'club' ? 'Club' : 'Age Group';
              
              return (
                <div
                  key={tactic.id}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden opacity-75"
                >
                  <div className="aspect-[3/4] relative">
                    <TacticDisplay
                      tactic={tactic}
                      resolvedPositions={resolvedPositions}
                      showRelationships={true}
                      showDirections={false}
                      showInheritance={false}
                    />
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {scopeLabel}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-2">{tactic.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formation?.name || 'Unknown Formation'} • {tactic.style || 'No style'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
