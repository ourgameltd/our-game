import { Link, useLocation, useParams } from 'react-router-dom';
import { User, BarChart3 } from 'lucide-react';
import { Routes } from '@utils/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessProfile } from '@/hooks/useAccessProfile';
import { canViewPlayerAbilities } from '@/utils/accessControl';

export default function PlayerSubNav() {
  const { clubId, ageGroupId, teamId, playerId } = useParams();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { profile } = useAccessProfile(isAdmin);

  if (!clubId || !playerId) return null;

  const profileLink = teamId && ageGroupId
    ? Routes.teamPlayer(clubId, ageGroupId, teamId, playerId)
    : ageGroupId
      ? Routes.player(clubId, ageGroupId, playerId)
      : null;

  const abilitiesLink = teamId && ageGroupId
    ? Routes.teamPlayerAbilities(clubId, ageGroupId, teamId, playerId)
    : ageGroupId
      ? Routes.playerAbilities(clubId, ageGroupId, playerId)
      : null;

  if (!profileLink) return null;

  const isAbilitiesPage = location.pathname.includes('/abilities');
  const isProfilePage = !isAbilitiesPage && !location.pathname.includes('/settings') && !location.pathname.includes('/album');

  const tabs = [
    { label: 'Overview', href: profileLink, active: isProfilePage, Icon: User },
    ...(abilitiesLink && canViewPlayerAbilities(profile)
      ? [{ label: 'Abilities', href: abilitiesLink, active: isAbilitiesPage, Icon: BarChart3 }]
      : []),
  ];

  return (
    <div className="flex justify-evenly sm:justify-start sm:flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
      {tabs.map((tab) => {
        const Icon = tab.Icon;
        return (
          <Link
            key={tab.label}
            to={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab.active
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
