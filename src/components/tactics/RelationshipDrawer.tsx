import { useState } from 'react';
import { X } from 'lucide-react';
import { PlayerRelationship, RelationshipType } from '@/types';

interface RelationshipDrawerProps {
  relationships: PlayerRelationship[];
  positions: string[]; // Array of position labels
  onUpdate: (relationship: PlayerRelationship, index: number) => void;
  onRemove: (index: number) => void;
  className?: string;
}

const relationshipTypes: { value: RelationshipType; label: string; description: string }[] = [
  {
    value: 'pass-and-move',
    label: 'Pass & Move',
    description: 'Player passes and moves into space',
  },
  {
    value: 'overlap',
    label: 'Overlap',
    description: 'Player runs beyond teammate',
  },
  {
    value: 'switch',
    label: 'Switch',
    description: 'Players switch positions',
  },
  {
    value: 'cover',
    label: 'Cover',
    description: 'Player provides defensive cover',
  },
  {
    value: 'press-together',
    label: 'Press Together',
    description: 'Players press as a unit',
  },
  {
    value: 'triangle',
    label: 'Triangle',
    description: 'Form passing triangle',
  },
  {
    value: 'give-and-go',
    label: 'Give & Go',
    description: 'Quick one-two passing',
  },
];

export default function RelationshipDrawer({
  relationships,
  positions,
  onUpdate,
  onRemove,
  className = '',
}: RelationshipDrawerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editType, setEditType] = useState<RelationshipType>('pass-and-move');
  const [editDescription, setEditDescription] = useState('');

  const handleEdit = (index: number) => {
    const rel = relationships[index];
    setEditingIndex(index);
    setEditType(rel.type);
    setEditDescription(rel.description || '');
  };

  const handleSave = (index: number) => {
    const rel = relationships[index];
    onUpdate(
      {
        ...rel,
        type: editType,
        description: editDescription || undefined,
      },
      index
    );
    setEditingIndex(null);
    setEditDescription('');
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditDescription('');
  };

  const getRelationshipTypeInfo = (type: RelationshipType) => {
    return relationshipTypes.find((rt) => rt.value === type);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Player Relationships
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Shift+Click positions on the pitch to create relationships
        </p>
      </div>

      <div className="p-4">
        {relationships.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No relationships defined yet</p>
            <p className="text-xs mt-1">Hold Shift and click two positions to create one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {relationships.map((rel, index) => {
              const isEditing = editingIndex === index;
              const typeInfo = getRelationshipTypeInfo(rel.type);
              const fromPos = positions[rel.fromPositionIndex] || `Position ${rel.fromPositionIndex}`;
              const toPos = positions[rel.toPositionIndex] || `Position ${rel.toPositionIndex}`;

              return (
                <div
                  key={rel.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {isEditing ? (
                    // Edit mode
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Relationship Type
                          </label>
                          <div className="space-y-2">
                            {relationshipTypes.map((rt) => (
                              <label
                                key={rt.value}
                                className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                                style={{
                                  borderColor: editType === rt.value ? '#3b82f6' : 'transparent',
                                  backgroundColor: editType === rt.value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`relationship-type-${index}`}
                                  value={rt.value}
                                  checked={editType === rt.value}
                                  onChange={(e) => setEditType(e.target.value as RelationshipType)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                                    {rt.label}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {rt.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description (optional)
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Add additional details about this relationship..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(index)}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                              {fromPos}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                              {toPos}
                            </span>
                          </div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {typeInfo?.label || rel.type}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {typeInfo?.description}
                          </div>
                          {rel.description && (
                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                              {rel.description}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(index)}
                            className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onRemove(index)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Remove relationship"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
