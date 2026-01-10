import { Link, useParams } from 'react-router-dom';
import { Settings2, Users } from 'lucide-react';
import { sampleTactics } from '@/data/tactics';
import { getFormationById } from '@/data/formations';
import { Routes } from '@/utils/routes';
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

        <div className="space-y-2">
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
          <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {tactics.map(tactic => {
              const formation = getFormationById(tactic.parentFormationId || '');
              
              return (
                <Link
                  key={tactic.id}
                  to={getTacticDetailUrl(tactic.id)}
                  className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    {/* Name */}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base md:w-64 md:flex-shrink-0 truncate">
                      {tactic.name}
                    </h3>
                    
                    {/* Formation */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 md:w-48 md:flex-shrink-0 truncate">
                      {formation?.name || 'Unknown Formation'}
                    </p>
                    
                    {/* Summary */}
                    {tactic.summary && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 md:flex-1 md:min-w-0 truncate">
                        {tactic.summary}
                      </p>
                    )}
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
            <div className="grid grid-cols-1 gap-3 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
              {inheritedTactics.map(tactic => {
                const formation = getFormationById(tactic.parentFormationId || '');
                const scopeLabel = tactic.scope.type === 'club' ? 'Club' : 'Age Group';
                
                return (
                  <div
                    key={tactic.id}
                    className="block bg-white dark:bg-gray-800 rounded-lg md:rounded-none p-4 md:px-4 md:py-3 border border-gray-200 dark:border-gray-700 md:border-0 md:border-b md:last:border-b-0 opacity-75"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      {/* Name with scope badge */}
                      <div className="flex items-center gap-2 md:w-64 md:flex-shrink-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base flex-1 truncate">
                          {tactic.name}
                        </h3>
                        <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded flex-shrink-0">
                          {scopeLabel}
                        </span>
                      </div>
                      
                      {/* Formation */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 md:w-48 md:flex-shrink-0 truncate">
                        {formation?.name || 'Unknown Formation'}
                      </p>
                      
                      {/* Summary */}
                      {tactic.summary && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 md:flex-1 md:min-w-0 truncate">
                          {tactic.summary}
                        </p>
                      )}
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
