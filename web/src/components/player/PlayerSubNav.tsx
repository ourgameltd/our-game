import { Link, useLocation, useParams } from 'react-router-dom';
import { Routes } from '@utils/routes';

export default function PlayerSubNav() {
  const { clubId, ageGroupId, teamId, playerId } = useParams();
  const location = useLocation();

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

  if (!profileLink || !abilitiesLink) return null;

  const isAbilitiesPage = location.pathname.includes('/abilities');
  const isProfilePage = !isAbilitiesPage && !location.pathname.includes('/settings') && !location.pathname.includes('/album');

  const tabs = [
    { label: 'Overview', href: profileLink, active: isProfilePage },
    { label: 'Abilities', href: abilitiesLink, active: isAbilitiesPage },
  ];

  return (
    <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          to={tab.href}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab.active
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
