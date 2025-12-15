import { Link } from 'react-router-dom';
import { Routes } from '@utils/routes';
import { getMatchById } from '@data/matches';
import { getTeamById } from '@data/teams';

interface PerformanceData {
  matchId: string;
  opposition: string;
  date: Date;
  rating: number;
  isHome: boolean;
}

interface RecentPerformanceCardProps {
  performances: PerformanceData[];
  clubId: string;
}

export default function RecentPerformanceCard({ 
  performances, 
  clubId
}: RecentPerformanceCardProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'green';
    if (rating >= 7.0) return 'yellow';
    return 'red';
  };

  const getRatingClasses = (rating: number) => {
    const color = getRatingColor(rating);
    return {
      bg: color === 'green' 
        ? 'bg-green-50 dark:bg-green-900/20' 
        : color === 'yellow' 
        ? 'bg-yellow-50 dark:bg-yellow-900/20' 
        : 'bg-red-50 dark:bg-red-900/20',
      border: color === 'green'
        ? 'border-green-200 dark:border-green-800'
        : color === 'yellow'
        ? 'border-yellow-200 dark:border-yellow-800'
        : 'border-red-200 dark:border-red-800',
      text: color === 'green'
        ? 'text-green-600 dark:text-green-400'
        : color === 'yellow'
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-600 dark:text-red-400'
    };
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Recent Performance</h3>
      <div className="space-y-3">
        {performances.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No recent performances recorded
          </p>
        ) : (
          performances.map((performance) => {
            const classes = getRatingClasses(performance.rating);
            const match = getMatchById(performance.matchId);
            const team = match ? getTeamById(match.teamId) : null;
            const matchLink = match && team 
              ? Routes.matchReport(clubId, team.ageGroupId, team.id, performance.matchId)
              : '#';
            
            return (
              <Link
                key={performance.matchId}
                to={matchLink}
                className={`flex items-center justify-between p-3 rounded-lg border ${classes.bg} ${classes.border} hover:shadow-md transition-shadow`}
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {performance.isHome ? 'vs' : '@'} {performance.opposition}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {performance.date.toLocaleDateString('en-GB', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${classes.text}`}>
                    {performance.rating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
