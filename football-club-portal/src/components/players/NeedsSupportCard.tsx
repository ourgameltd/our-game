import React from 'react';
import { Link } from 'react-router-dom';

interface PlayerPerformance {
  playerId: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  matchesPlayed: number;
}

interface NeedsSupportCardProps {
  performers: PlayerPerformance[];
  getPlayerLink: (playerId: string, firstName: string, lastName: string) => string;
}

const NeedsSupportCard: React.FC<NeedsSupportCardProps> = ({ 
  performers, 
  getPlayerLink 
}) => {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Needs Support</h3>
      {performers.length > 0 ? (
        <div className="space-y-3">
          {performers.map((perf) => (
            <div 
              key={perf.playerId} 
              className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
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
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {perf.averageRating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">avg rating</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Players performing well!</p>
      )}
    </div>
  );
};

export default NeedsSupportCard;
