import { ReactNode } from 'react';

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
  /** Optional custom action shown on the left side (e.g., Delete) */
  customAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline-danger' | 'success';
    icon?: ReactNode;
  };
}

/**
 * Reusable form action buttons component
 * Displays Archive/Unarchive, Save, and Cancel buttons
 * Supports an optional custom action on the left side for contexts like hard delete
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
  showSave = true,
  customAction
}: FormActionsProps) {
  const customActionVariantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    'outline-danger': 'btn-outline-danger',
    success: 'btn-success',
  }[customAction?.variant || 'secondary'];

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
      {/* Left side - Archive/Unarchive and custom action */}
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

        {customAction && (
          <button
            type="button"
            onClick={customAction.onClick}
            className={`btn btn-md whitespace-nowrap ${customActionVariantClass}`}
          >
            {customAction.icon && (
              <span className="inline-flex items-center mr-1.5">{customAction.icon}</span>
            )}
            {customAction.label}
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
