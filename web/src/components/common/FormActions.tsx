interface FormActionsProps {
  /** Whether the entity is currently archived */
  isArchived?: boolean;
  /** Callback for archive/unarchive action */
  onArchive?: () => void;
  /** Callback for cancel action */
  onCancel: () => void;
  /** Label for the save button (default: "Save Changes") */
  saveLabel?: string;
  /** Whether the save button should be disabled */
  saveDisabled?: boolean;
  /** Show archive button (default: true if onArchive is provided) */
  showArchive?: boolean;
  /** Show save button (default: true) */
  showSave?: boolean;
}

/**
 * Reusable form action buttons component
 * Displays Archive/Unarchive, Save, and Cancel buttons
 * Delete functionality is removed - archive is the only option for removing entities
 * 
 * Note: The Save button is type="submit", so it will trigger the parent form's onSubmit handler
 */
export default function FormActions({
  isArchived = false,
  onArchive,
  onCancel,
  saveLabel = 'Save Changes',
  saveDisabled = false,
  showArchive = true,
  showSave = true
}: FormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
      {/* Left side - Archive/Unarchive button */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        {showArchive && onArchive && (
          <button
            type="button"
            onClick={onArchive}
            className={`px-4 sm:px-6 py-2 text-sm sm:text-base ${
              isArchived
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-orange-600 hover:bg-orange-700'
            } text-white rounded-lg transition-colors whitespace-nowrap`}
          >
            {isArchived ? '📂 Unarchive' : '🗄️ Archive'}
          </button>
        )}
      </div>
      
      {/* Right side - Cancel and Save buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        {showSave && (
          <button
            type="submit"
            disabled={saveDisabled}
            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          >
            {saveLabel}
          </button>
        )}
      </div>
    </div>
  );
}
