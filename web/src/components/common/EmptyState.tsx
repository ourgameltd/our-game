import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** Lucide icon component to display above the title. */
  icon: LucideIcon;
  /** Primary heading text. */
  title: string;
  /** Optional supporting description shown beneath the title. */
  description?: ReactNode;
  /** Optional action(s) (e.g. button or link) rendered beneath the description. */
  action?: ReactNode;
  /** Additional classes applied to the root container. */
  className?: string;
}

/**
 * Shared empty-state block used by list pages when there is nothing to show.
 *
 * Keeps icon size, spacing and typography consistent across the app.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`card text-center py-12 ${className}`.trim()}>
      <Icon
        className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
