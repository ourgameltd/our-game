import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserCog, Filter, X } from 'lucide-react';
import { apiClient } from '@/api';
import type { AgeGroupCoachDto, AgeGroupDetailDto } from '@/api';
import type { Coach } from '@/types';
import CoachCard from '@components/coach/CoachCard';
import PageTitle from '@components/common/PageTitle';
import EmptyState from '@components/common/EmptyState';
import { Routes } from '@utils/routes';
import { useRequiredParams } from '@utils/routeParams';
import { usePageTitle } from '@/hooks/usePageTitle';
import { parseDateOfBirth } from '@/utils/dateOfBirth';

export default function AgeGroupCoachesPage() {
  usePageTitle(['Age Group Coaches']);

  const params = useRequiredParams(['clubId', 'ageGroupId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const ageGroupId = params.ageGroupId;
  
  const [ageGroup, setAgeGroup] = useState<AgeGroupDetailDto | null>(null);
  const [ageGroupLoading, setAgeGroupLoading] = useState(true);
  const [ageGroupError, setAgeGroupError] = useState<string | null>(null);

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesError, setCoachesError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState('');

  useEffect(() => {
    if (!clubId || !ageGroupId) return;

    // Fetch age group data
    setAgeGroupLoading(true);
    apiClient.ageGroups.getById(ageGroupId)
      .then((response) => {
        if (response.success && response.data) {
          setAgeGroup(response.data);
          setAgeGroupError(null);
        } else {
          setAgeGroupError(response.error?.message || 'Failed to load age group');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch age group:', err);
        setAgeGroupError('Failed to load age group from API');
      })
      .finally(() => setAgeGroupLoading(false));

    // Fetch coaches data
    setCoachesLoading(true);
    apiClient.ageGroups.getCoachesByAgeGroupId(ageGroupId)
      .then((response) => {
        if (response.success && response.data) {
          // Map AgeGroupCoachDto to Coach type
          const mappedCoaches = response.data.map(mapCoachDtoToCoach);
          setCoaches(mappedCoaches);
          setCoachesError(null);
        } else {
          setCoachesError(response.error?.message || 'Failed to load coaches');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch coaches:', err);
        setCoachesError('Failed to load coaches from API');
      })
      .finally(() => setCoachesLoading(false));
  }, [clubId, ageGroupId]);

  const mapCoachDtoToCoach = (dto: AgeGroupCoachDto): Coach => {
    const dateOfBirth = parseDateOfBirth(dto.dateOfBirth);
    const teamIds = dto.teams.map(team => team.id);

    return {
      id: dto.id,
      clubId: dto.clubId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth,
      photo: dto.photo,
      email: dto.email || '',
      phone: dto.phone || '',
      associationId: dto.associationId,
      hasAccount: dto.hasAccount,
      teamIds,
      clubRoles: dto.clubRoles,
      badges: dto.badges,
      biography: dto.biography,
      specializations: dto.specializations,
      isArchived: dto.isArchived
    };
  };

  const filteredCoaches = useMemo(() => {
    if (!nameFilter.trim()) return coaches;
    const q = nameFilter.toLowerCase();
    return coaches.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q));
  }, [coaches, nameFilter]);

  // Invalid parameters state
  if (!clubId || !ageGroupId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invalid Page Parameters</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {!clubId && !ageGroupId && 'Club ID and Age Group ID are required to view this page.'}
              {!clubId && ageGroupId && 'Club ID is required to view this page.'}
              {clubId && !ageGroupId && 'Age Group ID is required to view this page.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              The URL may be malformed or contain invalid values.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {ageGroupLoading ? (
          <div className="animate-pulse mb-4">
            <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : ageGroup ? (
          <PageTitle
            title={`${ageGroup.name} - Coaches`}
            badge={coaches.length}
            subtitle={`Coaches assigned to teams in the ${ageGroup.name} age group`}
          />
        ) : (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load age group</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{ageGroupError}</p>
          </div>
        )}

        {/* Filter */}
        {!coachesLoading && !coachesError && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter coaches by name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="flex-1 py-0.5 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
              {nameFilter && (
                <button
                  onClick={() => setNameFilter('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Clear filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Coaches List */}
        {coachesError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 font-medium">Failed to load coaches</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{coachesError}</p>
          </div>
        ) : coachesLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0 animate-pulse">
                <div className="w-1 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : coaches.length > 0 && filteredCoaches.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">No coaches match "{nameFilter}"</p>
          </div>
        ) : filteredCoaches.length > 0 && clubId && ageGroupId ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 md:gap-0 md:bg-white md:dark:bg-gray-800 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:overflow-hidden">
            {filteredCoaches.map((coach) => (
              <Link key={coach.id} to={Routes.ageGroupCoach(clubId, ageGroupId, coach.id)}>
                <CoachCard coach={coach} />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserCog}
            title="No coaches assigned yet"
            description="Assign coaches to teams in this age group to see them here"
          />
        )}
      </main>
    </div>
  );
}
