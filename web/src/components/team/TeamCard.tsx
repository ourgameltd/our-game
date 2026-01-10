import { Team } from '@/types';
import { getAgeGroupById } from '@data/ageGroups';
import { getClubById } from '@data/clubs';
import { getGradientColors, getContrastTextColorClass } from '@utils/colorHelpers';

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
}

export default function TeamCard({ team, onClick }: TeamCardProps) {
  const ageGroup = getAgeGroupById(team.ageGroupId);
  const club = getClubById(team.clubId);
  
  if (!club) return null;
  
  const { primaryColor, secondaryColor } = getGradientColors(club, team);
  const textColorClass = getContrastTextColorClass(primaryColor);

  return (
    <div 
      className={`overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${
        team.isArchived ? 'opacity-75 border-2 border-orange-200 dark:border-orange-800' : ''
      }`}
      onClick={onClick}
    >
      {/* Gradient Header */}
      <div 
        className="p-4"
        style={{
          backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-semibold ${textColorClass}`}>
              {team.name} <span className="text-sm font-normal opacity-70">{ageGroup ? ageGroup.name : ''}</span>
            </h3>
            {team.isArchived && (
              <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs">
                🗄️ Archived
              </span>
            )}
          </div>
          <span className={`badge bg-white/20 backdrop-blur-sm ${textColorClass} border border-white/30`}>
            {team.level.charAt(0).toUpperCase() + team.level.slice(1)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-white dark:bg-gray-800 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{team.playerIds.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{team.coachIds.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Coaches</div>
          </div>
        </div>
      </div>
    </div>
  );
}
