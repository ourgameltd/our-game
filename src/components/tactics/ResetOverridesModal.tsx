interface ResetOverridesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  overrideCount: number;
  relationshipCount: number;
}

/**
 * Modal to confirm resetting position overrides when changing parent formation
 */
export default function ResetOverridesModal({
  isOpen,
  onConfirm,
  onCancel,
  overrideCount,
  relationshipCount
}: ResetOverridesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Reset Position Overrides?
        </h2>
        
        <div className="space-y-3 mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            Changing the parent formation will reset all position overrides and relationships.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>This will remove:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 mt-2 space-y-1">
              {overrideCount > 0 && (
                <li>{overrideCount} position override{overrideCount !== 1 ? 's' : ''}</li>
              )}
              {relationshipCount > 0 && (
                <li>{relationshipCount} relationship{relationshipCount !== 1 ? 's' : ''}</li>
              )}
            </ul>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to continue?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reset & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
