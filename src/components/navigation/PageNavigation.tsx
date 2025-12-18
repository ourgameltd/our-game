import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface NavigationTab {
  label: string;
  path: string;
}

interface PageNavigationProps {
  tabs: NavigationTab[];
}

const PageNavigation: React.FC<PageNavigationProps> = ({ tabs }) => {
  const location = useLocation();
  
  const isActiveTab = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky z-30" style={{ top: '64px' }}>
      <div className="container mx-auto px-4">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`py-4 border-b-2 font-medium whitespace-nowrap ${
                isActiveTab(tab.path)
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default PageNavigation;
