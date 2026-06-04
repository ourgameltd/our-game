import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  backLink?: string;
  backState?: unknown;
  image?: {
    src?: string;
    alt: string;
    initials?: string;
    colorClass?: string;
  };
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'success' | 'danger' | 'warning';
    icon?: string;
    title?: string;
  };
}

export default function PageTitle({ title, subtitle, badge, backLink, backState, image, action }: PageTitleProps) {
  const getActionButtonClass = (variant: string = 'primary') => {
    const baseClass = 'btn btn-md';
    const variantClass = {
      primary: 'btn-primary',
      success: 'btn-success',
      danger: 'btn-danger',
      warning: 'btn-outline-danger',
    }[variant] || 'btn-primary';
    
    return `${baseClass} ${variantClass}`;
  };

  const renderActionIcon = (icon?: string) => {
    if (icon === 'plus') {
      return <Plus className="w-4 h-4" />;
    }

    if (icon === 'settings') {
      return <Settings className="w-4 h-4" />;
    }

    return null;
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-4 w-full">
      <div className="flex items-center gap-3">
        {backLink && (
          <Link
            to={backLink}
            state={backState}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
        )}
        {image && (
          image.src ? (
            <img 
              src={image.src} 
              alt={image.alt}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${image.colorClass || 'from-primary-500 to-primary-600'} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
              {image.initials}
            </div>
          )
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
            className={`${getActionButtonClass(action.variant)} btn-icon`}
            title={action.title || action.label}
            aria-label={action.title || action.label}
          >
            {renderActionIcon(action.icon)}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className={`${getActionButtonClass(action.variant)} btn-icon`}
            title={action.title || action.label}
            aria-label={action.title || action.label}
          >
            {renderActionIcon(action.icon)}
          </button>
        )
      )}
    </div>
  );
}
