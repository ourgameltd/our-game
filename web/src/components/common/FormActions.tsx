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
            className={`btn btn-md whitespace-nowrap ${
              isArchived
                ? 'btn-secondary'
                : 'btn-outline-danger'
            }`}
          >
            {isArchived ? 'Unarchive' : 'Archive'}
          </button>
        )}
      </div>
      
      {/* Right side - Cancel and Save buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-md btn-secondary"
        >
          Cancel
        </button>
        {showSave && (
          <button
            type="submit"
            disabled={saveDisabled}
            className="btn btn-md btn-primary"
          >
            {saveLabel}
          </button>
        )}
      </div>
    </div>
  );
}
