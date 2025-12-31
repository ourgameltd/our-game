import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  backLink?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'success' | 'danger' | 'warning';
    icon?: string;
    title?: string;
  };
}

export default function PageTitle({ title, subtitle, badge, backLink, action }: PageTitleProps) {
  const getActionButtonClass = (variant: string = 'primary') => {
    const baseClass = 'btn-md';
    const variantClass = {
      primary: 'btn-primary',
      success: 'btn-success',
      danger: 'btn-danger',
      warning: 'btn-warning',
    }[variant] || 'btn-primary';
    
    return `${baseClass} ${variantClass}`;
  };

  return (
    <div className="flex items-center justify-between mb-6 w-full">
      <div className="flex items-start gap-3">
        {backLink && (
          <Link
            to={backLink}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-0.5"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
            {badge !== undefined && (
              <span className="ml-2 text-base font-normal text-gray-600 dark:text-gray-400">
                ({badge})
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        action.href ? (
          <Link
            to={action.href}
            className={`${getActionButtonClass(action.variant)} whitespace-nowrap flex items-center gap-2`}
            title={action.title || action.label}
          >
            {action.icon === 'plus' ? (
              <Plus className="w-5 h-5" />
            ) : action.icon === 'settings' ? (
              <Settings className="w-5 h-5" />
            ) : null}
            {action.icon ? null : action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className={`${getActionButtonClass(action.variant)} whitespace-nowrap flex items-center gap-2`}
            title={action.title || action.label}
          >
            {action.icon === 'plus' ? (
              <Plus className="w-5 h-5" />
            ) : action.icon === 'settings' ? (
              <Settings className="w-5 h-5" />
            ) : (
              action.label
            )}
          </button>
        )
      )}
    </div>
  );
}
