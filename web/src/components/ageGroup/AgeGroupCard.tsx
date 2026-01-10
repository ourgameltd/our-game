import React from 'react';
import { AgeGroup } from '../../types';

interface AgeGroupCardProps {
  ageGroup: AgeGroup;
  clubId: string;
  clubName: string;
  stats?: {
    teamCount: number;
    playerCount: number;
    winRate: number;
  };
  onClick?: () => void;
}

const AgeGroupCard: React.FC<AgeGroupCardProps> = ({ ageGroup, stats, onClick }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'senior':
        return 'from-primary-600 to-primary-800';
      case 'reserve':
        return 'from-blue-600 to-blue-800';
      case 'amateur':
        return 'from-green-600 to-green-800';
      default:
        return 'from-purple-600 to-purple-800';
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${
        ageGroup.isArchived ? 'opacity-75 border-2 border-orange-200 dark:border-orange-800' : ''
      }`}
      onClick={onClick}
    >
      <div className={`p-6 text-white bg-gradient-to-br ${getLevelColor(ageGroup.level)} relative`}>
        {ageGroup.isArchived && (
          <div className="absolute top-2 right-2">
            <span className="badge bg-orange-100 text-orange-800 text-xs">
              🗄️ Archived
            </span>
          </div>
        )}
        <h3 className="text-2xl font-bold mb-1">{ageGroup.name}</h3>
        <p className="text-sm opacity-90">{ageGroup.description}</p>
      </div>
      
      {stats && (
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teams</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.teamCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Players</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.playerCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Win Rate</p>
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{stats.winRate}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgeGroupCard;
