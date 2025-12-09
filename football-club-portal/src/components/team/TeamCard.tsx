import { Team } from '@/types';
import { getAgeGroupById } from '@data/ageGroups';

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
}

export default function TeamCard({ team, onClick }: TeamCardProps) {
  const ageGroup = getAgeGroupById(team.ageGroupId);
  const levelColors = {
    youth: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    amateur: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    reserve: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    senior: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  return (
    <div 
      className={`card-hover ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{ageGroup?.name || 'N/A'}</p>
        </div>
        <span className={`badge ${levelColors[team.level]}`}>
          {team.level.charAt(0).toUpperCase() + team.level.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{team.playerIds.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">Players</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{team.coachIds.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">Coaches</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{team.season}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">Season</div>
        </div>
      </div>
    </div>
  );
}
