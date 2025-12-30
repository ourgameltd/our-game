import { PlayerRelationship } from '@/types';

interface RelationshipDrawerProps {
  relationships: PlayerRelationship[];
  onAddRelationship?: () => void;
  onDeleteRelationship?: (relationshipId: string) => void;
}

/**
 * Placeholder component for RelationshipDrawer
 * This component will overlay on the pitch to show/edit relationships
 * TODO: Implement full relationship editing with visual connections on pitch
 */
export default function RelationshipDrawer({
  relationships,
  onAddRelationship,
  onDeleteRelationship
}: RelationshipDrawerProps) {
  const relationshipTypeColors: Record<string, string> = {
    'passing-lane': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    'overlap': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    'press-trigger': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    'support': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    'cover': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Relationships
        </h3>
        <button
          onClick={onAddRelationship}
          className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
        >
          Add Relationship
        </button>
      </div>

      {relationships.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
          No relationships defined yet
        </p>
      ) : (
        <div className="space-y-3">
          {relationships.map((relationship) => (
            <div
              key={relationship.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {relationship.fromPosition} → {relationship.toPosition}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${relationshipTypeColors[relationship.type]}`}>
                    {relationship.type.replace('-', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteRelationship?.(relationship.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {relationship.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
