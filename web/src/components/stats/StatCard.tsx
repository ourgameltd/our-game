import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'danger' | 'primary';
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  subtitle, 
  variant = 'default',
  onClick,
  className = ''
}) => {
  const variantClasses = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    primary: 'text-primary-600 dark:text-primary-400'
  };

  const baseClass = onClick ? 'card hover:shadow-md transition-shadow cursor-pointer' : 'card';

  return (
    <div className={`${baseClass} ${className}`} onClick={onClick}>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${variantClasses[variant]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
};

export default StatCard;
