import React from 'react';
import { Link } from 'react-router-dom';

interface PlayerPerformance {
  playerId: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  matchesPlayed: number;
}

interface TopPerformersCardProps {
  performers: PlayerPerformance[];
  getPlayerLink: (playerId: string, firstName: string, lastName: string) => string;
}

const TopPerformersCard: React.FC<TopPerformersCardProps> = ({ 
  performers, 
  getPlayerLink 
}) => {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top Performers</h3>
      {performers.length > 0 ? (
        <div className="space-y-2">
          {performers.map((perf) => (
            <div 
              key={perf.playerId} 
              className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <div>
                <Link
                  to={getPlayerLink(perf.playerId, perf.firstName, perf.lastName)}
                  className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {perf.firstName} {perf.lastName}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400">{perf.matchesPlayed} matches</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {perf.averageRating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">avg rating</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
      )}
    </div>
  );
};

export default TopPerformersCard;
