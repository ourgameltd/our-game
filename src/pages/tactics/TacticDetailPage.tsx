import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { getTacticById, getResolvedPositions } from '@/data/tactics';
import { getFormationById } from '@/data/formations';
import { Routes } from '@/utils/routes';
import TacticDisplay from '@/components/tactics/TacticDisplay';

export default function TacticDetailPage() {
  const { clubId, ageGroupId, teamId, tacticId } = useParams();

  const tactic = tacticId ? getTacticById(tacticId) : undefined;
  const formation = tactic ? getFormationById(tactic.parentFormationId) : undefined;
  const resolvedPositions = tactic ? getResolvedPositions(tactic) : [];

  const getBackUrl = () => {
    if (!clubId) return '/dashboard';
    if (teamId && ageGroupId) {
      return Routes.teamTactics(clubId, ageGroupId, teamId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTactics(clubId, ageGroupId);
    }
    return Routes.clubTactics(clubId);
  };

  const getEditUrl = () => {
    if (!clubId || !tacticId) return '#';
    if (teamId && ageGroupId) {
      return Routes.teamTacticEdit(clubId, ageGroupId, teamId, tacticId);
    }
    if (ageGroupId) {
      return Routes.ageGroupTacticEdit(clubId, ageGroupId, tacticId);
    }
    return Routes.clubTacticEdit(clubId, tacticId);
  };

  if (!tactic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Tactic not found</p>
        <Link to={getBackUrl()} className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Tactics
        </Link>
      </div>
    );
  }

  const getScopeLabel = () => {
    switch (tactic.scope.type) {
      case 'club': return 'Club';
      case 'ageGroup': return 'Age Group';
      case 'team': return 'Team';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to={getBackUrl()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tactic.name}</h1>
              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                {getScopeLabel()}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {formation?.name || 'Unknown Formation'} • {tactic.squadSize}-a-side
              {tactic.style && ` • ${tactic.style}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={getEditUrl()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pitch Display */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Formation View</h2>
          <TacticDisplay
            tactic={tactic}
            resolvedPositions={resolvedPositions}
            showRelationships={true}
            showDirections={true}
            showInheritance={true}
          />
        </div>

        {/* Tactic Details */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{tactic.summary}</p>
          </div>

          {/* Position Overrides */}
          {Object.keys(tactic.positionOverrides).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Position Customizations ({Object.keys(tactic.positionOverrides).length})
              </h2>
              <div className="space-y-4">
                {Object.entries(tactic.positionOverrides).map(([index, override]) => {
                  const posIndex = parseInt(index, 10);
                  const position = formation?.positions[posIndex];
                  
                  return (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded">
                          {position?.position || `Position ${posIndex}`}
                        </span>
                        {override.direction && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded capitalize">
                            {override.direction}
                          </span>
                        )}
                      </div>
                      {override.roleDescription && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {override.roleDescription}
                        </p>
                      )}
                      {override.keyResponsibilities && override.keyResponsibilities.length > 0 && (
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                          {override.keyResponsibilities.map((resp, i) => (
                            <li key={i}>{resp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Relationships */}
          {tactic.relationships.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Relationships ({tactic.relationships.length})
              </h2>
              <div className="space-y-3">
                {tactic.relationships.map((rel, index) => {
                  const fromPos = formation?.positions[rel.fromPositionIndex];
                  const toPos = formation?.positions[rel.toPositionIndex];
                  
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded">
                        {fromPos?.position || `#${rel.fromPositionIndex}`}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded">
                        {toPos?.position || `#${rel.toPositionIndex}`}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded capitalize">
                        {rel.type.replace('-', ' ')}
                      </span>
                      {rel.description && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          {rel.description}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {tactic.tags && tactic.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tactic.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
